import { spawn } from 'child_process';
import type { LLMProvider } from '$lib/types/llm.js';

/**
 * CLI Backend - spawns `claude -p` for LLM completions
 * Uses Claude CLI with prompt caching for fast iteration
 */
export class CLIBackend implements LLMProvider {
	async complete(params: {
		systemPrompt: string;
		userMessage: string;
		maxTokens?: number;
	}): Promise<string> {
		const { systemPrompt, userMessage } = params;

		// Combine prompts with clear separator
		const fullPrompt = `${systemPrompt}\n\n---\n\nUser Request:\n${userMessage}`;

		return new Promise((resolve, reject) => {
			// Spawn claude with -p flag and text output format
			const claude = spawn('claude', ['-p', '--output-format', 'text']);

			const stdout: Buffer[] = [];
			const stderr: Buffer[] = [];
			let timeout: NodeJS.Timeout | null = null;
			let killed = false;

			// Set 120-second timeout
			timeout = setTimeout(() => {
				killed = true;
				claude.kill('SIGTERM');
				reject(new Error('Claude CLI process timed out after 120 seconds'));
			}, 120000);

			// Collect stdout chunks
			claude.stdout.on('data', (chunk: Buffer) => {
				stdout.push(chunk);
			});

			// Collect stderr chunks
			claude.stderr.on('data', (chunk: Buffer) => {
				stderr.push(chunk);
			});

			// Handle process close
			claude.on('close', (code) => {
				if (timeout) clearTimeout(timeout);

				if (killed) {
					// Already rejected in timeout handler
					return;
				}

				const output = Buffer.concat(stdout).toString('utf-8').trim();
				const error = Buffer.concat(stderr).toString('utf-8').trim();

				if (code === 0) {
					if (output.length === 0) {
						resolve('Error: Claude CLI returned empty output');
					} else {
						resolve(output);
					}
				} else {
					reject(
						new Error(
							`Claude CLI exited with code ${code}${error ? `\nStderr: ${error}` : ''}`
						)
					);
				}
			});

			// Handle spawn errors
			claude.on('error', (err) => {
				if (timeout) clearTimeout(timeout);
				reject(new Error(`Failed to spawn claude CLI: ${err.message}`));
			});

			// Write prompt to stdin and close
			claude.stdin.write(fullPrompt);
			claude.stdin.end();
		});
	}
}
