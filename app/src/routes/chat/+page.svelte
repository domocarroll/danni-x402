<script lang="ts">
	import { chatStore } from '$lib/stores/chat.svelte';
	import { swarmStore } from '$lib/stores/swarm.svelte';
	import { paymentsStore } from '$lib/stores/payments.svelte';
	import type { SwarmOutput } from '$lib/types';
	import MessageBubble from '$lib/components/MessageBubble.svelte';
	import SwarmViz from '$lib/components/SwarmViz.svelte';
	import PaymentFlow from '$lib/components/PaymentFlow.svelte';

	let inputRef: HTMLTextAreaElement | undefined = $state();

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const brief = chatStore.input.trim();
		if (!brief || chatStore.isStreaming) return;

		chatStore.sendBrief(brief);
		runAnalysis(brief);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			const form = (e.target as HTMLElement).closest('form');
			if (form) form.requestSubmit();
		}
	}

	function agentNameToKey(name: string): 'market' | 'competitive' | 'cultural' | 'brand' | null {
		if (name.includes('Market')) return 'market';
		if (name.includes('Competitive')) return 'competitive';
		if (name.includes('Cultural')) return 'cultural';
		if (name.includes('Brand')) return 'brand';
		return null;
	}

	async function runAnalysis(brief: string) {
		paymentsStore.reset();
		swarmStore.reset();

		// Simulate payment flow (x402 handles this server-side; UI shows the steps)
		paymentsStore.setPaymentStep('challenged');
		swarmStore.setPhase('payment', 'Processing x402 payment...');
		await delay(600);

		paymentsStore.setPaymentStep('signing');
		swarmStore.setPhase('payment', 'Signing USDC transaction...');
		await delay(600);

		paymentsStore.setPaymentStep('settling');
		swarmStore.setPhase('payment', 'Settling on Base Sepolia...');

		try {
			const response = await fetch('/api/danni/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'text/event-stream'
				},
				body: JSON.stringify({ brief })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
				chatStore.setError(errorData.error ?? `HTTP ${response.status}`);
				swarmStore.setPhase('error', 'Analysis failed');
				return;
			}

			if (!response.body) {
				chatStore.setError('No response body');
				swarmStore.setPhase('error', 'No response');
				return;
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';
			let swarmResult: SwarmOutput | null = null;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });

				// Parse SSE events from buffer
				const parts = buffer.split('\n\n');
				buffer = parts.pop() ?? '';

				for (const part of parts) {
					const eventMatch = part.match(/^event: (.+)$/m);
					const dataMatch = part.match(/^data: (.+)$/m);

					if (!eventMatch || !dataMatch) continue;

					const eventType = eventMatch[1];
					let eventData: Record<string, unknown>;
					try {
						eventData = JSON.parse(dataMatch[1]);
					} catch {
						continue;
					}

					handleSSEEvent(eventType, eventData);

					if (eventType === 'result') {
						swarmResult = eventData as unknown as SwarmOutput;
					}
				}
			}

			// Complete the flow
			if (swarmResult) {
				swarmStore.setSynthesis(swarmResult.analysis.synthesis);
				swarmStore.setPhase('complete', 'Analysis complete');

				chatStore.receiveResponse({
					id: chatStore.generateId(),
					role: 'assistant',
					content: swarmResult.analysis.synthesis,
					timestamp: Date.now(),
					swarmResult: {
						analysis: swarmResult.analysis,
						metadata: swarmResult.metadata
					}
				});
			} else {
				chatStore.setError('No result received from swarm');
				swarmStore.setPhase('error', 'No result');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Network error';
			chatStore.setError(message);
			swarmStore.setPhase('error', message);
		}
	}

	function handleSSEEvent(eventType: string, data: Record<string, unknown>) {
		switch (eventType) {
			case 'payment_confirmed': {
				const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
				paymentsStore.setPaymentStep('confirmed');
				paymentsStore.setCurrentTxHash(txHash);
				paymentsStore.addTransaction({
					id: `tx_${Date.now()}`,
					txHash,
					amount: '$100',
					service: 'Brand Analysis',
					network: 'Base Sepolia',
					timestamp: Date.now(),
					status: 'confirmed'
				});
				swarmStore.setPhase('analysis', 'Swarm activating...');
				break;
			}
			case 'agent_start': {
				const key = agentNameToKey(data.agentName as string);
				if (key) {
					swarmStore.setAgentStatus(key, 'running');
				} else if ((data.agentName as string)?.includes('Danni')) {
					swarmStore.setPhase('synthesis', 'Danni synthesizing insights...');
				}
				break;
			}
			case 'agent_complete': {
				const key = agentNameToKey(data.agentName as string);
				if (key) {
					swarmStore.setAgentResult(key, {
						agentName: data.agentName as string,
						status: 'completed',
						output: `Analysis complete (${data.outputLength} chars)`,
						sources: [],
						durationMs: (data.durationMs as number) ?? 0
					});
				}
				break;
			}
			case 'agent_fail': {
				const key = agentNameToKey(data.agentName as string);
				if (key) {
					swarmStore.setAgentStatus(key, 'failed');
				}
				break;
			}
			case 'error': {
				chatStore.setError((data.message as string) ?? 'Unknown error');
				swarmStore.setPhase('error', 'Swarm error');
				break;
			}
		}
	}

	function delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
</script>

<svelte:head>
	<title>Danni - Chat</title>
</svelte:head>

<div class="chat-page">
	<div class="chat-main">
		<div class="messages">
			{#if chatStore.messages.length === 0}
				<div class="empty-state">
					<div class="empty-icon">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1">
							<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
						</svg>
					</div>
					<h2>What intrigues me most...</h2>
					<p>Tell me about your brand. The market you're navigating. The audience you're trying to reach. I'll activate five specialist analysts and deliver a strategic brief a creative director could build a campaign from.</p>
					<p class="powered-by">Powered by x402 • Base Sepolia</p>
				</div>
			{:else}
				{#each chatStore.messages as message (message.id)}
					<MessageBubble {message} />
				{/each}
				{#if chatStore.isStreaming && !chatStore.lastMessage?.swarmResult}
					<div class="typing-indicator">
						<span></span><span></span><span></span>
					</div>
				{/if}
			{/if}
		</div>

		<form class="input-area" onsubmit={handleSubmit}>
			{#if chatStore.error}
				<div class="error-bar">
					<span>{chatStore.error}</span>
					<button type="button" onclick={() => chatStore.clearError()}>Dismiss</button>
				</div>
			{/if}
			<div class="input-row">
				<textarea
					bind:this={inputRef}
					bind:value={chatStore.input}
					placeholder="Describe your brand challenge..."
					rows="2"
					disabled={chatStore.isStreaming}
					onkeydown={handleKeydown}
				></textarea>
				<button type="submit" disabled={!chatStore.input.trim() || chatStore.isStreaming} class="send-btn" aria-label="Send message">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
					</svg>
				</button>
			</div>
			<div class="input-hint">Press Enter to send, Shift+Enter for new line</div>
		</form>
	</div>

	<aside class="sidebar">
		<PaymentFlow />
		<SwarmViz />
		<div class="economics-card">
			<h3>Economics</h3>
			<div class="economics-line">
				<span>Analysis cost</span>
				<span class="value">$100 USDC</span>
			</div>
			<div class="economics-line">
				<span>Data sources</span>
				<span class="value">$15 USDC</span>
			</div>
			<div class="economics-line detail">
				<span>3 × $5</span>
			</div>
			<div class="economics-line total">
				<span>Total</span>
				<span class="value">$115 USDC</span>
			</div>
			<div class="economics-network">
				Network: Base Sepolia
			</div>
		</div>
	</aside>
</div>

<style>
	.chat-page {
		display: grid;
		grid-template-columns: 1fr 360px;
		height: calc(100vh - 56px);
		gap: 0;
	}

	.chat-main {
		display: flex;
		flex-direction: column;
		border-right: 1px solid #1a1a1a;
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		scroll-behavior: smooth;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		gap: 0.75rem;
	}

	.empty-icon {
		margin-bottom: 0.5rem;
		opacity: 0.5;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		font-weight: 300;
		letter-spacing: 0.05em;
	}

	.empty-state p {
		font-size: 0.9rem;
		color: #666;
		max-width: 500px;
		line-height: 1.6;
	}

	.powered-by {
		font-size: 0.75rem !important;
		color: #444 !important;
		margin-top: 0.5rem;
		letter-spacing: 0.03em;
	}

	.typing-indicator {
		display: flex;
		gap: 4px;
		padding: 0.75rem 1rem;
	}

	.typing-indicator span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #6366f1;
		animation: typingBounce 1.2s ease-in-out infinite;
	}

	.typing-indicator span:nth-child(2) {
		animation-delay: 0.15s;
	}

	.typing-indicator span:nth-child(3) {
		animation-delay: 0.3s;
	}

	.input-area {
		border-top: 1px solid #1a1a1a;
		padding: 1rem 1.5rem;
		background: rgba(10, 10, 10, 0.5);
	}

	.error-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		margin-bottom: 0.75rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 0.5rem;
		font-size: 0.8rem;
		color: #ef4444;
	}

	.error-bar button {
		background: none;
		border: none;
		color: #ef4444;
		cursor: pointer;
		font-size: 0.75rem;
		opacity: 0.7;
	}

	.error-bar button:hover {
		opacity: 1;
	}

	.input-row {
		display: flex;
		gap: 0.75rem;
		align-items: flex-end;
	}

	textarea {
		flex: 1;
		resize: none;
		background: #111;
		border: 1px solid #222;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		color: #fafafa;
		font-family: inherit;
		font-size: 0.9375rem;
		line-height: 1.5;
		outline: none;
		transition: border-color 0.2s;
	}

	textarea:focus {
		border-color: #6366f1;
	}

	textarea:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	textarea::placeholder {
		color: #444;
	}

	.send-btn {
		width: 40px;
		height: 40px;
		border-radius: 0.5rem;
		background: #6366f1;
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s, opacity 0.2s;
		flex-shrink: 0;
	}

	.send-btn:hover:not(:disabled) {
		background: #4f46e5;
	}

	.send-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.input-hint {
		font-size: 0.65rem;
		color: #444;
		margin-top: 0.375rem;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		overflow-y: auto;
	}

	.economics-card {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #1a1a1a;
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.economics-card h3 {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #666;
		margin-bottom: 1rem;
	}

	.economics-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		font-size: 0.875rem;
	}

	.economics-line span {
		color: #888;
	}

	.economics-line .value {
		font-weight: 600;
		color: #fafafa;
	}

	.economics-line.detail {
		padding: 0 0 0.5rem 1rem;
		font-size: 0.75rem;
	}

	.economics-line.total {
		border-top: 1px solid #1a1a1a;
		margin-top: 0.25rem;
		padding-top: 0.75rem;
		font-weight: 600;
	}

	.economics-line.total span {
		color: #fafafa;
	}

	.economics-line.total .value {
		color: #6366f1;
	}

	.economics-network {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid #1a1a1a;
		font-size: 0.7rem;
		color: #555;
		text-align: center;
		letter-spacing: 0.03em;
	}

	@keyframes typingBounce {
		0%, 80%, 100% {
			transform: translateY(0);
			opacity: 0.4;
		}
		40% {
			transform: translateY(-6px);
			opacity: 1;
		}
	}

	@media (max-width: 900px) {
		.chat-page {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto;
		}

		.sidebar {
			border-top: 1px solid #1a1a1a;
			max-height: 300px;
		}

		.chat-main {
			border-right: none;
		}
	}
</style>
