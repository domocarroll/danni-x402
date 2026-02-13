import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SocialData } from '$lib/types';
import { runActorSync, ACTORS, getCached, setCache, getFallbackSocial } from '$lib/data';
import type { ApifyDatasetItem } from '$lib/data';

function cacheKey(brand: string, platforms: string[]): string {
	return `social_${brand}_${platforms.sort().join('_')}`;
}

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
	const lower = text.toLowerCase();
	const positiveWords = ['love', 'great', 'amazing', 'best', 'excellent', 'awesome', 'perfect', 'fantastic'];
	const negativeWords = ['hate', 'bad', 'worst', 'terrible', 'awful', 'poor', 'disappointing', 'broken'];
	const posCount = positiveWords.filter((w) => lower.includes(w)).length;
	const negCount = negativeWords.filter((w) => lower.includes(w)).length;
	if (posCount > negCount) return 'positive';
	if (negCount > posCount) return 'negative';
	return 'neutral';
}

function parseApifyToSocial(brand: string, items: ApifyDatasetItem[]): SocialData {
	let positive = 0;
	let neutral = 0;
	let negative = 0;
	const themeSet = new Set<string>();

	for (const item of items) {
		const text = String(item.text ?? item.description ?? item.title ?? '');
		const sent = analyzeSentiment(text);
		if (sent === 'positive') positive++;
		else if (sent === 'negative') negative++;
		else neutral++;

		const hashtags = item.hashtags;
		if (Array.isArray(hashtags)) {
			hashtags.slice(0, 3).forEach((h: unknown) => themeSet.add(String(h)));
		}
	}

	const total = positive + neutral + negative || 1;

	return {
		brand,
		sentiment: {
			positive: Math.round((positive / total) * 100) / 100,
			neutral: Math.round((neutral / total) * 100) / 100,
			negative: Math.round((negative / total) * 100) / 100
		},
		themes: [...themeSet].slice(0, 10),
		volume: items.length,
		sources: items.slice(0, 5).map((i) => String(i.url ?? i.source ?? 'apify')).filter(Boolean),
		fetchedAt: new Date().toISOString()
	};
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const brand = body.brand as string;
	const platforms = (body.platforms as string[]) ?? [];

	if (!brand) {
		return json({ error: 'Missing "brand" in request body' }, { status: 400 });
	}

	const key = cacheKey(brand, platforms);

	const cached = await getCached<SocialData>(key);
	if (cached) return json(cached);

	const items = await runActorSync({
		actorId: ACTORS.TWITTER_SCRAPER,
		input: {
			searchTerms: [brand],
			maxTweets: 50,
			sort: 'Latest'
		},
		timeoutSecs: 45
	});

	if (items && items.length > 0) {
		const data = parseApifyToSocial(brand, items);
		await setCache(key, data);
		return json(data);
	}

	const fallback = getFallbackSocial(brand);
	return json(fallback);
};
