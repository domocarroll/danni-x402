import { describe, it, expect } from 'vitest';
import {
	TERMINAL_STATES,
	A2A_ERROR_CODES,
	PAYMENT_ERROR_CODES,
	PartSchema,
	MessageSchema,
	JsonRpcRequestSchema,
	SendMessageParamsSchema,
	GetTaskParamsSchema,
	CancelTaskParamsSchema,
} from './types.js';

describe('TERMINAL_STATES', () => {
	it('includes completed, failed, canceled, rejected', () => {
		expect(TERMINAL_STATES).toContain('completed');
		expect(TERMINAL_STATES).toContain('failed');
		expect(TERMINAL_STATES).toContain('canceled');
		expect(TERMINAL_STATES).toContain('rejected');
	});

	it('does not include non-terminal states', () => {
		expect(TERMINAL_STATES).not.toContain('submitted');
		expect(TERMINAL_STATES).not.toContain('working');
		expect(TERMINAL_STATES).not.toContain('input-required');
	});
});

describe('A2A_ERROR_CODES', () => {
	it('defines standard JSON-RPC codes', () => {
		expect(A2A_ERROR_CODES.PARSE_ERROR).toBe(-32700);
		expect(A2A_ERROR_CODES.INVALID_REQUEST).toBe(-32600);
		expect(A2A_ERROR_CODES.METHOD_NOT_FOUND).toBe(-32601);
		expect(A2A_ERROR_CODES.INVALID_PARAMS).toBe(-32602);
		expect(A2A_ERROR_CODES.INTERNAL_ERROR).toBe(-32603);
	});

	it('defines A2A-specific codes in -32000 range', () => {
		expect(A2A_ERROR_CODES.TASK_NOT_FOUND).toBe(-32001);
		expect(A2A_ERROR_CODES.TASK_NOT_CANCELABLE).toBe(-32002);
		expect(A2A_ERROR_CODES.UNSUPPORTED_OPERATION).toBe(-32004);
	});
});

describe('PAYMENT_ERROR_CODES', () => {
	it('defines payment-specific codes in -32010 range', () => {
		expect(PAYMENT_ERROR_CODES.PAYMENT_REQUIRED).toBe(-32010);
		expect(PAYMENT_ERROR_CODES.PAYMENT_INVALID).toBe(-32011);
		expect(PAYMENT_ERROR_CODES.PAYMENT_EXPIRED).toBe(-32012);
		expect(PAYMENT_ERROR_CODES.PAYMENT_FAILED).toBe(-32013);
	});

	it('does not overlap with A2A error codes', () => {
		const a2aCodes = Object.values(A2A_ERROR_CODES);
		const paymentCodes = Object.values(PAYMENT_ERROR_CODES);
		for (const code of paymentCodes) {
			expect(a2aCodes).not.toContain(code);
		}
	});
});

describe('PartSchema', () => {
	it('accepts text part', () => {
		expect(PartSchema.safeParse({ type: 'text', text: 'hello' }).success).toBe(true);
	});

	it('accepts data part', () => {
		expect(PartSchema.safeParse({ type: 'data', mimeType: 'application/json', data: { key: 'value' } }).success).toBe(true);
	});

	it('accepts file part', () => {
		expect(PartSchema.safeParse({ type: 'file', mimeType: 'application/pdf', url: 'https://example.com/file.pdf' }).success).toBe(true);
	});

	it('rejects unknown part type', () => {
		expect(PartSchema.safeParse({ type: 'image', url: 'test' }).success).toBe(false);
	});
});

describe('MessageSchema', () => {
	it('accepts user message with text part', () => {
		const result = MessageSchema.safeParse({
			role: 'user',
			parts: [{ type: 'text', text: 'Analyze Notion' }],
		});
		expect(result.success).toBe(true);
	});

	it('accepts agent message with metadata', () => {
		const result = MessageSchema.safeParse({
			role: 'agent',
			parts: [{ type: 'text', text: 'Analysis complete' }],
			metadata: { 'x402.payment.status': 'payment-completed' },
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty parts array', () => {
		const result = MessageSchema.safeParse({ role: 'user', parts: [] });
		expect(result.success).toBe(false);
	});

	it('rejects invalid role', () => {
		const result = MessageSchema.safeParse({
			role: 'system',
			parts: [{ type: 'text', text: 'test' }],
		});
		expect(result.success).toBe(false);
	});
});

describe('JsonRpcRequestSchema', () => {
	it('accepts valid request with string id', () => {
		expect(JsonRpcRequestSchema.safeParse({ jsonrpc: '2.0', id: 'req-1', method: 'SendMessage' }).success).toBe(true);
	});

	it('accepts valid request with numeric id', () => {
		expect(JsonRpcRequestSchema.safeParse({ jsonrpc: '2.0', id: 42, method: 'GetTask' }).success).toBe(true);
	});

	it('rejects wrong jsonrpc version', () => {
		expect(JsonRpcRequestSchema.safeParse({ jsonrpc: '1.0', id: 1, method: 'test' }).success).toBe(false);
	});

	it('rejects missing method', () => {
		expect(JsonRpcRequestSchema.safeParse({ jsonrpc: '2.0', id: 1 }).success).toBe(false);
	});
});

describe('SendMessageParamsSchema', () => {
	const validMessage = {
		role: 'user' as const,
		parts: [{ type: 'text' as const, text: 'test' }],
	};

	it('accepts message only', () => {
		expect(SendMessageParamsSchema.safeParse({ message: validMessage }).success).toBe(true);
	});

	it('accepts message with contextId', () => {
		const result = SendMessageParamsSchema.safeParse({
			message: validMessage,
			contextId: 'ctx-123',
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.contextId).toBe('ctx-123');
		}
	});

	it('accepts message with configuration', () => {
		expect(SendMessageParamsSchema.safeParse({
			message: validMessage,
			configuration: { blocking: true, historyLength: 10 },
		}).success).toBe(true);
	});

	it('rejects missing message', () => {
		expect(SendMessageParamsSchema.safeParse({}).success).toBe(false);
	});
});

describe('GetTaskParamsSchema', () => {
	it('accepts valid id', () => {
		expect(GetTaskParamsSchema.safeParse({ id: 'task-uuid' }).success).toBe(true);
	});

	it('accepts id with historyLength', () => {
		expect(GetTaskParamsSchema.safeParse({ id: 'task-uuid', historyLength: 5 }).success).toBe(true);
	});

	it('rejects missing id', () => {
		expect(GetTaskParamsSchema.safeParse({}).success).toBe(false);
	});
});

describe('CancelTaskParamsSchema', () => {
	it('accepts valid id', () => {
		expect(CancelTaskParamsSchema.safeParse({ id: 'task-uuid' }).success).toBe(true);
	});

	it('rejects missing id', () => {
		expect(CancelTaskParamsSchema.safeParse({}).success).toBe(false);
	});
});
