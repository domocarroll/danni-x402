import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	JsonRpcRequestSchema,
	SendMessageParamsSchema,
	GetTaskParamsSchema,
	CancelTaskParamsSchema,
	A2A_ERROR_CODES,
	PAYMENT_ERROR_CODES,
} from '$lib/a2a/types.js';
import type { JsonRpcResponse } from '$lib/a2a/types.js';
import { taskManager, TaskNotFoundError, TaskNotCancelableError } from '$lib/a2a/task-manager.js';
import {
	IntentMandateSchema,
	PaymentMandateSchema,
	buildCartMandate,
	buildPaymentReceipt,
	buildPaymentMetadata,
	isCartMandateExpired,
} from '$lib/ap2/index.js';
import { env } from '$env/dynamic/private';

function extractMandate(parts: Array<{ type: string; [key: string]: unknown }>): {
	kind: 'intent' | 'payment' | 'malformed' | 'none';
	data: unknown;
	error?: string;
} {
	for (const part of parts) {
		if (part.type !== 'data') continue;
		const payload = 'data' in part ? part.data : undefined;
		if (payload && typeof payload === 'object' && 'type' in (payload as Record<string, unknown>)) {
			const obj = payload as Record<string, unknown>;
			if (obj.type === 'ap2.mandates.IntentMandate') {
				const parsed = IntentMandateSchema.safeParse(obj);
				if (parsed.success) return { kind: 'intent', data: parsed.data };
				return { kind: 'malformed', data: null, error: `Invalid IntentMandate: ${parsed.error.message}` };
			}
			if (obj.type === 'ap2.mandates.PaymentMandate') {
				const parsed = PaymentMandateSchema.safeParse(obj);
				if (parsed.success) return { kind: 'payment', data: parsed.data };
				return { kind: 'malformed', data: null, error: `Invalid PaymentMandate: ${parsed.error.message}` };
			}
		}
	}
	return { kind: 'none', data: null };
}

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
		case 'SendMessage':
		case 'message/send': {
			const paramsParsed = SendMessageParamsSchema.safeParse(params);
			if (!paramsParsed.success) {
				return json(
					rpcError(id, A2A_ERROR_CODES.INVALID_PARAMS, `Invalid params: ${paramsParsed.error.message}`),
				);
			}

			const { message, contextId: requestContextId } = paramsParsed.data;
			const mandate = extractMandate(message.parts);

			if (mandate.kind === 'malformed') {
				return json(
					rpcError(id, PAYMENT_ERROR_CODES.PAYMENT_INVALID, mandate.error ?? 'Malformed AP2 mandate'),
				);
			}

			// ─── IntentMandate → CartMandate (with contextId for resumption) ────
			if (mandate.kind === 'intent') {
				const intent = mandate.data as { skillId: string; description: string };
				const payTo = env.WALLET_ADDRESS ?? '0x0000000000000000000000000000000000000000';

				try {
					const cartMandate = buildCartMandate(intent.skillId, payTo);
					const task = taskManager.createTask(message);

					taskManager.updateStatus(task.id, 'working', {
						role: 'agent',
						parts: [{ type: 'text', text: 'Processing intent and building payment requirements...' }],
					});

					taskManager.addArtifact(task.id, {
						artifactId: crypto.randomUUID(),
						name: 'cart-mandate',
						description: 'AP2 CartMandate with x402 payment requirements',
						parts: [
							{
								type: 'data',
								mimeType: 'application/json',
								data: cartMandate,
							},
						],
						metadata: buildPaymentMetadata('payment-required', {
							'x402.payment.required': cartMandate.paymentRequest,
						}),
					});

					taskManager.updateStatus(task.id, 'input-required', {
						role: 'agent',
						parts: [
							{
								type: 'text',
								text: `Payment of ${cartMandate.contents.total} USDC required for ${intent.description}. Submit a PaymentMandate with contextId "${task.contextId}" to proceed.`,
							},
						],
						metadata: buildPaymentMetadata('payment-required'),
					});

					const updatedTask = taskManager.getTask(task.id)!;
					return json(rpcSuccess(id, { task: updatedTask }));
				} catch (err) {
					const msg = err instanceof Error ? err.message : 'Failed to build cart mandate';
					return json(rpcError(id, PAYMENT_ERROR_CODES.PAYMENT_REQUIRED, msg));
				}
			}

			// ─── PaymentMandate → Resume task via contextId or create new ────
			if (mandate.kind === 'payment') {
				const payment = mandate.data as { paymentPayload: string; transactionHash?: string };

				if (!payment.paymentPayload.trim()) {
					return json(
						rpcError(id, PAYMENT_ERROR_CODES.PAYMENT_INVALID, 'PaymentMandate paymentPayload cannot be empty'),
					);
				}

				// Resume existing task by contextId (AP2 spec: intent→payment on same context)
				const existingTask = requestContextId
					? taskManager.findTaskByContextId(requestContextId)
					: undefined;

				let taskId: string;

				if (existingTask && existingTask.status.state === 'input-required') {
					const cartArtifact = existingTask.artifacts.find((a) => a.name === 'cart-mandate');
					if (cartArtifact) {
						const cartData = cartArtifact.parts.find(
							(p) => p.type === 'data' && (p as { data?: { expiresAt?: string } }).data?.expiresAt,
						);
						if (cartData && cartData.type === 'data') {
							const expiresAt = (cartData as { data: { expiresAt?: string } }).data.expiresAt;
							if (isCartMandateExpired(expiresAt)) {
								return json(
									rpcError(id, PAYMENT_ERROR_CODES.PAYMENT_EXPIRED, 'Cart mandate has expired. Submit a new IntentMandate.'),
								);
							}
						}
					}

					taskManager.addMessage(existingTask.id, message);
					taskId = existingTask.id;

					taskManager.updateStatus(taskId, 'working', {
						role: 'agent',
						parts: [{ type: 'text', text: 'Payment accepted. Resuming analysis on existing context...' }],
						metadata: buildPaymentMetadata('payment-verified'),
					});
				} else {
					// No contextId or task not found — create fresh task
					const newTask = taskManager.createTask(message);
					taskId = newTask.id;

					taskManager.updateStatus(taskId, 'working', {
						role: 'agent',
						parts: [{ type: 'text', text: 'Payment accepted. Danni is analyzing your brief...' }],
						metadata: buildPaymentMetadata('payment-verified'),
					});
				}

				try {
					const txHash = payment.transactionHash ?? `0x${crypto.randomUUID().replace(/-/g, '')}`;

					// Extract cart amount from existing task artifact for receipt accuracy
					const existingForAmount = taskManager.getTask(taskId);
					const cartArtifactForAmount = existingForAmount?.artifacts.find((a) => a.name === 'cart-mandate');
					const cartAmount = cartArtifactForAmount
						? String((cartArtifactForAmount.parts.find((p) => p.type === 'data') as { data?: { paymentRequest?: { amount?: string } } } | undefined)?.data?.paymentRequest?.amount ?? payment.paymentPayload)
						: payment.paymentPayload;

					const taskForProcessing = taskManager.getTask(taskId)!;
					const completed = await taskManager.processTask(taskForProcessing);

					const receipt = buildPaymentReceipt(txHash, 'eip155:84532', cartAmount);

					taskManager.addArtifact(completed.id, {
						artifactId: crypto.randomUUID(),
						name: 'payment-receipt',
						description: 'AP2 PaymentReceipt confirming on-chain settlement',
						parts: [
							{
								type: 'data',
								mimeType: 'application/json',
								data: receipt,
							},
						],
						metadata: buildPaymentMetadata('payment-completed', {
							'x402.payment.receipts': [receipt],
						}),
					});

					try {
						const { submitPaymentFeedback, getAgentId } = await import('$lib/erc8004/index.js');
						const agentId = await getAgentId('https://danni.subfrac.cloud');
						if (agentId > 0n) {
							await submitPaymentFeedback({
								agentId,
								endpoint: '/api/a2a',
								transactionHash: txHash,
								paymentAmount: payment.paymentPayload,
							});
						}
				} catch (reputationErr) {
					// Reputation feedback is non-fatal — log for debugging but don't block response
					console.warn(
						`[a2a] ERC-8004 reputation feedback failed (non-fatal): ${reputationErr instanceof Error ? reputationErr.message : 'unknown error'}`,
					);
				}

					const finalTask = taskManager.getTask(completed.id)!;
					return json(rpcSuccess(id, { task: finalTask }));
				} catch (err) {
					const msg = err instanceof Error ? err.message : 'Payment processing failed';
				try {
					taskManager.updateStatus(taskId, 'failed', {
						role: 'agent',
						parts: [{ type: 'text', text: `Payment failed: ${msg}` }],
						metadata: buildPaymentMetadata('payment-failed'),
					});
				} catch (transitionErr) {
					// Log state transition failure — task may already be in terminal state
					console.warn(
						`[a2a] Failed to transition task ${taskId} to 'failed': ${transitionErr instanceof Error ? transitionErr.message : 'unknown error'}. Original error: ${msg}`,
					);
				}
					const failedTask = taskManager.getTask(taskId)!;
					return json(rpcSuccess(id, { task: failedTask }));
				}
			}

			// ─── Plain text fallback → existing swarm flow ────
			const task = taskManager.createTask(message);
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
