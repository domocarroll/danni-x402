import pMap from 'p-map';
import { createLLMProvider } from '$lib/llm/provider.js';
import { runMarketAnalyst } from './agents/market-analyst.js';
import { runCompetitiveIntel } from './agents/competitive-intel.js';
import { runCulturalResonance } from './agents/cultural-resonance.js';
import { runBrandArchitect } from './agents/brand-architect.js';
import { runDanniSynthesis } from './agents/danni-synthesis.js';
import { SubagentTracker } from './tracker.js';
import type { SwarmInput, SwarmOutput, AgentOutput } from '$lib/types/swarm.js';
import { validateSwarmOutput } from '$lib/types/swarm.js';

/**
 * Execute the full swarm: 4 parallel sub-agents + sequential synthesis
 * @param input - Strategic brief and configuration
 * @returns Validated SwarmOutput with analysis from all 5 agents
 */
export async function executeSwarm(
	input: SwarmInput,
	externalTracker?: SubagentTracker
): Promise<SwarmOutput> {
	const startTime = Date.now();

	// Create LLM provider (defaults to CLI backend)
	const provider = createLLMProvider();

	// Use external tracker if provided (e.g. StreamingTracker for SSE), else create default
	const tracker = externalTracker ?? new SubagentTracker();

	// Stagger delay to avoid rate limiting (1s between launches)
	// All 4 agents run concurrently but their API calls don't collide
	const STAGGER_MS = 1000;
	const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	// Define the four sub-agents with staggered launch
	const subAgentTasks = [
		() =>
			runMarketAnalyst({
				provider,
				brief: input.brief,
				brand: input.brand,
				industry: input.industry,
				tracker
			}),
		() =>
			delay(STAGGER_MS).then(() =>
				runCompetitiveIntel({
					provider,
					brief: input.brief,
					brand: input.brand,
					industry: input.industry,
					tracker
				})
			),
		() =>
			delay(STAGGER_MS * 2).then(() =>
				runCulturalResonance({
					provider,
					brief: input.brief,
					brand: input.brand,
					industry: input.industry,
					tracker
				})
			),
		() =>
			delay(STAGGER_MS * 3).then(() =>
				runBrandArchitect({
					provider,
					brief: input.brief,
					brand: input.brand,
					industry: input.industry,
					tracker
				})
			)
	];

	// Execute all four sub-agents in parallel (stagger handles rate limiting)
	const subAgentResults = await pMap(subAgentTasks, (task) => task(), { concurrency: 4 });

	// After all four complete, run Danni synthesis with their combined outputs
	const synthesis = await runDanniSynthesis({
		provider,
		agentOutputs: subAgentResults,
		brief: input.brief,
		tracker
	});

	// Build SwarmOutput object
	const output: SwarmOutput = {
		brief: input.brief,
		analysis: {
			market: findAgentOutput(subAgentResults, 'Market'),
			competitive: findAgentOutput(subAgentResults, 'Competitive'),
			cultural: findAgentOutput(subAgentResults, 'Cultural'),
			brand: findAgentOutput(subAgentResults, 'Brand'),
			synthesis
		},
		metadata: {
			agentsUsed: 5,
			dataSourcesPurchased: 0, // Phase 6 wires Data Broker
			totalCostUsd: 0, // Phase 6 wires payment tracking
			durationMs: Date.now() - startTime,
			txHashes: [] // Phase 6 wires payment receipts
		}
	};

	// Validate with zod schema
	try {
		return validateSwarmOutput(output);
	} catch (error) {
		// Log validation warning but still return the raw output (don't crash during dev)
		console.warn('SwarmOutput validation failed:', error instanceof Error ? error.message : error);
		return output;
	}
}

/**
 * Helper to find agent output by name substring
 */
function findAgentOutput(results: AgentOutput[], nameSubstring: string): AgentOutput {
	const found = results.find((r) => r.agentName.includes(nameSubstring));
	if (!found) {
		throw new Error(`Agent output not found for: ${nameSubstring}`);
	}
	return found;
}

