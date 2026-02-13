import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider } from '$lib/types/llm.js';

/**
 * API Backend — uses the Anthropic SDK for LLM completions.
 * Activated when USE_CLI=false (production/deployment).
 * Requires ANTHROPIC_API_KEY environment variable.
 */
export class APIBackend implements LLMProvider {
	private client: Anthropic;
	private model: string;

	constructor() {
		const apiKey = process.env.ANTHROPIC_API_KEY;
		if (!apiKey) {
			throw new Error('ANTHROPIC_API_KEY is required when USE_CLI=false');
		}

		this.client = new Anthropic({ apiKey });
		this.model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5-20250929';
	}

	async complete(params: {
		systemPrompt: string;
		userMessage: string;
		maxTokens?: number;
	}): Promise<string> {
		const { systemPrompt, userMessage, maxTokens = 16384 } = params;

		const response = await this.client.messages.create({
			model: this.model,
			max_tokens: maxTokens,
			system: systemPrompt,
			messages: [{ role: 'user', content: userMessage }]
		});

		const textBlock = response.content.find((block) => block.type === 'text');
		if (!textBlock || textBlock.type !== 'text') {
			throw new Error('No text content in Anthropic API response');
		}

		return textBlock.text;
	}
}
