import { z } from 'zod';

// ─── Payment Status ─────────────────────────────────────────────────────────

export const PaymentStatusSchema = z.enum([
	'payment-required',
	'payment-submitted',
	'payment-verified',
	'payment-completed',
	'payment-failed',
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// ─── x402 Metadata Keys ────────────────────────────────────────────────────

export const X402_METADATA_KEYS = {
	STATUS: 'x402.payment.status',
	REQUIRED: 'x402.payment.required',
	PAYLOAD: 'x402.payment.payload',
	RECEIPTS: 'x402.payment.receipts',
} as const;

// ─── AP2 Extension URIs ────────────────────────────────────────────────────

export const AP2_EXTENSIONS = {
	X402_V02: 'https://github.com/google-agentic-commerce/a2a-x402/blob/main/spec/v0.2',
	AP2_V01: 'https://github.com/google-agentic-commerce/ap2/tree/v0.1',
} as const;

// ─── Intent Mandate ─────────────────────────────────────────────────────────

export const IntentMandateSchema = z.object({
	type: z.literal('ap2.mandates.IntentMandate'),
	description: z.string(),
	skillId: z.string(),
	parameters: z.record(z.string(), z.unknown()).optional(),
	intentExpiry: z.string().optional(),
	userCartConfirmationRequired: z.boolean().optional(),
});
export type IntentMandate = z.infer<typeof IntentMandateSchema>;

// ─── Cart Contents ──────────────────────────────────────────────────────────

export const CartItemSchema = z.object({
	skillId: z.string(),
	description: z.string(),
	price: z.string(),
	network: z.string(),
	asset: z.string(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CartContentsSchema = z.object({
	items: z.array(CartItemSchema),
	total: z.string(),
});
export type CartContents = z.infer<typeof CartContentsSchema>;

// ─── x402 Payment Requirements (embedded in CartMandate) ────────────────────

export const X402PaymentRequirementSchema = z.object({
	scheme: z.string(),
	network: z.string(),
	maxAmountRequired: z.string(),
	resource: z.string(),
	description: z.string(),
	mimeType: z.string().optional(),
	payTo: z.string(),
	maxTimeoutSeconds: z.number(),
	outputSchema: z.unknown().optional(),
});

export const PaymentRequestSchema = z.object({
	payTo: z.string(),
	network: z.string(),
	asset: z.string(),
	amount: z.string(),
	facilitator: z.string(),
	methodData: z
		.object({
			x402: z.object({
				version: z.string(),
				paymentRequirements: z.array(X402PaymentRequirementSchema),
			}),
		})
		.optional(),
});
export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;

// ─── Cart Mandate ───────────────────────────────────────────────────────────

export const CartMandateSchema = z.object({
	type: z.literal('ap2.mandates.CartMandate'),
	contents: CartContentsSchema,
	paymentRequest: PaymentRequestSchema,
	expiresAt: z.string().optional(),
	merchantSignature: z.string().optional(),
	timestamp: z.string().optional(),
});
export type CartMandate = z.infer<typeof CartMandateSchema>;

// ─── Payment Mandate ────────────────────────────────────────────────────────

export const PaymentMandateSchema = z.object({
	type: z.literal('ap2.mandates.PaymentMandate'),
	paymentPayload: z.string(),
	transactionHash: z.string().optional(),
	userAuthorization: z.string().optional(),
});
export type PaymentMandate = z.infer<typeof PaymentMandateSchema>;

// ─── Payment Receipt ────────────────────────────────────────────────────────

export const PaymentReceiptSchema = z.object({
	type: z.literal('ap2.mandates.PaymentReceipt'),
	transactionHash: z.string(),
	network: z.string(),
	amount: z.string(),
	paidAt: z.string(),
	status: PaymentStatusSchema,
});
export type PaymentReceipt = z.infer<typeof PaymentReceiptSchema>;
