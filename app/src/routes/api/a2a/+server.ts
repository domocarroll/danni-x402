import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	JsonRpcRequestSchema,
	SendMessageParamsSchema,
	GetTaskParamsSchema,
	CancelTaskParamsSchema,
	A2A_ERROR_CODES,
} from '$lib/a2a/types.js';
import type { JsonRpcResponse } from '$lib/a2a/types.js';
import { taskManager, TaskNotFoundError, TaskNotCancelableError } from '$lib/a2a/task-manager.js';

function rpcSuccess(id: string | number, result: unknown): JsonRpcResponse {
	return { jsonrpc: '2.0', id, result };
}

function rpcError(
	id: string | number | null,
	code: number,
	message: string,
	data?: unknown,
): JsonRpcResponse {
	return { jsonrpc: '2.0', id, error: { code, message, data } };
}

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json(rpcError(null, A2A_ERROR_CODES.PARSE_ERROR, 'Invalid JSON'));
	}

	const reqParsed = JsonRpcRequestSchema.safeParse(body);
	if (!reqParsed.success) {
		return json(
			rpcError(null, A2A_ERROR_CODES.INVALID_REQUEST, 'Invalid JSON-RPC request'),
		);
	}

	const { id, method, params } = reqParsed.data;

	switch (method) {
		// A2A v0.3+ PascalCase methods (also accept legacy slash-style for compatibility)
		case 'SendMessage':
		case 'message/send': {
			const paramsParsed = SendMessageParamsSchema.safeParse(params);
			if (!paramsParsed.success) {
				return json(
					rpcError(id, A2A_ERROR_CODES.INVALID_PARAMS, `Invalid params: ${paramsParsed.error.message}`),
				);
			}

			const task = taskManager.createTask(paramsParsed.data.message);
			const completed = await taskManager.processTask(task);

			return json(rpcSuccess(id, { task: completed }));
		}

		case 'GetTask':
		case 'tasks/get': {
			const paramsParsed = GetTaskParamsSchema.safeParse(params);
			if (!paramsParsed.success) {
				return json(
					rpcError(id, A2A_ERROR_CODES.INVALID_PARAMS, `Invalid params: ${paramsParsed.error.message}`),
				);
			}

			const task = taskManager.getTask(paramsParsed.data.id);
			if (!task) {
				return json(
					rpcError(id, A2A_ERROR_CODES.TASK_NOT_FOUND, `Task not found: ${paramsParsed.data.id}`),
				);
			}

			return json(rpcSuccess(id, { task }));
		}

		case 'CancelTask':
		case 'tasks/cancel': {
			const paramsParsed = CancelTaskParamsSchema.safeParse(params);
			if (!paramsParsed.success) {
				return json(
					rpcError(id, A2A_ERROR_CODES.INVALID_PARAMS, `Invalid params: ${paramsParsed.error.message}`),
				);
			}

			try {
				const task = taskManager.cancelTask(paramsParsed.data.id);
				return json(rpcSuccess(id, { task }));
			} catch (err) {
				if (err instanceof TaskNotFoundError) {
					return json(
						rpcError(id, A2A_ERROR_CODES.TASK_NOT_FOUND, err.message),
					);
				}
				if (err instanceof TaskNotCancelableError) {
					return json(
						rpcError(id, A2A_ERROR_CODES.TASK_NOT_CANCELABLE, err.message),
					);
				}
				throw err;
			}
		}

		default:
			return json(
				rpcError(id, A2A_ERROR_CODES.UNSUPPORTED_OPERATION, `Unknown method: ${method}`),
			);
	}
};
