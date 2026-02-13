import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import type { CompetitiveData } from '$lib/types';
import { runActorSync, ACTORS, getCached, setCache, getFallbackCompetitive } from '$lib/data';
import type { ApifyDatasetItem } from '$lib/data';

const CompetitiveRequestSchema = z.object({
	brand: z.string().min(1, 'Brand must be a non-empty string').max(200),
	competitors: z.array(z.string().min(1)).max(10).optional().default([])
});

function cacheKey(brand: string, competitors: string[]): string {
	return `competitive_${brand}_${competitors.sort().join('_')}`;
}

function parseApifyToCompetitive(brand: string, items: ApifyDatasetItem[]): CompetitiveData {
	const competitors = items.slice(0, 5).map((item) => ({
		name: String(item.title ?? item.name ?? 'Unknown'),
		positioning: String(item.description ?? item.text ?? ''),
		strengths: extractList(item, 'strengths'),
		weaknesses: extractList(item, 'weaknesses'),
		marketShare: item.marketShare ? String(item.marketShare) : undefined
	}));

	return {
		brand,
		competitors,
		sources: items.map((i) => String(i.url ?? i.source ?? 'apify')).filter(Boolean),
		fetchedAt: new Date().toISOString()
	};
}

function extractList(item: ApifyDatasetItem, field: string): string[] {
	const val = item[field];
	if (Array.isArray(val)) return val.map(String);
	if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
	return [];
}

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = CompetitiveRequestSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: parsed.error.issues[0].message }, { status: 400 });
	}

	const { brand, competitors } = parsed.data;

	try {
		const key = cacheKey(brand, competitors);

		const cached = await getCached<CompetitiveData>(key);
		if (cached) {
			return json(cached, {
				headers: { 'X-Request-Timeout': '45' }
			});
		}

		const searchQueries = [
			`${brand} competitors market analysis`,
			...competitors.map((c) => `${c} brand positioning strengths weaknesses`)
		];

		const items = await runActorSync({
			actorId: ACTORS.GOOGLE_SEARCH,
			input: {
				queries: searchQueries.join('\n'),
				maxPagesPerQuery: 1,
				resultsPerPage: 10
			},
			timeoutSecs: 45
		});

		if (items && items.length > 0) {
			const data = parseApifyToCompetitive(brand, items);
			await setCache(key, data);
			return json(data, {
				headers: { 'X-Request-Timeout': '45' }
			});
		}

		const fallback = getFallbackCompetitive(brand);
		return json(fallback, {
			headers: { 'X-Request-Timeout': '45', 'X-Data-Source': 'fallback' }
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Competitive data fetch failed';
		console.error('Competitive endpoint error:', message);

		// Return fallback data on any error so downstream consumers still function
		const fallback = getFallbackCompetitive(brand);
		return json(fallback, {
			headers: { 'X-Data-Source': 'fallback-error' }
		});
	}
};
