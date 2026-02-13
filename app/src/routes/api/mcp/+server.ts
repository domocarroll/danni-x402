import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	MCP_TOOLS,
	McpJsonRpcRequestSchema,
	McpToolCallParamsSchema,
	MCP_ERROR_CODES,
} from '$lib/mcp/tools.js';
import { handleToolCall } from '$lib/mcp/handlers.js';

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

			const { name, arguments: args } = paramsParsed.data;
			const result = await handleToolCall(name, args);

			return json(rpcSuccess(id, result));
		}

		default:
			return json(
				rpcError(id, MCP_ERROR_CODES.METHOD_NOT_FOUND, `Unknown method: ${method}`),
			);
	}
};
