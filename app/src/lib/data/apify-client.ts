const APIFY_BASE = 'https://api.apify.com/v2';

interface ApifyRunInput {
	actorId: string;
	input: Record<string, unknown>;
	timeoutSecs?: number;
	memoryMbytes?: number;
}

export interface ApifyDatasetItem {
	[key: string]: unknown;
}

function getApiKey(): string {
	const key = process.env.APIFY_API_KEY ?? '';
	if (!key) console.warn('[apify] APIFY_API_KEY not set');
	return key;
}

/**
 * Runs an Apify actor synchronously, returns dataset items.
 * Returns null on any failure so callers fall back to cache/demo data.
 */
export async function runActorSync(
	config: ApifyRunInput
): Promise<ApifyDatasetItem[] | null> {
	const url = `${APIFY_BASE}/acts/${config.actorId}/run-sync-get-dataset-items`;

	const params = new URLSearchParams({
		token: getApiKey(),
		timeout: String(config.timeoutSecs ?? 60)
	});
	if (config.memoryMbytes) {
		params.set('memory', String(config.memoryMbytes));
	}

	try {
		const response = await fetch(`${url}?${params}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(config.input),
			signal: AbortSignal.timeout(90_000)
		});

		if (!response.ok) {
			console.error(
				`[apify] Actor ${config.actorId} failed: ${response.status} ${response.statusText}`
			);
			return null;
		}

		const items: ApifyDatasetItem[] = await response.json();
		return items;
	} catch (err) {
		console.error(`[apify] Actor ${config.actorId} error:`, err);
		return null;
	}
}

export const ACTORS = {
	WEB_SCRAPER: 'apify/web-scraper',
	GOOGLE_SEARCH: 'apify/google-search-scraper',
	TWITTER_SCRAPER: 'quacker/twitter-scraper',
	GOOGLE_TRENDS: 'emastra/google-trends-scraper',
	INSTAGRAM_SCRAPER: 'apify/instagram-scraper'
} as const;
