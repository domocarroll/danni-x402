import { sequence } from '@sveltejs/kit/hooks';
import { createPaymentHook } from '$lib/x402/index.js';
import { getRoutes, NETWORKS } from '$lib/config/index.js';
import { ExactEvmScheme } from '@x402/evm/exact/server';

const paymentHook = createPaymentHook({
	routes: getRoutes(),
	schemes: [
		{ network: NETWORKS.BASE_SEPOLIA, server: new ExactEvmScheme() }
	]
});

export const handle = sequence(paymentHook);
