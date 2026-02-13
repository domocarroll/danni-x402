/** LLM provider interface - abstracts CLI vs API backends */
export interface LLMProvider {
	complete(params: {
		systemPrompt: string;
		userMessage: string;
		maxTokens?: number;
	}): Promise<string>;
}
