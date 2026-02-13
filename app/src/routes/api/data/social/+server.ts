import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/data/social
 * x402-protected: $5 USDC
 *
 * Returns social sentiment data for a brand.
 * Phase 3 (Data Broker) will wire Apify integration.
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const brand = body.brand as string;

	if (!brand) {
		return json({ error: 'Missing "brand" in request body' }, { status: 400 });
	}

	// TODO: Phase 3 - Wire Apify data broker
	return json({
		brand,
		sentiment: { positive: 0, neutral: 0, negative: 0 },
		themes: [],
		volume: 0,
		sources: [],
		fetchedAt: new Date().toISOString()
	});
};
