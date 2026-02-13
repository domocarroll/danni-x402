import type { LLMProvider } from '$lib/types/llm.js';
import type { AgentOutput } from '$lib/types/swarm.js';
import { loadPrompt, withTimeout, formatAgentInput, extractSources } from '$lib/swarm/utils.js';
import type { SubagentTracker } from '$lib/swarm/tracker.js';

export async function runMarketAnalyst(params: {
	provider: LLMProvider;
	brief: string;
	brand?: string;
	industry?: string;
	tracker: SubagentTracker;
	timeoutMs?: number;
}): Promise<AgentOutput> {
	const agentName = 'Market Analyst';
	const startTime = Date.now();
	params.tracker.logStart(agentName);

	try {
		const systemPrompt = await loadPrompt('market-analyst.txt');
		const userMessage = formatAgentInput({
			brief: params.brief,
			brand: params.brand,
			industry: params.industry
		});

		const output = await withTimeout(
			params.provider.complete({ systemPrompt, userMessage }),
			params.timeoutMs ?? 120000,
			agentName
		);

		const durationMs = Date.now() - startTime;
		params.tracker.logComplete(agentName, output, durationMs);

		return {
			agentName,
			status: 'completed',
			output,
			sources: extractSources(output),
			durationMs
		};
	} catch (error) {
		const durationMs = Date.now() - startTime;
		const errorMsg = error instanceof Error ? error.message : String(error);
		params.tracker.logFail(agentName, errorMsg, durationMs);

		const isTimeout = errorMsg.includes('timed out');
		return {
			agentName,
			status: isTimeout ? 'timeout' : 'failed',
			output: `Agent failed: ${errorMsg}`,
			sources: [],
			durationMs
		};
	}
}
