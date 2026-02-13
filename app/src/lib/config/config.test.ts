import { describe, it, expect } from 'vitest';
import { NETWORKS, USDC, FACILITATORS, PRICING, SKALE } from './constants.js';

describe('Network Constants', () => {
	it('BASE_SEPOLIA follows CAIP-2 format', () => {
		expect(NETWORKS.BASE_SEPOLIA).toBe('eip155:84532');
	});

	it('SKALE_EUROPA follows CAIP-2 format', () => {
		expect(NETWORKS.SKALE_EUROPA).toBe('eip155:1444673419');
	});
});

describe('USDC Addresses', () => {
	it('BASE_SEPOLIA is valid hex address', () => {
		expect(USDC.BASE_SEPOLIA).toMatch(/^0x[0-9a-fA-F]{40}$/);
	});

	it('SKALE_EUROPA is valid hex address', () => {
		expect(USDC.SKALE_EUROPA).toMatch(/^0x[0-9a-fA-F]{40}$/);
	});
});

describe('Facilitators', () => {
	it('DEFAULT is x402.org', () => {
		expect(FACILITATORS.DEFAULT).toBe('https://x402.org/facilitator');
	});

	it('KOBARU is gateway.kobaru.io', () => {
		expect(FACILITATORS.KOBARU).toBe('https://gateway.kobaru.io');
	});

	it('all facilitators are valid HTTPS URLs', () => {
		for (const url of Object.values(FACILITATORS)) {
			expect(url).toMatch(/^https:\/\//);
		}
	});
});

describe('Pricing', () => {
	it('BRAND_ANALYSIS is $100', () => {
		expect(PRICING.BRAND_ANALYSIS).toBe('$100');
	});

	it('DATA_ENDPOINT is $5', () => {
		expect(PRICING.DATA_ENDPOINT).toBe('$5');
	});
});

describe('SKALE Configuration', () => {
	it('EUROPA_HUB has correct chainId', () => {
		expect(SKALE.EUROPA_HUB.chainId).toBe(1444673419);
	});

	it('EUROPA_HUB network matches NETWORKS constant', () => {
		expect(SKALE.EUROPA_HUB.network).toBe(NETWORKS.SKALE_EUROPA);
	});

	it('EUROPA_HUB has valid RPC endpoint', () => {
		expect(SKALE.EUROPA_HUB.rpc).toMatch(/^https:\/\//);
	});

	it('EUROPA_HUB USDC matches USDC constant', () => {
		expect(SKALE.EUROPA_HUB.usdc).toBe(USDC.SKALE_EUROPA);
	});

	it('BASE_SEPOLIA_TESTNET has distinct chainId', () => {
		expect(SKALE.BASE_SEPOLIA_TESTNET.chainId).toBe(324705682);
		expect(SKALE.BASE_SEPOLIA_TESTNET.chainId).not.toBe(SKALE.EUROPA_HUB.chainId);
	});
});
