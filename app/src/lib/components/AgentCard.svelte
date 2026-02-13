<script lang="ts">
	import type { AgentState } from '$lib/stores/swarm.svelte';

	interface Props {
		agent: AgentState;
	}

	let { agent }: Props = $props();

	const statusColor = $derived(
		agent.status === 'completed' ? '#22c55e' :
		agent.status === 'running' ? '#6366f1' :
		agent.status === 'failed' || agent.status === 'timeout' ? '#ef4444' :
		'#333'
	);

	const statusLabel = $derived(
		agent.status === 'completed' ? 'Done' :
		agent.status === 'running' ? 'Analyzing...' :
		agent.status === 'failed' ? 'Failed' :
		agent.status === 'timeout' ? 'Timeout' :
		'Idle'
	);

	const truncatedOutput = $derived(
		agent.output.length > 120 ? agent.output.slice(0, 120) + '...' : agent.output
	);

	const duration = $derived(
		agent.durationMs > 0 ? `${(agent.durationMs / 1000).toFixed(1)}s` : ''
	);
</script>

<div class="card" class:running={agent.status === 'running'} class:completed={agent.status === 'completed'} role="article" aria-label="{agent.displayName}: {statusLabel}">
	<div class="header">
		<div class="name-row">
			<span class="dot" style:background={statusColor} class:pulse={agent.status === 'running'} aria-hidden="true"></span>
			<span class="name">{agent.displayName}</span>
		</div>
		<div class="status-row">
			<span class="status" style:color={statusColor}>{statusLabel}</span>
			{#if duration}
				<span class="duration">{duration}</span>
			{/if}
		</div>
	</div>
	{#if agent.output}
		<div class="output">{truncatedOutput}</div>
	{/if}
	{#if agent.sources.length > 0}
		<div class="sources">{agent.sources.length} source{agent.sources.length !== 1 ? 's' : ''}</div>
	{/if}
</div>

<style>
	.card {
		background: #111;
		border: 1px solid #1a1a1a;
		border-radius: 0.625rem;
		padding: 1rem;
		transition: border-color 0.3s, box-shadow 0.3s;
	}

	.card.running {
		border-color: rgba(99, 102, 241, 0.3);
		box-shadow: 0 0 20px rgba(99, 102, 241, 0.05);
	}

	.card.completed {
		border-color: rgba(34, 197, 94, 0.2);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.dot.pulse {
		animation: pulse 1.5s ease-in-out infinite;
	}

	.name {
		font-size: 0.875rem;
		font-weight: 600;
	}

	.status-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status {
		font-size: 0.75rem;
		font-weight: 500;
	}

	.duration {
		font-size: 0.7rem;
		color: #555;
	}

	.output {
		font-size: 0.8rem;
		line-height: 1.5;
		color: #888;
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid #1a1a1a;
	}

	.sources {
		font-size: 0.7rem;
		color: #555;
		margin-top: 0.5rem;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
			box-shadow: 0 0 0 0 currentColor;
		}
		50% {
			opacity: 0.6;
			box-shadow: 0 0 0 4px transparent;
		}
	}
</style>
