import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import type { SocialData } from '$lib/types';
import { runActorSync, ACTORS, getCached, setCache, getFallbackSocial } from '$lib/data';
import type { ApifyDatasetItem } from '$lib/data';

const SocialRequestSchema = z.object({
	brand: z.string().min(1, 'Brand must be a non-empty string').max(200),
	platforms: z.array(z.string().min(1)).max(10).optional().default([])
});

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
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = SocialRequestSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: parsed.error.issues[0].message }, { status: 400 });
	}

	const { brand, platforms } = parsed.data;

	try {
		const key = cacheKey(brand, platforms);

		const cached = await getCached<SocialData>(key);
		if (cached) {
			return json(cached, {
				headers: { 'X-Request-Timeout': '45' }
			});
		}

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
			return json(data, {
				headers: { 'X-Request-Timeout': '45' }
			});
		}

		const fallback = getFallbackSocial(brand);
		return json(fallback, {
			headers: { 'X-Request-Timeout': '45', 'X-Data-Source': 'fallback' }
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Social data fetch failed';
		console.error('Social endpoint error:', message);

		const fallback = getFallbackSocial(brand);
		return json(fallback, {
			headers: { 'X-Data-Source': 'fallback-error' }
		});
	}
};
