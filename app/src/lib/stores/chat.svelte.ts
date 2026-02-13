import type { AgentOutput } from '$lib/types';

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
	/** Attached swarm result if this is a completed analysis */
	swarmResult?: {
		analysis: {
			market: AgentOutput;
			competitive: AgentOutput;
			cultural: AgentOutput;
			brand: AgentOutput;
			synthesis: string;
		};
		metadata: {
			agentsUsed: number;
			dataSourcesPurchased: number;
			totalCostUsd: number;
			durationMs: number;
			txHashes: string[];
		};
	};
}

function createChatStore() {
	let messages = $state<ChatMessage[]>([]);
	let input = $state('');
	let isStreaming = $state(false);
	let error = $state<string | null>(null);
	let eventSource: EventSource | null = null;

	const messageCount = $derived(messages.length);
	const lastMessage = $derived(messages.length > 0 ? messages[messages.length - 1] : null);

	function addMessage(msg: ChatMessage) {
		messages.push(msg);
	}

	function generateId(): string {
		return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
	}

	function sendBrief(brief: string) {
		const userMsg: ChatMessage = {
			id: generateId(),
			role: 'user',
			content: brief,
			timestamp: Date.now()
		};
		addMessage(userMsg);
		input = '';
		isStreaming = true;
		error = null;
	}

	function receiveResponse(msg: ChatMessage) {
		addMessage(msg);
		isStreaming = false;
	}

	function setError(err: string) {
		error = err;
		isStreaming = false;
	}

	function clearError() {
		error = null;
	}

	function setEventSource(es: EventSource | null) {
		if (eventSource) {
			eventSource.close();
		}
		eventSource = es;
	}

	function closeStream() {
		if (eventSource) {
			eventSource.close();
			eventSource = null;
		}
		isStreaming = false;
	}

	function clear() {
		messages = [];
		input = '';
		isStreaming = false;
		error = null;
		closeStream();
	}

	return {
		get messages() { return messages; },
		get input() { return input; },
		set input(v: string) { input = v; },
		get isStreaming() { return isStreaming; },
		get error() { return error; },
		get messageCount() { return messageCount; },
		get lastMessage() { return lastMessage; },
		sendBrief,
		receiveResponse,
		addMessage,
		generateId,
		setError,
		clearError,
		setEventSource,
		closeStream,
		clear
	};
}

export const chatStore = createChatStore();
