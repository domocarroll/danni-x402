import { describe, it, expect } from 'vitest';
import {
	IntentMandateSchema,
	CartMandateSchema,
	PaymentMandateSchema,
	PaymentReceiptSchema,
	PaymentStatusSchema,
	X402_METADATA_KEYS,
	AP2_EXTENSIONS,
} from './types.js';
import {
	buildCartMandate,
	validatePaymentMandate,
	isCartMandateExpired,
	buildPaymentReceipt,
	buildPaymentMetadata,
} from './x402-flow.js';

describe('AP2 Zod Schemas', () => {
	describe('IntentMandateSchema', () => {
		it('accepts valid intent mandate', () => {
			const result = IntentMandateSchema.safeParse({
				type: 'ap2.mandates.IntentMandate',
				skillId: 'brand-analysis',
				description: 'Analyze Notion',
			});
			expect(result.success).toBe(true);
		});

		it('accepts intent mandate with parameters', () => {
			const result = IntentMandateSchema.safeParse({
				type: 'ap2.mandates.IntentMandate',
				skillId: 'brand-analysis',
				description: 'Analyze Notion',
				parameters: { depth: 'full', competitors: ['Figma'] },
			});
			expect(result.success).toBe(true);
		});

		it('rejects missing skillId', () => {
			const result = IntentMandateSchema.safeParse({
				type: 'ap2.mandates.IntentMandate',
				description: 'Analyze Notion',
			});
			expect(result.success).toBe(false);
		});

		it('rejects missing description', () => {
			const result = IntentMandateSchema.safeParse({
				type: 'ap2.mandates.IntentMandate',
				skillId: 'brand-analysis',
			});
			expect(result.success).toBe(false);
		});

		it('rejects wrong type literal', () => {
			const result = IntentMandateSchema.safeParse({
				type: 'ap2.mandates.CartMandate',
				skillId: 'brand-analysis',
				description: 'test',
			});
			expect(result.success).toBe(false);
		});
	});

	describe('PaymentMandateSchema', () => {
		it('accepts valid payment mandate', () => {
			const result = PaymentMandateSchema.safeParse({
				type: 'ap2.mandates.PaymentMandate',
				paymentPayload: 'base64-eip3009-authorization',
			});
			expect(result.success).toBe(true);
		});

		it('accepts payment mandate with transactionHash', () => {
			const result = PaymentMandateSchema.safeParse({
				type: 'ap2.mandates.PaymentMandate',
				paymentPayload: 'base64-eip3009-authorization',
				transactionHash: '0xabc123',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.transactionHash).toBe('0xabc123');
			}
		});

		it('rejects missing paymentPayload', () => {
			const result = PaymentMandateSchema.safeParse({
				type: 'ap2.mandates.PaymentMandate',
			});
			expect(result.success).toBe(false);
		});
	});

	describe('CartMandateSchema', () => {
		it('accepts valid cart mandate', () => {
			const result = CartMandateSchema.safeParse({
				type: 'ap2.mandates.CartMandate',
				contents: {
					items: [
						{
							skillId: 'brand-analysis',
							description: 'Strategic Brand Analysis',
							price: '$100',
							network: 'eip155:84532',
							asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
						},
					],
					total: '$100',
				},
				paymentRequest: {
					payTo: '0x494Ee54AA00e645D27dC0dF4b7aaE707e235A544',
					network: 'eip155:84532',
					asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
					amount: '100000000',
					facilitator: 'https://x402.org/facilitator',
				},
			});
			expect(result.success).toBe(true);
		});
	});

	describe('PaymentReceiptSchema', () => {
		it('accepts valid receipt', () => {
			const result = PaymentReceiptSchema.safeParse({
				type: 'ap2.mandates.PaymentReceipt',
				transactionHash: '0xabc',
				network: 'eip155:84532',
				amount: '100000000',
				paidAt: new Date().toISOString(),
				status: 'payment-completed',
			});
			expect(result.success).toBe(true);
		});

		it('rejects invalid status', () => {
			const result = PaymentReceiptSchema.safeParse({
				type: 'ap2.mandates.PaymentReceipt',
				transactionHash: '0xabc',
				network: 'eip155:84532',
				amount: '100000000',
				paidAt: new Date().toISOString(),
				status: 'invalid-status',
			});
			expect(result.success).toBe(false);
		});
	});

	describe('PaymentStatusSchema', () => {
		it.each([
			'payment-required',
			'payment-submitted',
			'payment-verified',
			'payment-completed',
			'payment-failed',
		])('accepts %s', (status) => {
			expect(PaymentStatusSchema.safeParse(status).success).toBe(true);
		});

		it('rejects unknown status', () => {
			expect(PaymentStatusSchema.safeParse('pending').success).toBe(false);
		});
	});

	describe('constants', () => {
		it('defines all metadata keys', () => {
			expect(X402_METADATA_KEYS.STATUS).toBe('x402.payment.status');
			expect(X402_METADATA_KEYS.REQUIRED).toBe('x402.payment.required');
			expect(X402_METADATA_KEYS.PAYLOAD).toBe('x402.payment.payload');
			expect(X402_METADATA_KEYS.RECEIPTS).toBe('x402.payment.receipts');
		});

		it('defines extension URIs', () => {
			expect(AP2_EXTENSIONS.X402_V02).toContain('v0.2');
			expect(AP2_EXTENSIONS.AP2_V01).toContain('v0.1');
		});
	});
});

describe('x402-flow functions', () => {
	describe('buildCartMandate', () => {
		it('builds valid CartMandate for brand-analysis', () => {
			const cart = buildCartMandate('brand-analysis', '0xPayTo');
			expect(cart.type).toBe('ap2.mandates.CartMandate');
			expect(cart.contents.items).toHaveLength(1);
			expect(cart.contents.items[0].skillId).toBe('brand-analysis');
			expect(cart.contents.total).toBe('$100');
			expect(cart.paymentRequest.payTo).toBe('0xPayTo');
			expect(cart.paymentRequest.amount).toBe('100000000');
			expect(cart.paymentRequest.facilitator).toBe('https://x402.org/facilitator');
		});

		it('builds valid CartMandate for competitive-scan', () => {
			const cart = buildCartMandate('competitive-scan', '0xPayTo');
			expect(cart.contents.total).toBe('$5');
			expect(cart.paymentRequest.amount).toBe('5000000');
		});

		it('builds valid CartMandate for market-pulse', () => {
			const cart = buildCartMandate('market-pulse', '0xPayTo');
			expect(cart.contents.total).toBe('$5');
		});

		it('throws for unknown skill', () => {
			expect(() => buildCartMandate('nonexistent', '0xPayTo')).toThrow(
				/Unknown skill.*Available/,
			);
		});

		it('includes x402 v0.2 methodData with dual-chain payment requirements', () => {
			const cart = buildCartMandate('brand-analysis', '0xPayTo');
			expect(cart.paymentRequest.methodData?.x402.version).toBe('0.2');
			const reqs = cart.paymentRequest.methodData?.x402.paymentRequirements;
			expect(reqs).toHaveLength(2);
			expect(reqs![0].scheme).toBe('exact');
			expect(reqs![0].network).toBe('eip155:84532');
			expect(reqs![0].resource).toBe('/api/a2a');
			expect(reqs![1].network).toBe('eip155:1444673419');
			expect(reqs![1].description).toContain('SKALE');
		});

		it('sets expiresAt ~5 minutes in the future', () => {
			const cart = buildCartMandate('brand-analysis', '0xPayTo');
			expect(cart.expiresAt).toBeDefined();
			const expires = new Date(cart.expiresAt!).getTime();
			const now = Date.now();
			expect(expires).toBeGreaterThan(now);
			expect(expires).toBeLessThan(now + 6 * 60 * 1000);
		});

		it('output validates against CartMandateSchema', () => {
			const cart = buildCartMandate('brand-analysis', '0xPayTo');
			const result = CartMandateSchema.safeParse(cart);
			expect(result.success).toBe(true);
		});
	});

	describe('validatePaymentMandate', () => {
		it('validates a valid payment mandate', () => {
			const mandate = validatePaymentMandate({
				type: 'ap2.mandates.PaymentMandate',
				paymentPayload: 'valid-payload',
			});
			expect(mandate.paymentPayload).toBe('valid-payload');
		});

		it('throws for empty paymentPayload', () => {
			expect(() =>
				validatePaymentMandate({
					type: 'ap2.mandates.PaymentMandate',
					paymentPayload: '   ',
				}),
			).toThrow(/cannot be empty/);
		});

		it('throws for invalid schema', () => {
			expect(() => validatePaymentMandate({ type: 'wrong' })).toThrow();
		});
	});

	describe('isCartMandateExpired', () => {
		it('returns false for undefined expiresAt', () => {
			expect(isCartMandateExpired(undefined)).toBe(false);
		});

		it('returns false for future date', () => {
			const future = new Date(Date.now() + 60_000).toISOString();
			expect(isCartMandateExpired(future)).toBe(false);
		});

		it('returns true for past date', () => {
			const past = new Date(Date.now() - 60_000).toISOString();
			expect(isCartMandateExpired(past)).toBe(true);
		});
	});

	describe('buildPaymentReceipt', () => {
		it('builds receipt with correct fields', () => {
			const receipt = buildPaymentReceipt('0xtx', 'eip155:84532', '100000000');
			expect(receipt.type).toBe('ap2.mandates.PaymentReceipt');
			expect(receipt.transactionHash).toBe('0xtx');
			expect(receipt.network).toBe('eip155:84532');
			expect(receipt.amount).toBe('100000000');
			expect(receipt.status).toBe('payment-completed');
			expect(receipt.paidAt).toBeDefined();
		});

		it('validates against PaymentReceiptSchema', () => {
			const receipt = buildPaymentReceipt('0xtx', 'eip155:84532', '100000000');
			expect(PaymentReceiptSchema.safeParse(receipt).success).toBe(true);
		});
	});

	describe('buildPaymentMetadata', () => {
		it('sets status key', () => {
			const meta = buildPaymentMetadata('payment-required');
			expect(meta['x402.payment.status']).toBe('payment-required');
		});

		it('merges additional data', () => {
			const meta = buildPaymentMetadata('payment-completed', {
				'x402.payment.receipts': [{ hash: '0x' }],
			});
			expect(meta['x402.payment.status']).toBe('payment-completed');
			expect(meta['x402.payment.receipts']).toEqual([{ hash: '0x' }]);
		});
	});
});
