import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Load a prompt file from the prompts directory
 * @param filename - Name of the prompt file (e.g., 'market-analyst.txt')
 * @returns Trimmed prompt content
 */
export async function loadPrompt(filename: string): Promise<string> {
	try {
		// Resolve path relative to this module's location
		const currentDir = dirname(fileURLToPath(import.meta.url));
		const promptPath = resolve(currentDir, 'prompts', filename);

		const content = await readFile(promptPath, 'utf-8');
		return content.trim();
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
			throw new Error(`Prompt file not found: ${filename}`);
		}
		throw error;
	}
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
