import { SubagentTracker } from './tracker.js';
import type { AgentEvent } from './tracker.js';

export type SSEEvent =
	| AgentEvent
	| { event: 'synthesis_start'; timestamp: number }
	| { event: 'synthesis_complete'; timestamp: number }
	| { event: 'payment_confirmed'; timestamp: number };

export type SSECallback = (event: SSEEvent) => void;

/**
 * StreamingTracker — extends SubagentTracker with real-time SSE callbacks.
 * Phase 6: enables the glass-box UI to show agents activating in real time.
 */
export class StreamingTracker extends SubagentTracker {
	private callback: SSECallback;

	constructor(callback: SSECallback) {
		super();
		this.callback = callback;
	}

	override logStart(agentName: string): void {
		super.logStart(agentName);
		this.callback({ event: 'agent_start', agentName, timestamp: Date.now() });
	}

	override logComplete(agentName: string, output: string, durationMs: number): void {
		super.logComplete(agentName, output, durationMs);
		this.callback({
			event: 'agent_complete',
			agentName,
			timestamp: Date.now(),
			durationMs,
			outputLength: output.length
		});
	}

	override logFail(agentName: string, error: string, durationMs: number): void {
		super.logFail(agentName, error, durationMs);
		this.callback({
			event: 'agent_fail',
			agentName,
			timestamp: Date.now(),
			durationMs,
			error
		});
	}

	emitSynthesisStart(): void {
		this.callback({ event: 'synthesis_start', timestamp: Date.now() });
	}

	emitSynthesisComplete(): void {
		this.callback({ event: 'synthesis_complete', timestamp: Date.now() });
	}

	emitPaymentConfirmed(): void {
		this.callback({ event: 'payment_confirmed', timestamp: Date.now() });
	}
}
