import { describe, it, expect, vi } from 'vitest';
import {
	MCP_TOOLS,
	McpJsonRpcRequestSchema,
	McpToolCallParamsSchema,
	MCP_ERROR_CODES,
	BrandAnalysisInputSchema,
	CompetitiveScanInputSchema,
	MarketPulseInputSchema,
} from './tools.js';
import { handleToolCall, isRetryable, formatToolError } from './handlers.js';

describe('MCP Tool Definitions', () => {
	it('defines exactly 3 tools', () => {
		expect(MCP_TOOLS).toHaveLength(3);
	});

	it.each(['brand_analysis', 'competitive_scan', 'market_pulse'])(
		'defines %s tool',
		(name) => {
			const tool = MCP_TOOLS.find((t) => t.name === name);
			expect(tool).toBeDefined();
			expect(tool!.description).toBeTruthy();
			expect(tool!.inputSchema.type).toBe('object');
		},
	);

	it('all tools have x402 annotations', () => {
		for (const tool of MCP_TOOLS) {
			expect(tool.annotations?.x402).toBeDefined();
			expect(tool.annotations!.x402!.price).toMatch(/^\$/);
			expect(tool.annotations!.x402!.network).toBe('eip155:84532');
			expect(tool.annotations!.x402!.facilitator).toBe('https://x402.org/facilitator');
		}
	});

	it('brand_analysis costs $100', () => {
		const tool = MCP_TOOLS.find((t) => t.name === 'brand_analysis')!;
		expect(tool.annotations!.x402!.price).toBe('$100');
	});

	it('data tools cost $5', () => {
		for (const name of ['competitive_scan', 'market_pulse']) {
			const tool = MCP_TOOLS.find((t) => t.name === name)!;
			expect(tool.annotations!.x402!.price).toBe('$5');
		}
	});

	it('all tools have required fields in inputSchema', () => {
		for (const tool of MCP_TOOLS) {
			expect(tool.inputSchema.required).toBeDefined();
			expect(tool.inputSchema.required!.length).toBeGreaterThan(0);
		}
	});
});

describe('MCP Zod Schemas', () => {
	describe('McpJsonRpcRequestSchema', () => {
		it('accepts valid request', () => {
			const result = McpJsonRpcRequestSchema.safeParse({
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/list',
			});
			expect(result.success).toBe(true);
		});

		it('accepts string id', () => {
			const result = McpJsonRpcRequestSchema.safeParse({
				jsonrpc: '2.0',
				id: 'req-1',
				method: 'tools/call',
				params: {},
			});
			expect(result.success).toBe(true);
		});

		it('rejects wrong jsonrpc version', () => {
			const result = McpJsonRpcRequestSchema.safeParse({
				jsonrpc: '1.0',
				id: 1,
				method: 'test',
			});
			expect(result.success).toBe(false);
		});
	});

	describe('McpToolCallParamsSchema', () => {
		it('accepts name only', () => {
			const result = McpToolCallParamsSchema.safeParse({ name: 'brand_analysis' });
			expect(result.success).toBe(true);
		});

		it('accepts name with arguments', () => {
			const result = McpToolCallParamsSchema.safeParse({
				name: 'brand_analysis',
				arguments: { brief: 'Analyze Notion' },
			});
			expect(result.success).toBe(true);
		});

		it('accepts _meta for x402 payment', () => {
			const result = McpToolCallParamsSchema.safeParse({
				name: 'brand_analysis',
				arguments: { brief: 'test' },
				_meta: {
					'x402/payment-response': {
						transactionHash: '0xabc',
						network: 'eip155:84532',
						amount: '100000000',
					},
				},
			});
			expect(result.success).toBe(true);
		});

		it('rejects missing name', () => {
			const result = McpToolCallParamsSchema.safeParse({ arguments: {} });
			expect(result.success).toBe(false);
		});
	});

	describe('BrandAnalysisInputSchema', () => {
		it('accepts valid input', () => {
			expect(BrandAnalysisInputSchema.safeParse({ brief: 'Analyze Notion' }).success).toBe(true);
		});

		it('rejects empty brief', () => {
			expect(BrandAnalysisInputSchema.safeParse({ brief: '' }).success).toBe(false);
		});

		it('rejects missing brief', () => {
			expect(BrandAnalysisInputSchema.safeParse({}).success).toBe(false);
		});
	});

	describe('CompetitiveScanInputSchema', () => {
		it('accepts brand only', () => {
			expect(CompetitiveScanInputSchema.safeParse({ brand: 'Figma' }).success).toBe(true);
		});

		it('accepts brand with competitors', () => {
			const result = CompetitiveScanInputSchema.safeParse({
				brand: 'Figma',
				competitors: ['Sketch', 'Adobe XD'],
			});
			expect(result.success).toBe(true);
		});
	});

	describe('MarketPulseInputSchema', () => {
		it('accepts valid input', () => {
			expect(MarketPulseInputSchema.safeParse({ industry: 'SaaS' }).success).toBe(true);
		});

		it('rejects empty industry', () => {
			expect(MarketPulseInputSchema.safeParse({ industry: '' }).success).toBe(false);
		});
	});
});

describe('MCP Error Codes', () => {
	it('defines standard JSON-RPC errors', () => {
		expect(MCP_ERROR_CODES.PARSE_ERROR).toBe(-32700);
		expect(MCP_ERROR_CODES.INVALID_REQUEST).toBe(-32600);
		expect(MCP_ERROR_CODES.METHOD_NOT_FOUND).toBe(-32601);
		expect(MCP_ERROR_CODES.INVALID_PARAMS).toBe(-32602);
		expect(MCP_ERROR_CODES.INTERNAL_ERROR).toBe(-32603);
	});
});

describe('MCP Handler — handleToolCall', () => {
	it('returns error for unknown tool', async () => {
		const result = await handleToolCall('nonexistent_tool', {});
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain('Unknown tool');
	});

	it('competitive_scan returns data for valid brand', async () => {
		const result = await handleToolCall('competitive_scan', { brand: 'Nike' });
		expect(result.isError).toBeUndefined();
		const data = JSON.parse(result.content[0].text);
		expect(data.brand).toBe('Nike');
		expect(data.competitors).toBeDefined();
		expect(data.competitors.length).toBeGreaterThan(0);
	});

	it('competitive_scan rejects empty brand', async () => {
		const result = await handleToolCall('competitive_scan', { brand: '' });
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain('Invalid input');
	});

	it('competitive_scan rejects missing brand', async () => {
		const result = await handleToolCall('competitive_scan', {});
		expect(result.isError).toBe(true);
	});

	it('market_pulse returns data for valid industry', async () => {
		const result = await handleToolCall('market_pulse', { industry: 'SaaS' });
		expect(result.isError).toBeUndefined();
		const data = JSON.parse(result.content[0].text);
		expect(data.industry).toBe('SaaS');
		expect(data.trends).toBeDefined();
		expect(data.keyPlayers).toBeDefined();
	});

	it('market_pulse rejects empty industry', async () => {
		const result = await handleToolCall('market_pulse', { industry: '' });
		expect(result.isError).toBe(true);
	});

	it('brand_analysis rejects empty brief', async () => {
		const result = await handleToolCall('brand_analysis', { brief: '' });
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain('Invalid input');
	});

	it('brand_analysis rejects missing brief', async () => {
		const result = await handleToolCall('brand_analysis', {});
		expect(result.isError).toBe(true);
	});

	it('handles undefined args gracefully', async () => {
		const result = await handleToolCall('competitive_scan', undefined);
		expect(result.isError).toBe(true);
	});
});

describe('isRetryable', () => {
	it.each([
		['timeout', true],
		['ECONNREFUSED', true],
		['ECONNRESET', true],
		['rate limit exceeded', true],
		['HTTP 429 Too Many Requests', true],
		['503 Service Unavailable', true],
		['502 Bad Gateway', true],
	])('classifies "%s" as retryable=%s', (msg, expected) => {
		expect(isRetryable(new Error(msg))).toBe(expected);
	});

	it.each([
		['Invalid input: brief is required', false],
		['Unknown tool: foo', false],
		['Swarm execution failed', false],
		['Permission denied', false],
	])('classifies "%s" as retryable=%s', (msg, expected) => {
		expect(isRetryable(new Error(msg))).toBe(expected);
	});

	it('returns false for non-Error values', () => {
		expect(isRetryable('string error')).toBe(false);
		expect(isRetryable(null)).toBe(false);
		expect(isRetryable(undefined)).toBe(false);
		expect(isRetryable(42)).toBe(false);
	});
});

describe('formatToolError', () => {
	it('includes tool name and error message', () => {
		const result = formatToolError('brand_analysis', new Error('test error'));
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.tool).toBe('brand_analysis');
		expect(parsed.error).toBe('test error');
		expect(result.isError).toBe(true);
	});

	it('includes retryAfterMs for retryable errors', () => {
		const result = formatToolError('brand_analysis', new Error('timeout'));
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.retryable).toBe(true);
		expect(parsed.retryAfterMs).toBe(2000);
	});

	it('omits retryAfterMs for permanent errors', () => {
		const result = formatToolError('brand_analysis', new Error('Invalid input'));
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.retryable).toBe(false);
		expect(parsed.retryAfterMs).toBeUndefined();
	});

	it('handles non-Error values', () => {
		const result = formatToolError('test_tool', 'string error');
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.error).toBe('Tool execution failed unexpectedly');
		expect(parsed.retryable).toBe(false);
	});
});
