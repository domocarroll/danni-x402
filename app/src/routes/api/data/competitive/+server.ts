import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CompetitiveData } from '$lib/types';
import { runActorSync, ACTORS, getCached, setCache, getFallbackCompetitive } from '$lib/data';
import type { ApifyDatasetItem } from '$lib/data';

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
	const body = await request.json();
	const brand = body.brand as string;
	const competitors = (body.competitors as string[]) ?? [];

	if (!brand) {
		return json({ error: 'Missing "brand" in request body' }, { status: 400 });
	}

	const key = cacheKey(brand, competitors);

	const cached = await getCached<CompetitiveData>(key);
	if (cached) return json(cached);

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
		return json(data);
	}

	const fallback = getFallbackCompetitive(brand);
	return json(fallback);
};
