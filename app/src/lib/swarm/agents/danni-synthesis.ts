import type { LLMProvider } from '$lib/types/llm.js';
import type { AgentOutput } from '$lib/types/swarm.js';
import { loadPrompt, withTimeout } from '$lib/swarm/utils.js';
import type { SubagentTracker } from '$lib/swarm/tracker.js';

/**
 * Danni synthesis agent - runs after all four sub-agents complete
 * Takes combined outputs and produces the final strategic brief
 */
export async function runDanniSynthesis(params: {
	provider: LLMProvider;
	agentOutputs: AgentOutput[];
	brief: string;
	tracker: SubagentTracker;
	timeoutMs?: number;
}): Promise<string> {
	const agentName = 'Danni Synthesis';
	const startTime = Date.now();
	params.tracker.logStart(agentName);

	try {
		const systemPrompt = await loadPrompt('danni-synthesis.txt');

		// Build user message from combined agent outputs
		const agentSections = params.agentOutputs
			.map((agent) => {
				const sectionTitle = agent.agentName.toUpperCase();
				return `## ${sectionTitle}\n${agent.output}`;
			})
			.join('\n\n');

		const userMessage = `## Original Brief
${params.brief}

${agentSections}`;

		const output = await withTimeout(
			params.provider.complete({ systemPrompt, userMessage }),
			params.timeoutMs ?? 120000,
			agentName
		);

		const durationMs = Date.now() - startTime;
		params.tracker.logComplete(agentName, output, durationMs);

		return output;
	} catch (error) {
		const durationMs = Date.now() - startTime;
		const errorMsg = error instanceof Error ? error.message : String(error);
		params.tracker.logFail(agentName, errorMsg, durationMs);

		throw new Error(`Danni synthesis failed: ${errorMsg}`);
	}
}
