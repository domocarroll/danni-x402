import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCP_ERROR_CODES } from '$lib/mcp/tools.js';

vi.mock('$env/dynamic/private', () => ({
	env: { WALLET_ADDRESS: '0xTestWallet' },
}));

const mockHandleToolCall = vi.fn().mockResolvedValue({
	content: [{ type: 'text', text: 'Mock analysis result' }],
	isError: false,
});

vi.mock('$lib/mcp/handlers.js', () => ({
	handleToolCall: mockHandleToolCall,
	isRetryable: vi.fn(),
	formatToolError: vi.fn(),
}));

async function callMCP(body: unknown) {
	const { POST } = await import('./+server.js');
	const request = new Request('http://localhost/api/mcp', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	const response = await POST({ request } as Parameters<typeof POST>[0]);
	if (response.status === 202) return { _status: 202 };
	return response.json();
}

function rpc(method: string, params?: unknown, id: string | number = 1) {
	return { jsonrpc: '2.0', id, method, ...(params !== undefined ? { params } : {}) };
}

describe('MCP Handler', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHandleToolCall.mockResolvedValue({
			content: [{ type: 'text', text: 'Mock analysis result' }],
			isError: false,
		});
	});

	describe('JSON-RPC validation', () => {
		it('returns PARSE_ERROR for invalid JSON', async () => {
			const { POST } = await import('./+server.js');
			const request = new Request('http://localhost/api/mcp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: '{invalid json',
			});
			const response = await POST({ request } as Parameters<typeof POST>[0]);
			const data = await response.json();
			expect(data.error.code).toBe(MCP_ERROR_CODES.PARSE_ERROR);
		});

		it('returns INVALID_REQUEST for missing jsonrpc field', async () => {
			const result = await callMCP({ id: 1, method: 'tools/list' });
			expect(result.error.code).toBe(MCP_ERROR_CODES.INVALID_REQUEST);
		});

		it('returns METHOD_NOT_FOUND for unknown method', async () => {
			const result = await callMCP(rpc('unknown/method'));
			expect(result.error.code).toBe(MCP_ERROR_CODES.METHOD_NOT_FOUND);
		});
	});

	describe('initialize', () => {
		it('returns protocol version and server info', async () => {
			const result = await callMCP(rpc('initialize'));
			expect(result.result.protocolVersion).toBe('2025-06-18');
			expect(result.result.serverInfo.name).toBe('danni-mcp');
			expect(result.result.serverInfo.version).toBe('1.0.0');
			expect(result.result.capabilities.tools).toBeDefined();
		});
	});

	describe('notifications/initialized', () => {
		it('returns 202 status', async () => {
			const result = await callMCP(rpc('notifications/initialized'));
			expect(result._status).toBe(202);
		});
	});

	describe('tools/list', () => {
		it('returns all three MCP tools', async () => {
			const result = await callMCP(rpc('tools/list'));
			const tools = result.result.tools;
			expect(tools).toHaveLength(3);
			const names = tools.map((t: { name: string }) => t.name);
			expect(names).toContain('brand_analysis');
			expect(names).toContain('competitive_scan');
			expect(names).toContain('market_pulse');
		});

		it('each tool has x402 annotations', async () => {
			const result = await callMCP(rpc('tools/list'));
			for (const tool of result.result.tools) {
				expect(tool.annotations?.x402).toBeDefined();
				expect(tool.annotations.x402.price).toBeDefined();
				expect(tool.annotations.x402.network).toBe('eip155:84532');
			}
		});

		it('brand_analysis costs $100', async () => {
			const result = await callMCP(rpc('tools/list'));
			const ba = result.result.tools.find((t: { name: string }) => t.name === 'brand_analysis');
			expect(ba.annotations.x402.price).toBe('$100');
		});

		it('competitive_scan and market_pulse cost $5', async () => {
			const result = await callMCP(rpc('tools/list'));
			const cs = result.result.tools.find((t: { name: string }) => t.name === 'competitive_scan');
			const mp = result.result.tools.find((t: { name: string }) => t.name === 'market_pulse');
			expect(cs.annotations.x402.price).toBe('$5');
			expect(mp.annotations.x402.price).toBe('$5');
		});
	});

	describe('tools/call — payment gating', () => {
		it('returns payment required for brand_analysis without payment', async () => {
			const result = await callMCP(rpc('tools/call', {
				name: 'brand_analysis',
				arguments: { brief: 'Analyze Notion' },
			}));
			expect(result.result.isError).toBe(true);
			expect(result.result._meta['x402/payment']).toBeDefined();
			expect(result.result._meta['x402/payment'].price).toBe('$100');
			expect(result.result._meta['x402/payment'].amount).toBe('100000000');
			expect(result.result._meta['x402/payment'].payTo).toBe('0xTestWallet');
		});

		it('returns payment required for competitive_scan without payment', async () => {
			const result = await callMCP(rpc('tools/call', {
				name: 'competitive_scan',
				arguments: { brand: 'Figma' },
			}));
			expect(result.result.isError).toBe(true);
			expect(result.result._meta['x402/payment'].price).toBe('$5');
			expect(result.result._meta['x402/payment'].amount).toBe('5000000');
		});

		it('returns payment required for market_pulse without payment', async () => {
			const result = await callMCP(rpc('tools/call', {
				name: 'market_pulse',
				arguments: { industry: 'AI SaaS' },
			}));
			expect(result.result.isError).toBe(true);
			expect(result.result._meta['x402/payment'].price).toBe('$5');
		});

		it('includes payment-required status in metadata', async () => {
			const result = await callMCP(rpc('tools/call', {
				name: 'brand_analysis',
				arguments: { brief: 'test' },
			}));
			expect(result.result._meta['x402.payment.status']).toBe('payment-required');
		});

		it('includes resource path in payment requirements', async () => {
			const result = await callMCP(rpc('tools/call', {
				name: 'brand_analysis',
				arguments: { brief: 'test' },
			}));
			expect(result.result._meta['x402/payment'].resource).toBe('/api/mcp#brand_analysis');
		});
	});

	describe('tools/call — with payment', () => {
		it('executes tool and returns result with receipt when payment provided', async () => {
			const result = await callMCP(rpc('tools/call', {
				name: 'brand_analysis',
				arguments: { brief: 'Analyze Notion' },
				_meta: {
					'x402/payment-response': {
						transactionHash: '0xpaymenthash',
						network: 'eip155:84532',
						amount: '100000000',
					},
				},
			}));
			expect(result.result.content[0].text).toBe('Mock analysis result');
			expect(result.result._meta['x402.payment.receipts']).toHaveLength(1);
			expect(result.result._meta['x402.payment.receipts'][0].transactionHash).toBe('0xpaymenthash');
			expect(result.result._meta['x402.payment.status']).toBe('payment-completed');
		});

		it('calls handleToolCall with correct arguments', async () => {
			await callMCP(rpc('tools/call', {
				name: 'brand_analysis',
				arguments: { brief: 'Test brief' },
				_meta: {
					'x402/payment-response': {
						transactionHash: '0xtest',
						network: 'eip155:84532',
						amount: '100000000',
					},
				},
			}));
			expect(mockHandleToolCall).toHaveBeenCalledWith('brand_analysis', { brief: 'Test brief' });
		});

		it('ignores incomplete payment response (missing transactionHash)', async () => {
			const result = await callMCP(rpc('tools/call', {
				name: 'brand_analysis',
				arguments: { brief: 'test' },
				_meta: {
					'x402/payment-response': {
						network: 'eip155:84532',
						amount: '100000000',
					},
				},
			}));
			expect(result.result.isError).toBe(true);
		});

		it('ignores payment response with wrong types', async () => {
			const result = await callMCP(rpc('tools/call', {
				name: 'brand_analysis',
				arguments: { brief: 'test' },
				_meta: {
					'x402/payment-response': {
						transactionHash: 123,
						network: 'eip155:84532',
						amount: '100000000',
					},
				},
			}));
			expect(result.result.isError).toBe(true);
		});

		it('ignores null payment response', async () => {
			const result = await callMCP(rpc('tools/call', {
				name: 'brand_analysis',
				arguments: { brief: 'test' },
				_meta: {
					'x402/payment-response': null,
				},
			}));
			expect(result.result.isError).toBe(true);
		});
	});

	describe('tools/call — error handling', () => {
		it('returns INVALID_PARAMS for unknown tool name', async () => {
			const result = await callMCP(rpc('tools/call', {
				name: 'nonexistent_tool',
				arguments: {},
			}));
			expect(result.error.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS);
			expect(result.error.message).toContain('Unknown tool');
		});

		it('returns INVALID_PARAMS for missing name', async () => {
			const result = await callMCP(rpc('tools/call', { arguments: {} }));
			expect(result.error.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS);
		});
	});
});
