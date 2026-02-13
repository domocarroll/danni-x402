import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { executeSwarm } from '$lib/swarm/orchestrator.js';
import { StreamingTracker } from '$lib/swarm/streaming-tracker.js';
import type { SSEEvent } from '$lib/swarm/streaming-tracker.js';
import { recordTransaction } from '$lib/payments/transaction-store.js';

const AnalyzeInputSchema = z.object({
	brief: z.string().min(1, 'Brief is required'),
	brand: z.string().optional(),
	industry: z.string().optional()
});

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
			const result = await executeSwarm({ brief, brand, industry });

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
			const message = error instanceof Error ? error.message : 'Swarm execution failed';
			return json({ error: message }, { status: 500 });
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

			executeSwarm({ brief, brand, industry }, tracker)
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
					const message = error instanceof Error ? error.message : 'Swarm failed';
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
