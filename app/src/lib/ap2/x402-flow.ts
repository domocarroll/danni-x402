import type { CartMandate, PaymentMandate, PaymentReceipt, PaymentStatus } from './types.js';
import { PaymentMandateSchema, X402_METADATA_KEYS } from './types.js';
import { PRICING, NETWORKS, USDC, FACILITATORS } from '$lib/config/index.js';

// ─── Skill Pricing Map ──────────────────────────────────────────────────────

const SKILL_PRICING: Record<string, { price: string; description: string }> = {
	'brand-analysis': { price: PRICING.BRAND_ANALYSIS, description: 'Strategic Brand Analysis' },
	'competitive-scan': { price: PRICING.DATA_ENDPOINT, description: 'Competitive Landscape Scan' },
	'market-pulse': { price: PRICING.DATA_ENDPOINT, description: 'Market Pulse' },
};

// ─── Build Cart Mandate ─────────────────────────────────────────────────────

export function buildCartMandate(skillId: string, payTo: string): CartMandate {
	const skill = SKILL_PRICING[skillId];
	if (!skill) {
		throw new Error(
			`Unknown skill: ${skillId}. Available: ${Object.keys(SKILL_PRICING).join(', ')}`,
		);
	}

	const priceNumeric = skill.price.replace('$', '');
	const maxAmountRequired = (parseFloat(priceNumeric) * 1_000_000).toString();

	return {
		type: 'ap2.mandates.CartMandate',
		contents: {
			items: [
				{
					skillId,
					description: skill.description,
					price: skill.price,
					network: NETWORKS.BASE_SEPOLIA,
					asset: USDC.BASE_SEPOLIA,
				},
			],
			total: skill.price,
		},
		paymentRequest: {
			payTo,
			network: NETWORKS.BASE_SEPOLIA,
			asset: USDC.BASE_SEPOLIA,
			amount: maxAmountRequired,
			facilitator: FACILITATORS.DEFAULT,
			methodData: {
				x402: {
					version: '0.2',
					paymentRequirements: [
						{
							scheme: 'exact',
							network: NETWORKS.BASE_SEPOLIA,
							maxAmountRequired,
							resource: '/api/a2a',
							description: skill.description,
							mimeType: 'application/json',
							payTo,
							maxTimeoutSeconds: 300,
						},
						{
							scheme: 'exact',
							network: NETWORKS.SKALE_EUROPA,
							maxAmountRequired,
							resource: '/api/a2a',
							description: `${skill.description} (SKALE — zero gas)`,
							mimeType: 'application/json',
							payTo,
							maxTimeoutSeconds: 300,
						},
					],
				},
			},
		},
		expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
		timestamp: new Date().toISOString(),
	};
}

// ─── Validate Payment Mandate ───────────────────────────────────────────────

export function validatePaymentMandate(data: unknown): PaymentMandate {
	const mandate = PaymentMandateSchema.parse(data);
	if (!mandate.paymentPayload.trim()) {
		throw new Error('PaymentMandate paymentPayload cannot be empty');
	}
	return mandate;
}

export function isCartMandateExpired(expiresAt: string | undefined): boolean {
	if (!expiresAt) return false;
	return new Date(expiresAt).getTime() < Date.now();
}

// ─── Build Payment Receipt ──────────────────────────────────────────────────

export function buildPaymentReceipt(
	transactionHash: string,
	network: string,
	amount: string,
): PaymentReceipt {
	return {
		type: 'ap2.mandates.PaymentReceipt',
		transactionHash,
		network,
		amount,
		paidAt: new Date().toISOString(),
		status: 'payment-completed',
	};
}

// ─── Build Payment Metadata ─────────────────────────────────────────────────

export function buildPaymentMetadata(
	status: PaymentStatus,
	data?: Record<string, unknown>,
): Record<string, unknown> {
	const metadata: Record<string, unknown> = {
		[X402_METADATA_KEYS.STATUS]: status,
	};
	if (data) {
		Object.assign(metadata, data);
	}
	return metadata;
}
