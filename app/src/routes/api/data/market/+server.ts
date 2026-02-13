import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import type { MarketData } from '$lib/types';
import { runActorSync, ACTORS, getCached, setCache, getFallbackMarket } from '$lib/data';
import type { ApifyDatasetItem } from '$lib/data';

const MarketRequestSchema = z.object({
	industry: z.string().min(1, 'Industry must be a non-empty string').max(200),
	region: z.string().min(1).max(10).optional().default('US')
});

function cacheKey(industry: string, region: string): string {
	return `market_${industry}_${region}`;
}

function parseApifyToMarket(industry: string, items: ApifyDatasetItem[]): MarketData {
	const trendNames = items
		.filter((item) => item.query || item.keyword || item.title)
		.map((item) => String(item.query ?? item.keyword ?? item.title))
		.slice(0, 8);

	const interestValues = items
		.filter((item) => typeof item.interest === 'number' || typeof item.value === 'number')
		.map((item) => Number(item.interest ?? item.value ?? 0));

	const avgInterest = interestValues.length > 0
		? Math.round(interestValues.reduce((a, b) => a + b, 0) / interestValues.length)
		: 0;

	const growthIndicator = avgInterest > 60 ? 'High' : avgInterest > 30 ? 'Moderate' : 'Low';

	return {
		industry,
		marketSize: `Trend interest index: ${avgInterest}/100`,
		growthRate: `${growthIndicator} growth trajectory`,
		trends: trendNames.length > 0 ? trendNames : [`${industry} trending topics unavailable`],
		keyPlayers: extractKeyPlayers(items),
		sources: items.slice(0, 3).map((i) => String(i.url ?? i.source ?? 'google-trends')).filter(Boolean),
		fetchedAt: new Date().toISOString()
	};
}

function extractKeyPlayers(items: ApifyDatasetItem[]): string[] {
	const players = new Set<string>();
	for (const item of items) {
		const related = item.relatedQueries ?? item.relatedTopics;
		if (Array.isArray(related)) {
			related.slice(0, 3).forEach((r: unknown) => {
				if (typeof r === 'string') players.add(r);
				else if (r && typeof r === 'object' && 'title' in r) players.add(String((r as Record<string, unknown>).title));
			});
		}
	}
	return [...players].slice(0, 7);
}

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = MarketRequestSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: parsed.error.issues[0].message }, { status: 400 });
	}

	const { industry, region } = parsed.data;

	try {
		const key = cacheKey(industry, region);

		const cached = await getCached<MarketData>(key);
		if (cached) {
			return json(cached, {
				headers: { 'X-Request-Timeout': '45' }
			});
		}

		const items = await runActorSync({
			actorId: ACTORS.GOOGLE_TRENDS,
			input: {
				searchTerms: [industry],
				geo: region,
				timeRange: 'past12Months',
				isMultiple: false
			},
			timeoutSecs: 45
		});

		if (items && items.length > 0) {
			const data = parseApifyToMarket(industry, items);
			await setCache(key, data);
			return json(data, {
				headers: { 'X-Request-Timeout': '45' }
			});
		}

		const fallback = getFallbackMarket(industry);
		return json(fallback, {
			headers: { 'X-Request-Timeout': '45', 'X-Data-Source': 'fallback' }
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Market data fetch failed';
		console.error('Market endpoint error:', message);

		const fallback = getFallbackMarket(industry);
		return json(fallback, {
			headers: { 'X-Data-Source': 'fallback-error' }
		});
	}
};
