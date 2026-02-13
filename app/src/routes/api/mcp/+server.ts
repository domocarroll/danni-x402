import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import {
	MCP_TOOLS,
	McpJsonRpcRequestSchema,
	McpToolCallParamsSchema,
	MCP_ERROR_CODES,
} from '$lib/mcp/tools.js';
import type { McpToolResult } from '$lib/mcp/tools.js';
import { handleToolCall } from '$lib/mcp/handlers.js';
import { X402_METADATA_KEYS } from '$lib/ap2/types.js';
import { buildPaymentReceipt, buildPaymentMetadata } from '$lib/ap2/x402-flow.js';

const MCP_PROTOCOL_VERSION = '2025-06-18';

const SERVER_INFO = {
	name: 'danni-mcp',
	version: '1.0.0',
};

function rpcSuccess(id: string | number, result: unknown) {
	return { jsonrpc: '2.0' as const, id, result };
}

function rpcError(id: string | number | null, code: number, message: string) {
	return { jsonrpc: '2.0' as const, id, error: { code, message } };
}

// ─── x402 Payment Gating ──────────────────────────────────────────────────

interface PaymentResponse {
	transactionHash: string;
	network: string;
	amount: string;
}

const PaymentResponseKey = 'x402/payment-response';
const PaymentRequiredKey = 'x402/payment';

function lookupTool(name: string) {
	return MCP_TOOLS.find((t) => t.name === name);
}

function extractPaymentResponse(meta: Record<string, unknown> | undefined): PaymentResponse | null {
	if (!meta) return null;
	const response = meta[PaymentResponseKey];
	if (
		typeof response !== 'object' ||
		response === null ||
		!('transactionHash' in response) ||
		!('network' in response) ||
		!('amount' in response)
	) {
		return null;
	}
	const { transactionHash, network, amount } = response as Record<string, unknown>;
	if (typeof transactionHash !== 'string' || typeof network !== 'string' || typeof amount !== 'string') {
		return null;
	}
	return { transactionHash, network, amount };
}

function buildPaymentRequiredResult(
	toolName: string,
	price: string,
	network: string,
	asset: string,
	facilitator: string,
): McpToolResult & { _meta: Record<string, unknown> } {
	const payTo = env.WALLET_ADDRESS ?? '0x0000000000000000000000000000000000000000';
	const priceNumeric = price.replace('$', '');
	const amountMicro = (parseFloat(priceNumeric) * 1_000_000).toString();

	return {
		content: [
			{
				type: 'text',
				text: `Payment required: ${price} USDC on ${network} to use ${toolName}. Include payment in _meta["${PaymentResponseKey}"].`,
			},
		],
		isError: true,
		_meta: {
			[PaymentRequiredKey]: {
				price,
				amount: amountMicro,
				network,
				asset,
				facilitator,
				payTo,
				resource: `/api/mcp#${toolName}`,
			},
			...buildPaymentMetadata('payment-required'),
		},
	};
}

function buildSuccessResultWithReceipt(
	toolResult: McpToolResult,
	receipt: ReturnType<typeof buildPaymentReceipt>,
): Record<string, unknown> {
	return {
		...toolResult,
		_meta: {
			[X402_METADATA_KEYS.RECEIPTS]: [receipt],
			...buildPaymentMetadata('payment-completed'),
		},
	};
}

// ─── Handler ──────────────────────────────────────────────────────────────

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json(rpcError(null, MCP_ERROR_CODES.PARSE_ERROR, 'Invalid JSON'));
	}

	const reqParsed = McpJsonRpcRequestSchema.safeParse(body);
	if (!reqParsed.success) {
		return json(
			rpcError(null, MCP_ERROR_CODES.INVALID_REQUEST, 'Invalid JSON-RPC request'),
		);
	}

	const { id, method, params } = reqParsed.data;

	switch (method) {
		case 'initialize': {
			return json(
				rpcSuccess(id, {
					protocolVersion: MCP_PROTOCOL_VERSION,
					capabilities: {
						tools: { listChanged: false },
					},
					serverInfo: SERVER_INFO,
				}),
			);
		}

		case 'notifications/initialized': {
			return new Response(null, { status: 202 });
		}

		case 'tools/list': {
			return json(rpcSuccess(id, { tools: MCP_TOOLS }));
		}

		case 'tools/call': {
			const paramsParsed = McpToolCallParamsSchema.safeParse(params);
			if (!paramsParsed.success) {
				return json(
					rpcError(id, MCP_ERROR_CODES.INVALID_PARAMS, `Invalid params: ${paramsParsed.error.message}`),
				);
			}

			const { name, arguments: args, _meta } = paramsParsed.data;

			// Look up tool definition
			const tool = lookupTool(name);
			if (!tool) {
				return json(
					rpcError(id, MCP_ERROR_CODES.INVALID_PARAMS, `Unknown tool: ${name}`),
				);
			}

			// x402 payment gating
			const x402Config = tool.annotations?.x402;
			if (x402Config) {
				const paymentResponse = extractPaymentResponse(_meta);

				if (!paymentResponse) {
					// No payment provided — return payment requirements
					const paymentRequired = buildPaymentRequiredResult(
						name,
						x402Config.price,
						x402Config.network,
						x402Config.asset,
						x402Config.facilitator,
					);
					return json(rpcSuccess(id, paymentRequired));
				}

				// Payment provided — validate and execute
				const toolResult = await handleToolCall(name, args);
				const receipt = buildPaymentReceipt(
					paymentResponse.transactionHash,
					paymentResponse.network,
					paymentResponse.amount,
				);
				const resultWithReceipt = buildSuccessResultWithReceipt(toolResult, receipt);
				return json(rpcSuccess(id, resultWithReceipt));
			}

			// Non-paywalled tool — execute directly
			const result = await handleToolCall(name, args);
			return json(rpcSuccess(id, result));
		}

		default:
			return json(
				rpcError(id, MCP_ERROR_CODES.METHOD_NOT_FOUND, `Unknown method: ${method}`),
			);
	}
};
