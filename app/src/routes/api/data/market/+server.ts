import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { MarketData } from '$lib/types';
import { runActorSync, ACTORS, getCached, setCache, getFallbackMarket } from '$lib/data';
import type { ApifyDatasetItem } from '$lib/data';

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
	const body = await request.json();
	const industry = body.industry as string;
	const region = (body.region as string) ?? 'US';

	if (!industry) {
		return json({ error: 'Missing "industry" in request body' }, { status: 400 });
	}

	const key = cacheKey(industry, region);

	const cached = await getCached<MarketData>(key);
	if (cached) return json(cached);

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
		return json(data);
	}

	const fallback = getFallbackMarket(industry);
	return json(fallback);
};
