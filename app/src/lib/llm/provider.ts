import { CLIBackend } from './cli-backend.js';
import { APIBackend } from './api-backend.js';
import type { LLMProvider } from '$lib/types/llm.js';

// Re-export type for convenience
export type { LLMProvider };

/**
 * Factory function to create the appropriate LLM provider.
 * - USE_CLI=true (default): spawns `claude -p` for free dev/testing on Max sub
 * - USE_CLI=false: uses Anthropic API via SDK (needs ANTHROPIC_API_KEY)
 */
export function createLLMProvider(): LLMProvider {
	const useCLI = process.env.USE_CLI !== 'false';

	if (useCLI) {
		return new CLIBackend();
	}

	return new APIBackend();
}
