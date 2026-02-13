import type { AgentOutput } from '$lib/types';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed' | 'timeout';

export interface AgentState {
	name: string;
	displayName: string;
	status: AgentStatus;
	output: string;
	sources: string[];
	durationMs: number;
	startedAt: number | null;
}

export type SwarmPhase = 'idle' | 'payment' | 'data-acquisition' | 'analysis' | 'synthesis' | 'complete' | 'error';

const AGENT_NAMES = ['market', 'competitive', 'cultural', 'brand'] as const;
type AgentName = typeof AGENT_NAMES[number];

const DISPLAY_NAMES: Record<AgentName, string> = {
	market: 'Market Analyst',
	competitive: 'Competitive Strategist',
	cultural: 'Cultural Observer',
	brand: 'Brand Architect'
};

function createInitialAgents(): Record<AgentName, AgentState> {
	return {
		market: { name: 'market', displayName: DISPLAY_NAMES.market, status: 'idle', output: '', sources: [], durationMs: 0, startedAt: null },
		competitive: { name: 'competitive', displayName: DISPLAY_NAMES.competitive, status: 'idle', output: '', sources: [], durationMs: 0, startedAt: null },
		cultural: { name: 'cultural', displayName: DISPLAY_NAMES.cultural, status: 'idle', output: '', sources: [], durationMs: 0, startedAt: null },
		brand: { name: 'brand', displayName: DISPLAY_NAMES.brand, status: 'idle', output: '', sources: [], durationMs: 0, startedAt: null }
	};
}

function createSwarmStore() {
	let agents = $state<Record<AgentName, AgentState>>(createInitialAgents());
	let phase = $state<SwarmPhase>('idle');
	let synthesis = $state('');
	let progressMessage = $state('');

	const activeAgents = $derived(
		Object.values(agents).filter((a) => a.status === 'running')
	);
	const completedAgents = $derived(
		Object.values(agents).filter((a) => a.status === 'completed')
	);
	const allAgents = $derived(Object.values(agents));
	const isRunning = $derived(phase !== 'idle' && phase !== 'complete' && phase !== 'error');

	function setPhase(p: SwarmPhase, message?: string) {
		phase = p;
		if (message) progressMessage = message;
	}

	function setAgentStatus(name: AgentName, status: AgentStatus) {
		agents[name].status = status;
		if (status === 'running') {
			agents[name].startedAt = Date.now();
		}
	}

	function setAgentResult(name: AgentName, result: AgentOutput) {
		agents[name].status = result.status;
		agents[name].output = result.output;
		agents[name].sources = result.sources;
		agents[name].durationMs = result.durationMs;
	}

	function setSynthesis(s: string) {
		synthesis = s;
	}

	function reset() {
		agents = createInitialAgents();
		phase = 'idle';
		synthesis = '';
		progressMessage = '';
	}

	return {
		get agents() { return agents; },
		get phase() { return phase; },
		get synthesis() { return synthesis; },
		get progressMessage() { return progressMessage; },
		get activeAgents() { return activeAgents; },
		get completedAgents() { return completedAgents; },
		get allAgents() { return allAgents; },
		get isRunning() { return isRunning; },
		get agentNames() { return AGENT_NAMES; },
		setPhase,
		setAgentStatus,
		setAgentResult,
		setSynthesis,
		reset
	};
}

export const swarmStore = createSwarmStore();
