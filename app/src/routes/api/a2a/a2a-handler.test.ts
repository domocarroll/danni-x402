import { describe, it, expect, vi, beforeEach } from 'vitest';
import { A2A_ERROR_CODES, PAYMENT_ERROR_CODES } from '$lib/a2a/types.js';

vi.mock('$env/dynamic/private', () => ({
	env: { WALLET_ADDRESS: '0xTestWallet' },
}));

vi.mock('$lib/swarm/orchestrator.js', () => ({
	executeSwarm: vi.fn().mockResolvedValue({
		analysis: { synthesis: 'Mock synthesis result' },
		agents: [],
	}),
}));

vi.mock('$lib/erc8004/index.js', () => ({
	submitPaymentFeedback: vi.fn().mockResolvedValue(undefined),
	getAgentId: vi.fn().mockResolvedValue(0n),
}));

async function callA2A(body: unknown) {
	const { POST } = await import('./+server.js');
	const request = new Request('http://localhost/api/a2a', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	const response = await POST({ request } as Parameters<typeof POST>[0]);
	return response.json();
}

function rpc(method: string, params: unknown, id: string | number = 1) {
	return { jsonrpc: '2.0', id, method, params };
}

function intentMessage(skillId: string, description: string) {
	return {
		message: {
			role: 'user',
			parts: [
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.IntentMandate',
						skillId,
						description,
					},
				},
			],
		},
	};
}

function paymentMessage(payload: string, txHash?: string) {
	return {
		message: {
			role: 'user',
			parts: [
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						type: 'ap2.mandates.PaymentMandate',
						paymentPayload: payload,
						...(txHash ? { transactionHash: txHash } : {}),
					},
				},
				{ type: 'text', text: 'Analyze Notion brand positioning' },
			],
		},
	};
}

function plainTextMessage(text: string) {
	return {
		message: {
			role: 'user',
			parts: [{ type: 'text', text }],
		},
	};
}

describe('A2A Handler', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('JSON-RPC validation', () => {
		it('returns PARSE_ERROR for invalid JSON', async () => {
			const { POST } = await import('./+server.js');
			const request = new Request('http://localhost/api/a2a', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: 'not json {{{',
			});
			const response = await POST({ request } as Parameters<typeof POST>[0]);
			const data = await response.json();
			expect(data.error.code).toBe(A2A_ERROR_CODES.PARSE_ERROR);
		});

		it('returns INVALID_REQUEST for missing jsonrpc field', async () => {
			const result = await callA2A({ id: 1, method: 'GetTask', params: {} });
			expect(result.error.code).toBe(A2A_ERROR_CODES.INVALID_REQUEST);
		});

		it('returns INVALID_REQUEST for wrong jsonrpc version', async () => {
			const result = await callA2A({ jsonrpc: '1.0', id: 1, method: 'GetTask', params: {} });
			expect(result.error.code).toBe(A2A_ERROR_CODES.INVALID_REQUEST);
		});

		it('returns UNSUPPORTED_OPERATION for unknown method', async () => {
			const result = await callA2A(rpc('FooBar', {}));
			expect(result.error.code).toBe(A2A_ERROR_CODES.UNSUPPORTED_OPERATION);
			expect(result.error.message).toContain('FooBar');
		});
	});

	describe('SendMessage — IntentMandate', () => {
		it('returns CartMandate and input-required state for brand-analysis', async () => {
			const result = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Analyze Notion')));
			const task = result.result.task;
			expect(task.status.state).toBe('input-required');
			expect(task.contextId).toBeDefined();
			expect(task.artifacts).toHaveLength(1);
			expect(task.artifacts[0].name).toBe('cart-mandate');
		});

		it('accepts message/send alias', async () => {
			const result = await callA2A(rpc('message/send', intentMessage('brand-analysis', 'Test')));
			expect(result.result.task.status.state).toBe('input-required');
		});

		it('builds correct CartMandate for brand-analysis ($100)', async () => {
			const result = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Analyze Notion')));
			const cartPart = result.result.task.artifacts[0].parts[0];
			expect(cartPart.data.contents.total).toBe('$100');
			expect(cartPart.data.paymentRequest.amount).toBe('100000000');
			expect(cartPart.data.paymentRequest.payTo).toBe('0xTestWallet');
		});

		it('builds correct CartMandate for competitive-scan ($5)', async () => {
			const result = await callA2A(rpc('SendMessage', intentMessage('competitive-scan', 'Scan Figma')));
			const cartPart = result.result.task.artifacts[0].parts[0];
			expect(cartPart.data.contents.total).toBe('$5');
			expect(cartPart.data.paymentRequest.amount).toBe('5000000');
		});

		it('includes x402 v0.2 with dual-chain payment requirements', async () => {
			const result = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Test')));
			const cartData = result.result.task.artifacts[0].parts[0].data;
			expect(cartData.paymentRequest.methodData.x402.version).toBe('0.2');
			const reqs = cartData.paymentRequest.methodData.x402.paymentRequirements;
			expect(reqs).toHaveLength(2);
			expect(reqs[0].network).toBe('eip155:84532');
			expect(reqs[1].network).toBe('eip155:1444673419');
		});

		it('sets expiresAt and timestamp on CartMandate', async () => {
			const result = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Test')));
			const cartData = result.result.task.artifacts[0].parts[0].data;
			expect(cartData.expiresAt).toBeDefined();
			expect(cartData.timestamp).toBeDefined();
		});

		it('includes payment metadata on cart artifact', async () => {
			const result = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Test')));
			const artifact = result.result.task.artifacts[0];
			expect(artifact.metadata['x402.payment.status']).toBe('payment-required');
		});

		it('returns PAYMENT_REQUIRED for unknown skill', async () => {
			const result = await callA2A(rpc('SendMessage', intentMessage('nonexistent-skill', 'Test')));
			expect(result.error.code).toBe(PAYMENT_ERROR_CODES.PAYMENT_REQUIRED);
			expect(result.error.message).toContain('Unknown skill');
		});

		it('returns contextId for payment resumption', async () => {
			const result = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Test')));
			const task = result.result.task;
			expect(task.contextId).toMatch(/^[0-9a-f-]{36}$/);
		});
	});

	describe('SendMessage — malformed mandates', () => {
		it('returns PAYMENT_INVALID for IntentMandate missing skillId', async () => {
			const result = await callA2A(rpc('SendMessage', {
				message: {
					role: 'user',
					parts: [{
						type: 'data',
						mimeType: 'application/json',
						data: { type: 'ap2.mandates.IntentMandate', description: 'Missing skillId' },
					}],
				},
			}));
			expect(result.error.code).toBe(PAYMENT_ERROR_CODES.PAYMENT_INVALID);
		});

		it('returns PAYMENT_INVALID for PaymentMandate missing paymentPayload', async () => {
			const result = await callA2A(rpc('SendMessage', {
				message: {
					role: 'user',
					parts: [{
						type: 'data',
						mimeType: 'application/json',
						data: { type: 'ap2.mandates.PaymentMandate' },
					}],
				},
			}));
			expect(result.error.code).toBe(PAYMENT_ERROR_CODES.PAYMENT_INVALID);
		});

		it('returns INVALID_PARAMS for missing message', async () => {
			const result = await callA2A(rpc('SendMessage', {}));
			expect(result.error.code).toBe(A2A_ERROR_CODES.INVALID_PARAMS);
		});

		it('returns INVALID_PARAMS for empty parts array', async () => {
			const result = await callA2A(rpc('SendMessage', {
				message: { role: 'user', parts: [] },
			}));
			expect(result.error.code).toBe(A2A_ERROR_CODES.INVALID_PARAMS);
		});
	});

	describe('SendMessage — PaymentMandate', () => {
		it('returns PAYMENT_INVALID for empty paymentPayload', async () => {
			const result = await callA2A(rpc('SendMessage', paymentMessage('   ')));
			expect(result.error.code).toBe(PAYMENT_ERROR_CODES.PAYMENT_INVALID);
		});

		it('creates new task for PaymentMandate without contextId', async () => {
			const result = await callA2A(rpc('SendMessage', paymentMessage('eip3009-auth', '0xabc')));
			const task = result.result.task;
			expect(task.id).toBeDefined();
			expect(['completed', 'failed']).toContain(task.status.state);
		});

		it('resumes existing task via contextId', async () => {
			const intentResult = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Analyze')));
			const contextId = intentResult.result.task.contextId;

			const payResult = await callA2A(rpc('SendMessage', {
				contextId,
				...paymentMessage('eip3009-auth', '0xresume'),
			}));
			const task = payResult.result.task;
			expect(task.id).toBe(intentResult.result.task.id);
			expect(task.contextId).toBe(contextId);
		});

		it('attaches payment receipt artifact on success', async () => {
			const intentResult = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Analyze')));
			const contextId = intentResult.result.task.contextId;

			const payResult = await callA2A(rpc('SendMessage', {
				contextId,
				...paymentMessage('eip3009-auth', '0xreceipttest'),
			}));
			const receipts = payResult.result.task.artifacts.filter(
				(a: { name: string }) => a.name === 'payment-receipt',
			);
			expect(receipts.length).toBeGreaterThanOrEqual(1);
			const receiptData = receipts[0].parts[0].data;
			expect(receiptData.transactionHash).toBe('0xreceipttest');
			expect(receiptData.status).toBe('payment-completed');
		});

		it('creates new task if contextId does not match any task', async () => {
			const result = await callA2A(rpc('SendMessage', {
				contextId: 'nonexistent-context-id',
				...paymentMessage('eip3009-auth', '0xorphan'),
			}));
			expect(result.result.task.id).toBeDefined();
		});
	});

	describe('SendMessage — plain text fallback', () => {
		it('processes plain text through swarm', async () => {
			const result = await callA2A(rpc('SendMessage', plainTextMessage('Analyze Notion')));
			const task = result.result.task;
			expect(task.id).toBeDefined();
			expect(['completed', 'failed']).toContain(task.status.state);
		});

		it('handles data parts with unknown mandate type as none', async () => {
			const result = await callA2A(rpc('SendMessage', {
				message: {
					role: 'user',
					parts: [
						{
							type: 'data',
							mimeType: 'application/json',
							data: { type: 'unknown.type', foo: 'bar' },
						},
						{ type: 'text', text: 'Some text' },
					],
				},
			}));
			const task = result.result.task;
			expect(task.id).toBeDefined();
		});
	});

	describe('GetTask', () => {
		it('returns task by id', async () => {
			const created = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Test')));
			const taskId = created.result.task.id;

			const result = await callA2A(rpc('GetTask', { id: taskId }));
			expect(result.result.task.id).toBe(taskId);
			expect(result.result.task.status.state).toBe('input-required');
		});

		it('accepts tasks/get alias', async () => {
			const created = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Test')));
			const taskId = created.result.task.id;

			const result = await callA2A(rpc('tasks/get', { id: taskId }));
			expect(result.result.task.id).toBe(taskId);
		});

		it('returns TASK_NOT_FOUND for unknown id', async () => {
			const result = await callA2A(rpc('GetTask', { id: 'nonexistent' }));
			expect(result.error.code).toBe(A2A_ERROR_CODES.TASK_NOT_FOUND);
		});

		it('returns INVALID_PARAMS for missing id', async () => {
			const result = await callA2A(rpc('GetTask', {}));
			expect(result.error.code).toBe(A2A_ERROR_CODES.INVALID_PARAMS);
		});
	});

	describe('CancelTask', () => {
		it('cancels a submitted task', async () => {
			const created = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Test')));
			const taskId = created.result.task.id;

			const result = await callA2A(rpc('CancelTask', { id: taskId }));
			expect(result.result.task.status.state).toBe('canceled');
		});

		it('accepts tasks/cancel alias', async () => {
			const created = await callA2A(rpc('SendMessage', intentMessage('brand-analysis', 'Test')));
			const taskId = created.result.task.id;

			const result = await callA2A(rpc('tasks/cancel', { id: taskId }));
			expect(result.result.task.status.state).toBe('canceled');
		});

		it('returns TASK_NOT_FOUND for unknown id', async () => {
			const result = await callA2A(rpc('CancelTask', { id: 'nonexistent' }));
			expect(result.error.code).toBe(A2A_ERROR_CODES.TASK_NOT_FOUND);
		});

		it('returns TASK_NOT_CANCELABLE for completed task', async () => {
			const created = await callA2A(rpc('SendMessage', plainTextMessage('Analyze Notion')));
			const taskId = created.result.task.id;

			if (created.result.task.status.state === 'completed') {
				const result = await callA2A(rpc('CancelTask', { id: taskId }));
				expect(result.error.code).toBe(A2A_ERROR_CODES.TASK_NOT_CANCELABLE);
			}
		});

		it('returns INVALID_PARAMS for missing id', async () => {
			const result = await callA2A(rpc('CancelTask', {}));
			expect(result.error.code).toBe(A2A_ERROR_CODES.INVALID_PARAMS);
		});
	});
});
