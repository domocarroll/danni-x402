import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { executeSwarm } from '$lib/swarm/orchestrator.js';
import { StreamingTracker } from '$lib/swarm/streaming-tracker.js';
import type { SSEEvent } from '$lib/swarm/streaming-tracker.js';
import { recordTransaction } from '$lib/payments/transaction-store.js';

const SWARM_TIMEOUT_MS = 5 * 60 * 1000;
const USE_DEMO_MODE = process.env.DEMO_MODE === 'true';

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

async function emitDemoSwarm(
	enqueue: (event: string, data: unknown) => void,
	brief: string
): Promise<void> {
	const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
	const agents = [
		{ name: 'Market Analyst', duration: 4200 },
		{ name: 'Competitive Intelligence', duration: 3800 },
		{ name: 'Cultural Resonance', duration: 5100 },
		{ name: 'Brand Architect', duration: 4600 }
	];

	enqueue('payment_confirmed', { timestamp: Date.now() });
	await delay(500);

	for (const agent of agents) {
		enqueue('agent_start', { agentName: agent.name, timestamp: Date.now() });
		await delay(800);
	}

	for (const agent of agents) {
		await delay(agent.duration);
		enqueue('agent_complete', {
			agentName: agent.name,
			timestamp: Date.now(),
			durationMs: agent.duration,
			outputLength: 2400 + Math.floor(Math.random() * 1200)
		});
	}

	await delay(1500);

	const synthesis = `## Strategic Analysis: ${brief}\n\n### The Cultural Tension\nThe market data reveals a fundamental contradiction: consumers increasingly demand authenticity while simultaneously rewarding polished, curated brand experiences. This isn't hypocrisy — it's a cultural signal pointing to an unoccupied strategic position.\n\n### The Ruthlessly Simple Problem\nYour competitors are competing on features. Every brand in this space is saying the same thing with different typography. The sameness is the opportunity. When everyone zigs toward feature parity, the brand that zags toward emotional ownership captures disproportionate market share.\n\n### The Proprietary Emotion\nThe strategic territory worth owning is **clarity in complexity**. Not simplicity — that's been claimed. Clarity. The feeling that this brand understands what I'm trying to accomplish before I can articulate it myself. That's the Ogilvy "Big Idea" test: can you build a campaign on it for 30 years?\n\n### Recommended Position\nLead with the cultural contradiction. Position against the noise, not the competitors. The brand architecture should follow Holt's identity myth model: you're not selling a product, you're resolving a tension your audience feels but can't name.\n\n### Heart Knows Score: 8.2/10\nStrong strategic foundation with clear differentiation path. The cultural insight is genuine, not manufactured. Execution risk is moderate — the position requires disciplined restraint in messaging.\n\n---\n*Analysis by Danni — Market Analyst, Competitive Intelligence, Cultural Resonance, Brand Architect, and Danni Synthesis. Frameworks: Ogilvy (Big Idea), Fallon/Senn (Ruthlessly Simple Problem), Holt (Cultural Contradictions).*`;

	const result = {
		brief,
		analysis: {
			market: { agentName: 'Market Analyst', status: 'completed', output: 'Market dynamics analyzed — growth corridors identified, smallest viable audience mapped.', sources: ['Apify Market Data'], durationMs: agents[0].duration },
			competitive: { agentName: 'Competitive Intelligence', status: 'completed', output: 'Sameness audit complete — 4 competitors mapped, vulnerability matrix generated.', sources: ['Apify Competitive Data'], durationMs: agents[1].duration },
			cultural: { agentName: 'Cultural Resonance', status: 'completed', output: 'Cultural contradiction identified — identity myth opportunity mapped with signal strength.', sources: ['Apify Social Data'], durationMs: agents[2].duration },
			brand: { agentName: 'Brand Architect', status: 'completed', output: 'Brand position synthesized — proprietary emotion defined, MECE options generated.', sources: [], durationMs: agents[3].duration },
			synthesis
		},
		metadata: {
			agentsUsed: 5,
			dataSourcesPurchased: 3,
			totalCostUsd: 115,
			durationMs: 22000,
			txHashes: []
		}
	};

	enqueue('result', result);
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

			// Demo mode: emit fake but realistic SSE events without calling the real swarm
			if (USE_DEMO_MODE) {
				emitDemoSwarm(enqueue, brief)
					.then(() => controller.close())
					.catch((err) => {
						enqueue('error', { message: err instanceof Error ? err.message : 'Demo error' });
						controller.close();
					});
				return;
			}

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
