<script lang="ts">
	import { swarmStore } from '$lib/stores/swarm.svelte';
	import AgentCard from './AgentCard.svelte';
</script>

<div class="swarm-viz" role="region" aria-label="Swarm activity monitor">
	<div class="viz-header">
		<h3>Swarm Activity</h3>
		{#if swarmStore.isRunning}
			<span class="phase-badge">{swarmStore.progressMessage || swarmStore.phase}</span>
		{/if}
	</div>

	<div class="agents-grid">
		{#each swarmStore.allAgents as agent (agent.name)}
			<AgentCard {agent} />
		{/each}
	</div>

	{#if swarmStore.synthesis}
		<div class="synthesis">
			<div class="synthesis-header">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5" aria-hidden="true">
					<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
				</svg>
				<span>Synthesis</span>
			</div>
			<p>{swarmStore.synthesis}</p>
		</div>
	{/if}
</div>

<style>
	.swarm-viz {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #1a1a1a;
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.viz-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.viz-header h3 {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #888;
	}

	.phase-badge {
		font-size: 0.7rem;
		padding: 0.2rem 0.6rem;
		border-radius: 1rem;
		background: rgba(99, 102, 241, 0.15);
		color: #6366f1;
		text-transform: capitalize;
	}

	.agents-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.synthesis {
		margin-top: 1rem;
		padding: 1rem;
		background: rgba(99, 102, 241, 0.05);
		border: 1px solid rgba(99, 102, 241, 0.15);
		border-radius: 0.625rem;
		animation: fadeIn 0.4s ease-out;
	}

	.synthesis-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		font-weight: 600;
		color: #6366f1;
		margin-bottom: 0.5rem;
	}

	.synthesis p {
		font-size: 0.875rem;
		line-height: 1.6;
		color: #ccc;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
