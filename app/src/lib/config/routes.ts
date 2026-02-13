import type { RoutesConfig } from '@x402/core/server';
import { NETWORKS, PRICING } from './constants.js';
import { env } from '$env/dynamic/private';

export function getRoutes(): RoutesConfig {
	const payTo = env.WALLET_ADDRESS ?? '0x0000000000000000000000000000000000000000';

	return {
		'POST /api/danni/analyze': {
			accepts: {
				scheme: 'exact',
				payTo,
				price: PRICING.BRAND_ANALYSIS,
				network: NETWORKS.BASE_SEPOLIA
			},
			description: 'Premium brand strategy analysis by Danni',
			mimeType: 'application/json'
		},
		'POST /api/data/competitive': {
			accepts: {
				scheme: 'exact',
				payTo,
				price: PRICING.DATA_ENDPOINT,
				network: NETWORKS.BASE_SEPOLIA
			},
			description: 'Competitive landscape analysis',
			mimeType: 'application/json'
		},
		'POST /api/data/social': {
			accepts: {
				scheme: 'exact',
				payTo,
				price: PRICING.DATA_ENDPOINT,
				network: NETWORKS.BASE_SEPOLIA
			},
			description: 'Social sentiment analysis',
			mimeType: 'application/json'
		},
		'POST /api/data/market': {
			accepts: {
				scheme: 'exact',
				payTo,
				price: PRICING.DATA_ENDPOINT,
				network: NETWORKS.BASE_SEPOLIA
			},
			description: 'Industry market dynamics',
			mimeType: 'application/json'
		}
	};
}
