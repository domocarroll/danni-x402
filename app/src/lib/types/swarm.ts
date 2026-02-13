/** Input to the swarm orchestrator */
export interface SwarmInput {
	brief: string;
	brand?: string;
	industry?: string;
	dataBrokerBaseUrl: string;
	walletPrivateKey: string;
}

/** Output from a single swarm agent */
export interface AgentOutput {
	agentName: string;
	status: 'completed' | 'failed' | 'timeout';
	output: string;
	sources: string[];
	durationMs: number;
}

/** Combined output from the full swarm */
export interface SwarmOutput {
	brief: string;
	analysis: {
		market: AgentOutput;
		competitive: AgentOutput;
		cultural: AgentOutput;
		brand: AgentOutput;
		synthesis: string;
	};
	metadata: {
		agentsUsed: number;
		dataSourcesPurchased: number;
		totalCostUsd: number;
		durationMs: number;
		txHashes: string[];
	};
}
