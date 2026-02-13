import { z } from 'zod';

/** Input to the swarm orchestrator */
export interface SwarmInput {
	brief: string;
	brand?: string;
	industry?: string;
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

// Runtime validation schemas (zod companions to the TS interfaces above)

export const AgentOutputSchema = z.object({
	agentName: z.string(),
	status: z.enum(['completed', 'failed', 'timeout']),
	output: z.string(),
	sources: z.array(z.string()),
	durationMs: z.number()
});

export const SwarmOutputSchema = z.object({
	brief: z.string(),
	analysis: z.object({
		market: AgentOutputSchema,
		competitive: AgentOutputSchema,
		cultural: AgentOutputSchema,
		brand: AgentOutputSchema,
		synthesis: z.string()
	}),
	metadata: z.object({
		agentsUsed: z.number(),
		dataSourcesPurchased: z.number(),
		totalCostUsd: z.number(),
		durationMs: z.number(),
		txHashes: z.array(z.string())
	})
});

export function validateSwarmOutput(output: unknown): SwarmOutput {
	return SwarmOutputSchema.parse(output) as SwarmOutput;
}
