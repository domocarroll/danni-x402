import { describe, it, expect } from 'vitest';
import { extractMandate } from './extract-mandate.js';

describe('extractMandate', () => {
	describe('IntentMandate detection', () => {
		it('detects valid IntentMandate in data part', () => {
			const result = extractMandate([
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.IntentMandate',
						skillId: 'brand-analysis',
						description: 'Analyze Notion',
					},
				},
			]);
			expect(result.kind).toBe('intent');
			expect((result.data as { skillId: string }).skillId).toBe('brand-analysis');
		});

		it('detects IntentMandate with parameters', () => {
			const result = extractMandate([
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.IntentMandate',
						skillId: 'brand-analysis',
						description: 'test',
						parameters: { depth: 'full' },
					},
				},
			]);
			expect(result.kind).toBe('intent');
		});

		it('returns malformed for IntentMandate missing skillId', () => {
			const result = extractMandate([
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.IntentMandate',
						description: 'Analyze Notion',
					},
				},
			]);
			expect(result.kind).toBe('malformed');
			expect(result.error).toContain('Invalid IntentMandate');
		});

		it('returns malformed for IntentMandate missing description', () => {
			const result = extractMandate([
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.IntentMandate',
						skillId: 'brand-analysis',
					},
				},
			]);
			expect(result.kind).toBe('malformed');
		});
	});

	describe('PaymentMandate detection', () => {
		it('detects valid PaymentMandate', () => {
			const result = extractMandate([
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.PaymentMandate',
						paymentPayload: 'eip3009-auth-base64',
					},
				},
			]);
			expect(result.kind).toBe('payment');
			expect((result.data as { paymentPayload: string }).paymentPayload).toBe('eip3009-auth-base64');
		});

		it('detects PaymentMandate with transactionHash', () => {
			const result = extractMandate([
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.PaymentMandate',
						paymentPayload: 'auth-data',
						transactionHash: '0xabc123',
					},
				},
			]);
			expect(result.kind).toBe('payment');
			expect((result.data as { transactionHash: string }).transactionHash).toBe('0xabc123');
		});

		it('returns malformed for PaymentMandate missing paymentPayload', () => {
			const result = extractMandate([
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.PaymentMandate',
					},
				},
			]);
			expect(result.kind).toBe('malformed');
			expect(result.error).toContain('Invalid PaymentMandate');
		});
	});

	describe('non-mandate messages', () => {
		it('returns none for plain text parts', () => {
			const result = extractMandate([
				{ type: 'text', text: 'Analyze the brand positioning of Notion' },
			]);
			expect(result.kind).toBe('none');
		});

		it('returns none for empty parts array', () => {
			const result = extractMandate([]);
			expect(result.kind).toBe('none');
		});

		it('returns none for data part without type field', () => {
			const result = extractMandate([
				{
					type: 'data',
					mimeType: 'application/json',
					data: { foo: 'bar' },
				},
			]);
			expect(result.kind).toBe('none');
		});

		it('returns none for data part with unknown mandate type', () => {
			const result = extractMandate([
				{
					type: 'data',
					mimeType: 'application/json',
					data: { type: 'ap2.mandates.UnknownMandate', foo: 'bar' },
				},
			]);
			expect(result.kind).toBe('none');
		});

		it('returns none for file parts', () => {
			const result = extractMandate([
				{ type: 'file', mimeType: 'application/pdf', url: 'https://example.com/file.pdf' },
			]);
			expect(result.kind).toBe('none');
		});
	});

	describe('mixed parts', () => {
		it('finds IntentMandate among mixed parts', () => {
			const result = extractMandate([
				{ type: 'text', text: 'Please analyze this brand' },
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.IntentMandate',
						skillId: 'competitive-scan',
						description: 'Scan competitors for Figma',
					},
				},
			]);
			expect(result.kind).toBe('intent');
			expect((result.data as { skillId: string }).skillId).toBe('competitive-scan');
		});

		it('finds PaymentMandate among mixed parts', () => {
			const result = extractMandate([
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.PaymentMandate',
						paymentPayload: 'signed-auth',
						transactionHash: '0xdef456',
					},
				},
				{ type: 'text', text: 'Analyze brand positioning of Notion' },
			]);
			expect(result.kind).toBe('payment');
		});

		it('returns first mandate found (intent before payment)', () => {
			const result = extractMandate([
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.IntentMandate',
						skillId: 'brand-analysis',
						description: 'test',
					},
				},
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.PaymentMandate',
						paymentPayload: 'auth',
					},
				},
			]);
			expect(result.kind).toBe('intent');
		});
	});

	describe('edge cases', () => {
		it('handles data part with null data', () => {
			const result = extractMandate([
				{ type: 'data', mimeType: 'application/json', data: null },
			]);
			expect(result.kind).toBe('none');
		});

		it('handles data part with primitive data', () => {
			const result = extractMandate([
				{ type: 'data', mimeType: 'application/json', data: 'string-data' },
			]);
			expect(result.kind).toBe('none');
		});

		it('handles data part with array data', () => {
			const result = extractMandate([
				{ type: 'data', mimeType: 'application/json', data: [1, 2, 3] },
			]);
			expect(result.kind).toBe('none');
		});
	});
});
