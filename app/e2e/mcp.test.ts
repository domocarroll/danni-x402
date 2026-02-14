import { test, expect } from '@playwright/test';

test.describe('MCP Server Endpoints', () => {
	test.describe('tools/list', () => {
		test('POST /api/mcp with tools/list method returns tool list', async ({ request }) => {
			const res = await request.post('/api/mcp', {
				data: {
					jsonrpc: '2.0',
					id: 1,
					method: 'tools/list',
					params: {},
				},
			});

			expect(res.ok()).toBeTruthy();
			const body = await res.json();

			expect(body.jsonrpc).toBe('2.0');
			expect(body.id).toBe(1);
			expect(body.result).toBeDefined();
			expect(body.result.tools).toBeInstanceOf(Array);
		});

		test('tools/list response includes brand_analysis tool', async ({ request }) => {
			const res = await request.post('/api/mcp', {
				data: {
					jsonrpc: '2.0',
					id: 2,
					method: 'tools/list',
					params: {},
				},
			});

			const body = await res.json();
			const tools = body.result.tools;
			const brandAnalysisTool = tools.find((t: { name: string }) => t.name === 'brand_analysis');

			expect(brandAnalysisTool).toBeDefined();
			expect(brandAnalysisTool.description).toBeDefined();
			expect(brandAnalysisTool.inputSchema).toBeDefined();
		});

		test('tools/list response includes competitive_scan tool', async ({ request }) => {
			const res = await request.post('/api/mcp', {
				data: {
					jsonrpc: '2.0',
					id: 3,
					method: 'tools/list',
					params: {},
				},
			});

			const body = await res.json();
			const tools = body.result.tools;
			const competitiveScanTool = tools.find((t: { name: string }) => t.name === 'competitive_scan');

			expect(competitiveScanTool).toBeDefined();
			expect(competitiveScanTool.description).toBeDefined();
			expect(competitiveScanTool.inputSchema).toBeDefined();
		});

		test('tools/list response includes market_pulse tool', async ({ request }) => {
			const res = await request.post('/api/mcp', {
				data: {
					jsonrpc: '2.0',
					id: 4,
					method: 'tools/list',
					params: {},
				},
			});

			const body = await res.json();
			const tools = body.result.tools;
			const marketPulseTool = tools.find((t: { name: string }) => t.name === 'market_pulse');

			expect(marketPulseTool).toBeDefined();
			expect(marketPulseTool.description).toBeDefined();
			expect(marketPulseTool.inputSchema).toBeDefined();
		});

		test('tools have x402 annotations for pricing', async ({ request }) => {
			const res = await request.post('/api/mcp', {
				data: {
					jsonrpc: '2.0',
					id: 5,
					method: 'tools/list',
					params: {},
				},
			});

			const body = await res.json();
			const tools = body.result.tools;
			const brandAnalysisTool = tools.find((t: { name: string }) => t.name === 'brand_analysis');

			expect(brandAnalysisTool.annotations).toBeDefined();
			expect(brandAnalysisTool.annotations.x402).toBeDefined();
			expect(brandAnalysisTool.annotations.x402.price).toBeDefined();
			expect(brandAnalysisTool.annotations.x402.network).toBeDefined();
		});
	});

	test.describe('initialize', () => {
		test('POST /api/mcp with initialize method returns server info', async ({ request }) => {
			const res = await request.post('/api/mcp', {
				data: {
					jsonrpc: '2.0',
					id: 10,
					method: 'initialize',
					params: {
						protocolVersion: '2025-06-18',
						capabilities: {},
						clientInfo: { name: 'test-client', version: '1.0.0' },
					},
				},
			});

			expect(res.ok()).toBeTruthy();
			const body = await res.json();

			expect(body.jsonrpc).toBe('2.0');
			expect(body.id).toBe(10);
			expect(body.result).toBeDefined();
			expect(body.result.protocolVersion).toBe('2025-06-18');
			expect(body.result.serverInfo).toBeDefined();
			expect(body.result.serverInfo.name).toBe('danni-mcp');
			expect(body.result.serverInfo.version).toBe('1.0.0');
		});
	});

	test.describe('Error Handling', () => {
		test('POST /api/mcp with invalid JSON returns parse error', async ({ request }) => {
			const res = await request.post('/api/mcp', {
				data: 'not json',
				headers: { 'Content-Type': 'text/plain' },
			});

			const body = await res.json();
			expect(body.jsonrpc).toBe('2.0');
			expect(body.error).toBeDefined();
			expect(body.error.code).toBe(-32700); // PARSE_ERROR
		});

		test('POST /api/mcp with unknown method returns error', async ({ request }) => {
			const res = await request.post('/api/mcp', {
				data: {
					jsonrpc: '2.0',
					id: 20,
					method: 'unknown/method',
					params: {},
				},
			});

			const body = await res.json();
			expect(body.error).toBeDefined();
			expect(body.error.code).toBe(-32601); // METHOD_NOT_FOUND
		});
	});
});
