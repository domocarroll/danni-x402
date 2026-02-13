import {
	BrandAnalysisInputSchema,
	CompetitiveScanInputSchema,
	MarketPulseInputSchema,
} from '$lib/mcp/tools.js';
import type { McpToolResult } from '$lib/mcp/tools.js';
import { executeSwarm } from '$lib/swarm/orchestrator.js';
import { getFallbackCompetitive, getFallbackMarket } from '$lib/data/index.js';

export async function handleToolCall(
	name: string,
	args: Record<string, unknown> | undefined,
): Promise<McpToolResult> {
	switch (name) {
		case 'brand_analysis':
			return handleBrandAnalysis(args ?? {});
		case 'competitive_scan':
			return handleCompetitiveScan(args ?? {});
		case 'market_pulse':
			return handleMarketPulse(args ?? {});
		default:
			return {
				content: [{ type: 'text', text: `Unknown tool: ${name}` }],
				isError: true,
			};
	}
}

async function handleBrandAnalysis(args: Record<string, unknown>): Promise<McpToolResult> {
	const parsed = BrandAnalysisInputSchema.safeParse(args);
	if (!parsed.success) {
		return {
			content: [{ type: 'text', text: `Invalid input: ${parsed.error.message}` }],
			isError: true,
		};
	}

	try {
		const result = await executeSwarm({ brief: parsed.data.brief });
		return {
			content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Swarm execution failed';
		return {
			content: [{ type: 'text', text: `Error: ${message}` }],
			isError: true,
		};
	}
}

async function handleCompetitiveScan(args: Record<string, unknown>): Promise<McpToolResult> {
	const parsed = CompetitiveScanInputSchema.safeParse(args);
	if (!parsed.success) {
		return {
			content: [{ type: 'text', text: `Invalid input: ${parsed.error.message}` }],
			isError: true,
		};
	}

	const { brand, competitors } = parsed.data;

	try {
		const response = await fetch(`http://localhost:5173/api/data/competitive`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ brand, competitors }),
		});
		const data = await response.json();
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	} catch {
		// Fallback if fetch fails (e.g. during startup)
		const fallback = getFallbackCompetitive(brand);
		return {
			content: [{ type: 'text', text: JSON.stringify(fallback, null, 2) }],
		};
	}
}

async function handleMarketPulse(args: Record<string, unknown>): Promise<McpToolResult> {
	const parsed = MarketPulseInputSchema.safeParse(args);
	if (!parsed.success) {
		return {
			content: [{ type: 'text', text: `Invalid input: ${parsed.error.message}` }],
			isError: true,
		};
	}

	const { industry } = parsed.data;

	try {
		const response = await fetch(`http://localhost:5173/api/data/market`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ industry }),
		});
		const data = await response.json();
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	} catch {
		// Fallback if fetch fails
		const fallback = getFallbackMarket(industry);
		return {
			content: [{ type: 'text', text: JSON.stringify(fallback, null, 2) }],
		};
	}
}
