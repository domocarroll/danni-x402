import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
	test.describe('Agent Card', () => {
		test('GET /.well-known/agent.json returns valid agent card', async ({ request }) => {
			const res = await request.get('/.well-known/agent.json');
			expect(res.ok()).toBeTruthy();

			const body = await res.json();
			expect(body.name).toBe('Danni');
			expect(body.version).toBe('1.0.0');
			expect(body.provider.organization).toBe('Subfracture');
		});

		test('agent card has capabilities with extensions', async ({ request }) => {
			const res = await request.get('/.well-known/agent.json');
			const body = await res.json();

			expect(body.capabilities).toBeDefined();
			expect(body.capabilities.extensions).toBeInstanceOf(Array);
			expect(body.capabilities.extensions.length).toBeGreaterThanOrEqual(1);
		});

		test('agent card has x402 security scheme', async ({ request }) => {
			const res = await request.get('/.well-known/agent.json');
			const body = await res.json();

			expect(body.securitySchemes).toBeDefined();
			expect(body.securitySchemes.x402).toBeDefined();
			expect(body.securitySchemes.x402.type).toBe('x402');
		});

		test('agent card has skills', async ({ request }) => {
			const res = await request.get('/.well-known/agent.json');
			const body = await res.json();

			expect(body.skills).toBeInstanceOf(Array);
			expect(body.skills.length).toBe(3);

			const skillIds = body.skills.map((s: { id: string }) => s.id);
			expect(skillIds).toContain('brand-analysis');
			expect(skillIds).toContain('competitive-scan');
			expect(skillIds).toContain('market-pulse');
		});

		test('agent card has x402 pricing info', async ({ request }) => {
			const res = await request.get('/.well-known/agent.json');
			const body = await res.json();

			expect(body.x402).toBeDefined();
			expect(body.x402.network).toBe('eip155:84532');
			expect(body.x402.pricing).toBeDefined();
		});

		test('agent card has ERC-8004 identity info', async ({ request }) => {
			const res = await request.get('/.well-known/agent.json');
			const body = await res.json();

			expect(body.identity).toBeDefined();
			expect(body.identity.standard).toBe('ERC-8004');
		});

		test('agent card has supported interfaces', async ({ request }) => {
			const res = await request.get('/.well-known/agent.json');
			const body = await res.json();

			expect(body.supportedInterfaces).toBeInstanceOf(Array);
			expect(body.supportedInterfaces[0].protocolBinding).toBe('JSONRPC');
		});
	});

	test.describe('A2A Handler', () => {
		test('POST /api/a2a returns error for invalid JSON', async ({ request }) => {
			const res = await request.post('/api/a2a', {
				data: 'not json',
				headers: { 'Content-Type': 'text/plain' },
			});
			const body = await res.json();
			expect(body.jsonrpc).toBe('2.0');
			expect(body.error).toBeDefined();
			expect(body.error.code).toBe(-32700); // PARSE_ERROR
		});

		test('POST /api/a2a returns error for invalid JSON-RPC', async ({ request }) => {
			const res = await request.post('/api/a2a', {
				data: { foo: 'bar' },
			});
			const body = await res.json();
			expect(body.error).toBeDefined();
			expect(body.error.code).toBe(-32600); // INVALID_REQUEST
		});

		test('POST /api/a2a returns error for unknown method', async ({ request }) => {
			const res = await request.post('/api/a2a', {
				data: {
					jsonrpc: '2.0',
					id: '1',
					method: 'UnknownMethod',
					params: {},
				},
			});
			const body = await res.json();
			expect(body.error).toBeDefined();
			expect(body.error.code).toBe(-32004); // UNSUPPORTED_OPERATION
		});

		test('GetTask returns task not found for fake ID', async ({ request }) => {
			const res = await request.post('/api/a2a', {
				data: {
					jsonrpc: '2.0',
					id: '2',
					method: 'GetTask',
					params: { id: 'nonexistent-task-id' },
				},
			});
			const body = await res.json();
			expect(body.error).toBeDefined();
			expect(body.error.code).toBe(-32001); // TASK_NOT_FOUND
		});

		test('SendMessage with IntentMandate returns input-required', async ({ request }) => {
			const res = await request.post('/api/a2a', {
				data: {
					jsonrpc: '2.0',
					id: '3',
					method: 'SendMessage',
					params: {
						message: {
							role: 'user',
							parts: [
								{
									type: 'data',
									mimeType: 'application/json',
									data: {
										type: 'IntentMandate',
										skillId: 'brand-analysis',
										description: 'Analyze Nike brand positioning',
									},
								},
							],
						},
					},
				},
			});
			const body = await res.json();
			expect(body.result).toBeDefined();
			expect(body.result.task).toBeDefined();
			expect(body.result.task.status.state).toBe('input-required');
		});
	});

	test.describe('Analyze Endpoint', () => {
		test('POST /api/danni/analyze rejects empty body', async ({ request }) => {
			const res = await request.post('/api/danni/analyze', {
				data: {},
			});
			expect(res.status()).toBe(400);
			const body = await res.json();
			expect(body.error).toBeDefined();
		});

		test('POST /api/danni/analyze rejects empty brief', async ({ request }) => {
			const res = await request.post('/api/danni/analyze', {
				data: { brief: '' },
			});
			expect(res.status()).toBe(400);
		});

		test('POST /api/danni/analyze accepts valid brief (JSON mode)', async ({ request }) => {
			const res = await request.post('/api/danni/analyze', {
				data: { brief: 'Test brand analysis for Nike' },
				headers: { 'Content-Type': 'application/json' },
			});
			// May return 200 (demo mode) or 500/503 (no API key) — not 400
			expect(res.status()).not.toBe(400);
		});
	});

	test.describe('Data Endpoints', () => {
		test('POST /api/data/competitive returns data', async ({ request }) => {
			const res = await request.post('/api/data/competitive', {
				data: { brand: 'Nike' },
			});
			// Should return 200 with fallback data
			expect(res.ok()).toBeTruthy();
			const body = await res.json();
			expect(body.brand).toBeDefined();
		});

		test('POST /api/data/social returns data', async ({ request }) => {
			const res = await request.post('/api/data/social', {
				data: { brand: 'Nike' },
			});
			expect(res.ok()).toBeTruthy();
			const body = await res.json();
			expect(body.brand).toBeDefined();
		});

		test('POST /api/data/market returns data', async ({ request }) => {
			const res = await request.post('/api/data/market', {
				data: { industry: 'Athletic footwear' },
			});
			expect(res.ok()).toBeTruthy();
			const body = await res.json();
			expect(body.industry).toBeDefined();
		});
	});
});
