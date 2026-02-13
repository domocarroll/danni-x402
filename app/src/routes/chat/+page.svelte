<script lang="ts">
	import { chatStore } from '$lib/stores/chat.svelte';
	import { swarmStore } from '$lib/stores/swarm.svelte';
	import { paymentsStore } from '$lib/stores/payments.svelte';
	import type { AgentOutput } from '$lib/types';
	import MessageBubble from '$lib/components/MessageBubble.svelte';
	import SwarmViz from '$lib/components/SwarmViz.svelte';
	import PaymentFlow from '$lib/components/PaymentFlow.svelte';

	let inputRef: HTMLTextAreaElement | undefined = $state();

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const brief = chatStore.input.trim();
		if (!brief || chatStore.isStreaming) return;

		chatStore.sendBrief(brief);
		runMockFlow(brief);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			const form = (e.target as HTMLElement).closest('form');
			if (form) form.requestSubmit();
		}
	}

	async function runMockFlow(brief: string) {
		paymentsStore.reset();
		swarmStore.reset();

		paymentsStore.setPaymentStep('challenged');
		swarmStore.setPhase('payment', 'Processing payment...');
		await delay(1000);

		paymentsStore.setPaymentStep('signing');
		swarmStore.setPhase('payment', 'Signing transaction...');
		await delay(1000);

		paymentsStore.setPaymentStep('settling');
		swarmStore.setPhase('payment', 'Settling on-chain...');
		await delay(1000);

		const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
		paymentsStore.setPaymentStep('confirmed');
		paymentsStore.setCurrentTxHash(mockTxHash);
		await delay(500);

		paymentsStore.addTransaction({
			id: `tx_${Date.now()}`,
			txHash: mockTxHash,
			amount: '$100',
			service: 'Brand Analysis',
			network: 'Base Sepolia',
			timestamp: Date.now(),
			status: 'confirmed'
		});

		swarmStore.setPhase('data-acquisition', 'Purchasing market data...');
		await delay(800);

		swarmStore.setPhase('analysis', 'Agents analyzing...');

		const agentNames = swarmStore.agentNames;
		for (const name of agentNames) {
			swarmStore.setAgentStatus(name, 'running');
			await delay(1200 + Math.random() * 600);

			const mockResult: AgentOutput = {
				agentName: name,
				status: 'completed',
				output: getMockOutput(name, brief),
				sources: getMockSources(name),
				durationMs: 1200 + Math.floor(Math.random() * 800)
			};
			swarmStore.setAgentResult(name, mockResult);
		}

		swarmStore.setPhase('synthesis', 'Synthesizing insights...');
		await delay(1500);

		const synthesisText = `Based on multi-dimensional analysis of "${brief}", three strategic imperatives emerge: (1) Market positioning should leverage the identified whitespace between premium and accessible segments, (2) Competitive differentiation requires investing in the cultural narratives that resonate with emerging audience segments, (3) Brand architecture should evolve toward a more modular expression system that maintains coherence while enabling contextual adaptation.`;

		swarmStore.setSynthesis(synthesisText);
		swarmStore.setPhase('complete', 'Analysis complete');

		chatStore.receiveResponse({
			id: chatStore.generateId(),
			role: 'assistant',
			content: synthesisText,
			timestamp: Date.now(),
			swarmResult: {
				analysis: {
					market: { agentName: 'market', status: 'completed', output: getMockOutput('market', brief), sources: getMockSources('market'), durationMs: 1450 },
					competitive: { agentName: 'competitive', status: 'completed', output: getMockOutput('competitive', brief), sources: getMockSources('competitive'), durationMs: 1620 },
					cultural: { agentName: 'cultural', status: 'completed', output: getMockOutput('cultural', brief), sources: getMockSources('cultural'), durationMs: 1380 },
					brand: { agentName: 'brand', status: 'completed', output: getMockOutput('brand', brief), sources: getMockSources('brand'), durationMs: 1550 },
					synthesis: synthesisText
				},
				metadata: {
					agentsUsed: 4,
					dataSourcesPurchased: 3,
					totalCostUsd: 115,
					durationMs: 10200,
					txHashes: [mockTxHash]
				}
			}
		});
	}

	function getMockOutput(agent: string, brief: string): string {
		const outputs: Record<string, string> = {
			market: `Market analysis for "${brief}" reveals a $4.2B addressable market with 12% YoY growth. Key opportunity in the mid-premium segment where demand outpaces supply. Three emerging trends: sustainability-driven purchasing, digital-first brand discovery, and community-based loyalty models.`,
			competitive: `Competitive landscape shows 4 major players with combined 67% market share. The gap exists in authentic storytelling — competitors rely heavily on performance marketing. Differentiation opportunity through owned-media content and strategic partnerships with cultural institutions.`,
			cultural: `Cultural analysis identifies a shift toward "conscious consumption" in the target demographic. Social listening reveals strong sentiment around transparency and craftsmanship narratives. Opportunity to align brand voice with the emerging "post-aspirational" cultural movement.`,
			brand: `Brand architecture assessment suggests a masterbrand strategy with sub-brand flexibility. Current positioning is underleveraged — the brand's heritage narrative could command 30-40% price premium. Typography and visual system need modernization while preserving heritage cues.`
		};
		return outputs[agent] ?? `Analysis complete for ${agent}.`;
	}

	function getMockSources(agent: string): string[] {
		const sources: Record<string, string[]> = {
			market: ['IBISWorld Industry Report', 'Statista Market Forecast 2026', 'CB Insights Trend Analysis'],
			competitive: ['SimilarWeb Traffic Data', 'SEMrush Competitor Audit', 'Crunchbase Funding Data'],
			cultural: ['Reddit Sentiment Analysis', 'Twitter/X Trend Mining', 'Google Trends Regional'],
			brand: ['Brand Asset Valuator', 'Kantar BrandZ', 'Internal Brand Audit']
		};
		return sources[agent] ?? ['Analysis source'];
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
					<h2>Brief Danni</h2>
					<p>Describe your brand, product, or strategic challenge. Five AI analysts will produce a comprehensive strategic brief.</p>
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
		max-width: 400px;
		line-height: 1.6;
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
