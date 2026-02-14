<script lang="ts">
	import { chatStore } from '$lib/stores/chat.svelte';
	import { swarmStore } from '$lib/stores/swarm.svelte';
	import { paymentsStore } from '$lib/stores/payments.svelte';
	import { walletStore } from '$lib/stores/wallet.svelte';
	import { decodePaymentResponse } from '$lib/x402/client.js';
	import type { SwarmOutput } from '$lib/types';
	import MessageBubble from '$lib/components/MessageBubble.svelte';
	import SwarmViz from '$lib/components/SwarmViz.svelte';
	import PaymentFlow from '$lib/components/PaymentFlow.svelte';

	let inputRef: HTMLTextAreaElement | undefined = $state();
	let messagesContainer: HTMLDivElement | undefined = $state();
	let bottomSentinel: HTMLDivElement | undefined = $state();

	// Auto-scroll to bottom when messages change
	$effect(() => {
		// Track messages length to trigger on new messages
		const _len = chatStore.messages.length;
		const _streaming = chatStore.isStreaming;
		if (bottomSentinel) {
			// Use requestAnimationFrame to ensure DOM has updated
			requestAnimationFrame(() => {
				bottomSentinel?.scrollIntoView({ behavior: 'smooth' });
			});
		}
	});

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

		if (walletStore.state !== 'connected' || !walletStore.client) {
			paymentsStore.setPaymentStep('challenged');
			swarmStore.setPhase('payment', 'Connecting wallet...');
			await walletStore.connect();
			if (walletStore.state !== 'connected' || !walletStore.client) {
				chatStore.setError(walletStore.error ?? 'Wallet connection required for x402 payment');
				swarmStore.setPhase('error', 'Wallet not connected');
				paymentsStore.reset();
				return;
			}
		}

		try {
			paymentsStore.setPaymentStep('challenged');
			swarmStore.setPhase('payment', 'Payment required — $100 USDC via x402...');
			await new Promise(r => setTimeout(r, 800));

			paymentsStore.setPaymentStep('signing');
			swarmStore.setPhase('payment', 'Requesting wallet signature...');

			await walletStore.client!.signMessage({
				account: walletStore.client!.account!,
				message: 'x402 payment authorization: $100 USDC for Strategic Brand Analysis on Base Sepolia (eip155:84532)',
			});

			paymentsStore.setPaymentStep('settling');
			swarmStore.setPhase('payment', 'Settling USDC on Base Sepolia...');
			await new Promise(r => setTimeout(r, 2000));

			const demoTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
			paymentsStore.setPaymentStep('confirmed');
			paymentsStore.setCurrentTxHash(demoTxHash);
			paymentsStore.addTransaction({
				id: `tx_${Date.now()}`,
				txHash: demoTxHash,
				amount: '$100',
				service: 'Brand Analysis',
				network: 'Base Sepolia',
				timestamp: Date.now(),
				status: 'confirmed',
			});

			swarmStore.setPhase('analysis', 'Swarm activating...');

			const response = await fetch('/api/danni/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'text/event-stream',
				},
				body: JSON.stringify({ brief }),
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
						metadata: swarmResult.metadata,
					},
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
				// Server-side payment confirmation event (backup for SSE-based flows)
				const serverTxHash = (data.txHash as string) ?? paymentsStore.currentTxHash;
				if (serverTxHash && !paymentsStore.currentTxHash) {
					paymentsStore.setPaymentStep('confirmed');
					paymentsStore.setCurrentTxHash(serverTxHash);
					paymentsStore.addTransaction({
						id: `tx_${Date.now()}`,
						txHash: serverTxHash,
						amount: '$100',
						service: 'Brand Analysis',
						network: 'Base Sepolia',
						timestamp: Date.now(),
						status: 'confirmed',
					});
				}
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
						durationMs: (data.durationMs as number) ?? 0,
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
</script>

<svelte:head>
	<title>Danni - Chat</title>
</svelte:head>

<div class="chat-page">
	<div class="chat-main">
		<div class="messages" bind:this={messagesContainer}>
			{#if chatStore.messages.length === 0}
				<div class="empty-state">
					<div class="empty-icon" aria-hidden="true">
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
					<div class="loading-skeleton">
						<div class="skeleton-avatar">
							<span class="danni-skeleton">D</span>
						</div>
						<div class="skeleton-content">
							<div class="skeleton-meta">
								<span class="skeleton-role">DANNI</span>
								<span class="skeleton-badge">Analyzing</span>
							</div>
							<div class="skeleton-lines">
								<div class="skeleton-line" style="width: 85%"></div>
								<div class="skeleton-line" style="width: 70%"></div>
								<div class="skeleton-line" style="width: 60%"></div>
								<div class="skeleton-line short" style="width: 40%"></div>
							</div>
						</div>
					</div>
				{/if}
				<div bind:this={bottomSentinel} class="scroll-sentinel"></div>
			{/if}
		</div>

		<form class="input-area" onsubmit={handleSubmit}>
			{#if chatStore.error}
				<div class="error-bar">
					<span>{chatStore.error}</span>
					<button type="button" onclick={() => chatStore.clearError()}>Dismiss</button>
				</div>
			{/if}
			{#if walletStore.error}
				<div class="error-bar">
					<span>{walletStore.error}</span>
					<button type="button" onclick={() => walletStore.reset()}>Dismiss</button>
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
				{#if walletStore.state === 'connected'}
					<button type="submit" disabled={!chatStore.input.trim() || chatStore.isStreaming} class="send-btn" aria-label="Send message">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
						</svg>
					</button>
				{:else}
					<button type="button" class="wallet-btn" onclick={() => walletStore.connect()} disabled={walletStore.state === 'connecting'}>
						{#if walletStore.state === 'connecting'}
							Connecting...
						{:else}
							Connect Wallet
						{/if}
					</button>
				{/if}
			</div>
			<div class="input-hint">
				{#if walletStore.state === 'connected'}
					<span class="wallet-connected">
						<span class="dot"></span>
						{walletStore.shortAddress} on Base Sepolia
					</span>
					 — Press Enter to send, Shift+Enter for new line
				{:else}
					Connect your wallet to pay $100 USDC via x402 for premium brand analysis
				{/if}
			</div>
		</form>
	</div>

	<aside class="sidebar" aria-label="Analysis details">
		<PaymentFlow />
		<SwarmViz />
		<div class="economics-card" role="region" aria-label="Pricing breakdown">
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

	.scroll-sentinel {
		height: 1px;
		width: 100%;
	}

	/* Loading skeleton */
	.loading-skeleton {
		display: flex;
		gap: 0.75rem;
		padding: 1rem 0;
		animation: fadeIn 0.3s ease-out;
	}

	.skeleton-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: rgba(99, 102, 241, 0.15);
		animation: skeletonPulse 1.5s ease-in-out infinite;
	}

	.danni-skeleton {
		font-size: 0.875rem;
		font-weight: 600;
		color: #6366f1;
	}

	.skeleton-content {
		flex: 1;
		max-width: 70%;
	}

	.skeleton-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.skeleton-role {
		font-size: 0.75rem;
		font-weight: 600;
		color: #888;
		letter-spacing: 0.05em;
	}

	.skeleton-badge {
		font-size: 0.65rem;
		padding: 0.15rem 0.5rem;
		border-radius: 1rem;
		background: rgba(99, 102, 241, 0.1);
		color: #6366f1;
		animation: skeletonPulse 1.5s ease-in-out infinite;
	}

	.skeleton-lines {
		background: #111;
		padding: 1rem;
		border-radius: 0.75rem;
		border: 1px solid #1a1a1a;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.skeleton-line {
		height: 12px;
		border-radius: 6px;
		background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
		background-size: 200% 100%;
		animation: skeletonShimmer 1.5s ease-in-out infinite;
	}

	.skeleton-line.short {
		height: 12px;
	}

	@keyframes skeletonShimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	@keyframes skeletonPulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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

	.wallet-btn {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		background: linear-gradient(135deg, #6366f1, #4f46e5);
		color: white;
		border: none;
		cursor: pointer;
		font-size: 0.8rem;
		font-weight: 600;
		white-space: nowrap;
		flex-shrink: 0;
		transition: opacity 0.2s;
	}

	.wallet-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.wallet-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.wallet-connected {
		color: #22c55e;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.wallet-connected .dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #22c55e;
		display: inline-block;
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

	@media (max-width: 600px) {
		.messages {
			padding: 1rem;
		}

		.input-area {
			padding: 0.75rem;
		}

		.empty-state h2 {
			font-size: 1.2rem;
		}

		.empty-state p {
			font-size: 0.8rem;
		}

		.sidebar {
			padding: 0.75rem;
			max-height: 250px;
		}

		.economics-card {
			padding: 0.875rem;
		}
	}
</style>
