import {
	BrandAnalysisInputSchema,
	CompetitiveScanInputSchema,
	MarketPulseInputSchema,
} from '$lib/mcp/tools.js';
import type { McpToolResult } from '$lib/mcp/tools.js';
import { executeSwarm } from '$lib/swarm/orchestrator.js';
import { getFallbackCompetitive, getFallbackMarket } from '$lib/data/index.js';

export function isRetryable(error: unknown): boolean {
	if (error instanceof Error) {
		const msg = error.message.toLowerCase();
		return (
			msg.includes('timeout') ||
			msg.includes('econnrefused') ||
			msg.includes('econnreset') ||
			msg.includes('rate limit') ||
			msg.includes('429') ||
			msg.includes('503') ||
			msg.includes('502')
		);
	}
	return false;
}

export function formatToolError(name: string, error: unknown): McpToolResult {
	const message = error instanceof Error ? error.message : 'Tool execution failed unexpectedly';
	const retryable = isRetryable(error);
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify({
					error: message,
					tool: name,
					retryable,
					...(retryable && { retryAfterMs: 2000 }),
				}),
			},
		],
		isError: true,
	};
}

export async function handleToolCall(
	name: string,
	args: Record<string, unknown> | undefined,
): Promise<McpToolResult> {
	try {
		switch (name) {
			case 'brand_analysis':
				return await handleBrandAnalysis(args ?? {});
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
	} catch (error) {
		return formatToolError(name, error);
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
		return formatToolError('brand_analysis', error);
	}
}

function handleCompetitiveScan(args: Record<string, unknown>): McpToolResult {
	const parsed = CompetitiveScanInputSchema.safeParse(args);
	if (!parsed.success) {
		return {
			content: [{ type: 'text', text: `Invalid input: ${parsed.error.message}` }],
			isError: true,
		};
	}

	const data = getFallbackCompetitive(parsed.data.brand);
	return {
		content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
	};
}

function handleMarketPulse(args: Record<string, unknown>): McpToolResult {
	const parsed = MarketPulseInputSchema.safeParse(args);
	if (!parsed.success) {
		return {
			content: [{ type: 'text', text: `Invalid input: ${parsed.error.message}` }],
			isError: true,
		};
	}

	const data = getFallbackMarket(parsed.data.industry);
	return {
		content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
	};
}
