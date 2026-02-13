import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { executeSwarm } from '$lib/swarm/orchestrator.js';
import { StreamingTracker } from '$lib/swarm/streaming-tracker.js';
import type { SSEEvent } from '$lib/swarm/streaming-tracker.js';
import { recordTransaction } from '$lib/payments/transaction-store.js';

const SWARM_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const AnalyzeInputSchema = z.object({
	brief: z.string().min(1, 'Brief is required').max(10000, 'Brief must be under 10,000 characters'),
	brand: z.string().optional(),
	industry: z.string().optional()
});

class SwarmTimeoutError extends Error {
	constructor(timeoutMs: number) {
		super(`Swarm execution timed out after ${Math.round(timeoutMs / 1000)}s`);
		this.name = 'SwarmTimeoutError';
	}
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => reject(new SwarmTimeoutError(timeoutMs)), timeoutMs);
		promise
			.then((result) => {
				clearTimeout(timer);
				resolve(result);
			})
			.catch((error) => {
				clearTimeout(timer);
				reject(error);
			});
	});
}

function classifyError(error: unknown): { message: string; status: number } {
	if (error instanceof SwarmTimeoutError) {
		return { message: error.message, status: 504 };
	}
	if (error instanceof Error) {
		if (error.message.includes('rate limit') || error.message.includes('429')) {
			return { message: 'AI service rate limited — please retry in a moment', status: 429 };
		}
		if (error.message.includes('ANTHROPIC_API_KEY') || error.message.includes('authentication')) {
			return { message: 'AI service configuration error — contact support', status: 503 };
		}
		if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
			return { message: 'Upstream service unavailable — please retry', status: 502 };
		}
		return { message: error.message, status: 500 };
	}
	return { message: 'Swarm execution failed', status: 500 };
}

function formatSSE(event: string, data: unknown): string {
	return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * POST /api/danni/analyze
 * x402-protected: $100 USDC
 *
 * Streams SSE events as 5 agents analyze, then sends full result.
 * If Accept header doesn't include text/event-stream, returns JSON directly.
 */
export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = AnalyzeInputSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: parsed.error.issues[0].message }, { status: 400 });
	}

	const { brief, brand, industry } = parsed.data;
	const wantsSSE = request.headers.get('accept')?.includes('text/event-stream');

	if (!wantsSSE) {
		// Non-streaming: run swarm and return JSON directly
		try {
			const result = await withTimeout(
				executeSwarm({ brief, brand, industry }),
				SWARM_TIMEOUT_MS
			);

			recordTransaction({
				id: `tx_${Date.now()}`,
				txHash: '',
				amount: '$100',
				service: 'Brand Analysis',
				network: 'Base Sepolia',
				timestamp: Date.now(),
				status: 'confirmed',
				brief
			});

			return json(result);
		} catch (error) {
			const { message, status } = classifyError(error);
			return json({ error: message }, { status });
		}
	}

	// SSE streaming mode: real-time glass-box view
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		start(controller) {
			const enqueue = (event: string, data: unknown) => {
				controller.enqueue(encoder.encode(formatSSE(event, data)));
			};

			const tracker = new StreamingTracker((evt: SSEEvent) => {
				enqueue(evt.event, evt);
			});

			// Signal payment confirmation (x402 middleware already verified)
			tracker.emitPaymentConfirmed();

			withTimeout(executeSwarm({ brief, brand, industry }, tracker), SWARM_TIMEOUT_MS)
				.then((result) => {
					// Record the transaction
					recordTransaction({
						id: `tx_${Date.now()}`,
						txHash: '',
						amount: '$100',
						service: 'Brand Analysis',
						network: 'Base Sepolia',
						timestamp: Date.now(),
						status: 'confirmed',
						brief
					});

					// Send the full result
					enqueue('result', result);
					controller.close();
				})
				.catch((error) => {
					const { message } = classifyError(error);
					enqueue('error', { message });
					controller.close();
				});
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
