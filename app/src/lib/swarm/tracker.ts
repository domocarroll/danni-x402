/**
 * SubagentTracker - Observability layer for swarm execution
 * Phase 6 will wire this to SSE streaming for glass-box UI
 */

export interface AgentEvent {
	event: 'agent_start' | 'agent_complete' | 'agent_fail';
	agentName: string;
	timestamp: number;
	durationMs?: number;
	outputLength?: number;
	error?: string;
}

export interface TrackerSummary {
	total: number;
	completed: number;
	failed: number;
	totalDurationMs: number;
}

export class SubagentTracker {
	private events: AgentEvent[] = [];
	private startTimes: Map<string, number> = new Map();

	/**
	 * Record agent start event
	 */
	logStart(agentName: string): void {
		const timestamp = Date.now();
		this.startTimes.set(agentName, timestamp);
		this.events.push({
			event: 'agent_start',
			agentName,
			timestamp
		});
	}

	/**
	 * Record agent completion event
	 */
	logComplete(agentName: string, output: string, durationMs: number): void {
		this.events.push({
			event: 'agent_complete',
			agentName,
			timestamp: Date.now(),
			durationMs,
			outputLength: output.length
		});
		this.startTimes.delete(agentName);
	}

	/**
	 * Record agent failure event
	 */
	logFail(agentName: string, error: string, durationMs: number): void {
		this.events.push({
			event: 'agent_fail',
			agentName,
			timestamp: Date.now(),
			durationMs,
			error
		});
		this.startTimes.delete(agentName);
	}

	/**
	 * Get immutable copy of all events
	 */
	getEvents(): ReadonlyArray<AgentEvent> {
		return [...this.events];
	}

	/**
	 * Get quick summary stats
	 */
	getSummary(): TrackerSummary {
		const completed = this.events.filter((e) => e.event === 'agent_complete').length;
		const failed = this.events.filter((e) => e.event === 'agent_fail').length;
		const totalDurationMs = this.events
			.filter((e) => e.durationMs !== undefined)
			.reduce((sum, e) => sum + (e.durationMs || 0), 0);

		return {
			total: completed + failed,
			completed,
			failed,
			totalDurationMs
		};
	}
}
