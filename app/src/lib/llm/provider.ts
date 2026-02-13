import { CLIBackend } from './cli-backend.js';
import type { LLMProvider } from '$lib/types/llm.js';

// Re-export type for convenience
export type { LLMProvider };

/**
 * Factory function to create the appropriate LLM provider
 * Default: CLI backend (claude -p) for free dev/testing
 * Future: Agent SDK backend when USE_CLI=false (Phase 6)
 */
export function createLLMProvider(): LLMProvider {
	const useCLI = process.env.USE_CLI !== 'false';

	if (useCLI) {
		return new CLIBackend();
	}

	throw new Error('API backend not yet implemented - set USE_CLI=true or omit');
}
