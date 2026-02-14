import { getPrompt } from '$lib/swarm/prompts/index.js';

/**
 * Load a prompt by filename.
 * Uses the prompt registry (Vite ?raw imports) — no filesystem access needed at runtime.
 * Kept async for backward compatibility with existing agent code.
 */
export async function loadPrompt(filename: string): Promise<string> {
	return getPrompt(filename);
}

/**
 * Race a promise against a timeout
 * @param promise - The promise to race
 * @param timeoutMs - Timeout in milliseconds
 * @param label - Label for error messages (e.g., agent name)
 * @returns Promise that resolves with the result or rejects on timeout
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
	let timeoutId: NodeJS.Timeout;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => {
			reject(new Error(`${label} timed out after ${timeoutMs}ms`));
		}, timeoutMs);
	});

	return Promise.race([promise, timeoutPromise]).finally(() => {
		// Clean up timeout to prevent memory leaks
		clearTimeout(timeoutId);
	});
}

/**
 * Format agent input into a structured user message
 * @param input - Brief, brand, and industry information
 * @returns Formatted markdown string
 */
export function formatAgentInput(input: {
	brief: string;
	brand?: string;
	industry?: string;
}): string {
	return `## Strategic Brief
${input.brief}

## Brand
${input.brand || 'Not specified'}

## Industry
${input.industry || 'Not specified'}`;
}

/**
 * Extract source citations from structured agent output
 * Matches lines starting with [N] followed by text (citation format mandated by prompts)
 * @param output - Agent output text
 * @returns Array of citation strings
 */
export function extractSources(output: string): string[] {
	const citationPattern = /^\[(\d+)\]\s+(.+)$/gm;
	const sources: string[] = [];
	let match: RegExpExecArray | null;

	while ((match = citationPattern.exec(output)) !== null) {
		sources.push(match[2].trim());
	}

	return sources;
}
