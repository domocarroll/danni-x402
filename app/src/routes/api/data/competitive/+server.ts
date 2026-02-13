import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/data/competitive
 * x402-protected: $5 USDC
 *
 * Returns competitive landscape data for a brand.
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
		competitors: [],
		sources: [],
		fetchedAt: new Date().toISOString()
	});
};
