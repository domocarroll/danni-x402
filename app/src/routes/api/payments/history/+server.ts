import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/payments/history
 * NOT x402-protected (public endpoint)
 *
 * Returns payment transaction history for display in dashboard.
 */
export const GET: RequestHandler = async () => {
	// TODO: Phase 6 - Wire to transaction store
	return json([]);
};
