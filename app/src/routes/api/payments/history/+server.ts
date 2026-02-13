import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTransactions } from '$lib/payments/transaction-store.js';

/**
 * GET /api/payments/history
 * NOT x402-protected (public endpoint)
 *
 * Returns payment transaction history for display in dashboard.
 */
export const GET: RequestHandler = async () => {
	return json(getTransactions());
};
