import { IntentMandateSchema, PaymentMandateSchema } from '$lib/ap2/index.js';

export type MandateResult = {
	kind: 'intent' | 'payment' | 'malformed' | 'none';
	data: unknown;
	error?: string;
};

export function extractMandate(
	parts: Array<{ type: string; [key: string]: unknown }>,
): MandateResult {
	for (const part of parts) {
		if (part.type !== 'data') continue;
		const payload = 'data' in part ? part.data : undefined;
		if (payload && typeof payload === 'object' && 'type' in (payload as Record<string, unknown>)) {
			const obj = payload as Record<string, unknown>;
			if (obj.type === 'ap2.mandates.IntentMandate') {
				const parsed = IntentMandateSchema.safeParse(obj);
				if (parsed.success) return { kind: 'intent', data: parsed.data };
				return {
					kind: 'malformed',
					data: null,
					error: `Invalid IntentMandate: ${parsed.error.message}`,
				};
			}
			if (obj.type === 'ap2.mandates.PaymentMandate') {
				const parsed = PaymentMandateSchema.safeParse(obj);
				if (parsed.success) return { kind: 'payment', data: parsed.data };
				return {
					kind: 'malformed',
					data: null,
					error: `Invalid PaymentMandate: ${parsed.error.message}`,
				};
			}
		}
	}
	return { kind: 'none', data: null };
}
