<script lang="ts">
	import { paymentsStore } from '$lib/stores/payments.svelte';

	const steps = [
		{ key: 'challenged', label: '402 Challenge', icon: 'shield' },
		{ key: 'signing', label: 'Sign Payment', icon: 'pen' },
		{ key: 'settling', label: 'Settlement', icon: 'clock' },
		{ key: 'confirmed', label: 'Confirmed', icon: 'check' }
	] as const;

	const stepOrder = ['idle', 'challenged', 'signing', 'settling', 'confirmed'] as const;

	function stepIndex(step: string): number {
		return stepOrder.indexOf(step as typeof stepOrder[number]);
	}

	const currentIndex = $derived(stepIndex(paymentsStore.paymentStep));
</script>

<div class="payment-flow">
	<div class="flow-header">
		<h3>Payment Flow</h3>
		{#if paymentsStore.paymentStep !== 'idle'}
			<span class="amount">$100 USDC</span>
		{/if}
	</div>

	<div class="steps">
		{#each steps as step, i}
			{@const isActive = stepIndex(step.key) === currentIndex}
			{@const isPast = stepIndex(step.key) < currentIndex}
			{@const isFuture = stepIndex(step.key) > currentIndex || paymentsStore.paymentStep === 'idle'}
			<div class="step" class:active={isActive} class:past={isPast} class:future={isFuture}>
				<div class="step-icon">
					{#if isPast}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
							<path d="M5 12l5 5L20 7" />
						</svg>
					{:else if step.icon === 'shield'}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M12 2l8 4v6c0 5.5-3.8 10.7-8 12-4.2-1.3-8-6.5-8-12V6l8-4z" />
						</svg>
					{:else if step.icon === 'pen'}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
						</svg>
					{:else if step.icon === 'clock'}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<circle cx="12" cy="12" r="10" />
							<path d="M12 6v6l4 2" />
						</svg>
					{:else}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M5 12l5 5L20 7" />
						</svg>
					{/if}
				</div>
				<span class="step-label">{step.label}</span>
			</div>
			{#if i < steps.length - 1}
				<div class="connector" class:filled={isPast}></div>
			{/if}
		{/each}
	</div>

	{#if paymentsStore.currentTxHash}
		<div class="tx-link">
			<a href={paymentsStore.explorerUrl(paymentsStore.currentTxHash)} target="_blank" rel="noopener">
				View on BaseScan
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
				</svg>
			</a>
		</div>
	{/if}
</div>

<style>
	.payment-flow {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #1a1a1a;
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.flow-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
	}

	.flow-header h3 {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #888;
	}

	.amount {
		font-size: 0.8rem;
		font-weight: 600;
		color: #6366f1;
	}

	.steps {
		display: flex;
		align-items: center;
		gap: 0;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		flex: 0 0 auto;
	}

	.step-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #1a1a1a;
		color: #555;
		transition: all 0.3s;
	}

	.step.active .step-icon {
		background: rgba(99, 102, 241, 0.2);
		color: #6366f1;
		box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
		animation: stepPulse 1.5s ease-in-out infinite;
	}

	.step.past .step-icon {
		background: rgba(34, 197, 94, 0.15);
		color: #22c55e;
	}

	.step-label {
		font-size: 0.65rem;
		color: #555;
		white-space: nowrap;
		transition: color 0.3s;
	}

	.step.active .step-label {
		color: #6366f1;
	}

	.step.past .step-label {
		color: #22c55e;
	}

	.connector {
		flex: 1;
		height: 2px;
		background: #1a1a1a;
		min-width: 20px;
		margin: 0 0.25rem;
		margin-bottom: 1.25rem;
		transition: background 0.3s;
	}

	.connector.filled {
		background: #22c55e;
	}

	.tx-link {
		margin-top: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid #1a1a1a;
	}

	.tx-link a {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: #6366f1;
		transition: opacity 0.2s;
	}

	.tx-link a:hover {
		opacity: 0.8;
	}

	@keyframes stepPulse {
		0%, 100% { box-shadow: 0 0 12px rgba(99, 102, 241, 0.2); }
		50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
	}
</style>
