import { z } from 'zod';
import { PRICING, NETWORKS, FACILITATORS } from '$lib/config/index.js';

// ─── MCP Tool Definition Type ────────────────────────────────────────────────

export interface McpToolAnnotations {
	x402?: {
		price: string;
		network: string;
		asset: string;
		facilitator: string;
	};
}

export interface McpTool {
	name: string;
	description: string;
	inputSchema: {
		type: 'object';
		properties: Record<string, unknown>;
		required?: string[];
	};
	annotations?: McpToolAnnotations;
}

export interface McpToolResult {
	content: Array<{ type: 'text'; text: string }>;
	isError?: boolean;
}

// ─── Zod Input Schemas (for runtime validation) ─────────────────────────────

export const BrandAnalysisInputSchema = z.object({
	brief: z.string().min(1),
});

export const CompetitiveScanInputSchema = z.object({
	brand: z.string().min(1),
	competitors: z.array(z.string()).optional(),
});

export const MarketPulseInputSchema = z.object({
	industry: z.string().min(1),
});

export type BrandAnalysisInput = z.infer<typeof BrandAnalysisInputSchema>;
export type CompetitiveScanInput = z.infer<typeof CompetitiveScanInputSchema>;
export type MarketPulseInput = z.infer<typeof MarketPulseInputSchema>;

// ─── MCP Tool Definitions ────────────────────────────────────────────────────

const X402_FACILITATOR = FACILITATORS.DEFAULT;

export const MCP_TOOLS: McpTool[] = [
	{
		name: 'brand_analysis',
		description: `Comprehensive brand strategy analysis by Danni — 5 parallel AI analysts produce market positioning, competitive intelligence, cultural resonance, and brand architecture. Price: ${PRICING.BRAND_ANALYSIS} USDC on Base Sepolia.`,
		inputSchema: {
			type: 'object',
			properties: {
				brief: {
					type: 'string',
					description: 'Strategic brief describing the brand analysis needed',
				},
			},
			required: ['brief'],
		},
		annotations: {
			x402: {
				price: PRICING.BRAND_ANALYSIS,
				network: NETWORKS.BASE_SEPOLIA,
				asset: 'USDC',
				facilitator: X402_FACILITATOR,
			},
		},
	},
	{
		name: 'competitive_scan',
		description: `Quick competitive landscape scan — identifies competitor positioning, strengths, weaknesses, and market share. Price: ${PRICING.DATA_ENDPOINT} USDC on Base Sepolia.`,
		inputSchema: {
			type: 'object',
			properties: {
				brand: {
					type: 'string',
					description: 'Brand name to analyze competitively',
				},
				competitors: {
					type: 'array',
					items: { type: 'string' },
					description: 'Optional list of specific competitors to evaluate',
				},
			},
			required: ['brand'],
		},
		annotations: {
			x402: {
				price: PRICING.DATA_ENDPOINT,
				network: NETWORKS.BASE_SEPOLIA,
				asset: 'USDC',
				facilitator: X402_FACILITATOR,
			},
		},
	},
	{
		name: 'market_pulse',
		description: `Industry market dynamics overview — market size, growth rate, trends, and key players. Price: ${PRICING.DATA_ENDPOINT} USDC on Base Sepolia.`,
		inputSchema: {
			type: 'object',
			properties: {
				industry: {
					type: 'string',
					description: 'Industry or market segment to analyze',
				},
			},
			required: ['industry'],
		},
		annotations: {
			x402: {
				price: PRICING.DATA_ENDPOINT,
				network: NETWORKS.BASE_SEPOLIA,
				asset: 'USDC',
				facilitator: X402_FACILITATOR,
			},
		},
	},
];

// ─── MCP JSON-RPC Types ─────────────────────────────────────────────────────

export interface McpJsonRpcRequest {
	jsonrpc: '2.0';
	id: string | number;
	method: string;
	params?: unknown;
}

export const McpJsonRpcRequestSchema = z.object({
	jsonrpc: z.literal('2.0'),
	id: z.union([z.string(), z.number()]),
	method: z.string(),
	params: z.unknown().optional(),
});

export interface McpToolCallParams {
	name: string;
	arguments?: Record<string, unknown>;
}

export const McpToolCallParamsSchema = z.object({
	name: z.string(),
	arguments: z.record(z.string(), z.unknown()).optional(),
});

// ─── MCP Error Codes ─────────────────────────────────────────────────────────

export const MCP_ERROR_CODES = {
	PARSE_ERROR: -32700,
	INVALID_REQUEST: -32600,
	METHOD_NOT_FOUND: -32601,
	INVALID_PARAMS: -32602,
	INTERNAL_ERROR: -32603,
} as const;
