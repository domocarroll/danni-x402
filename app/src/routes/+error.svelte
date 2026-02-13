<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} - Danni</title>
</svelte:head>

<div class="error-page">
	<div class="error-content">
		<div class="error-icon">
			<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1">
				<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
			</svg>
		</div>
		<h1 class="error-code">{page.status}</h1>
		<p class="error-message">
			{#if page.status === 404}
				The page you're looking for has drifted beyond the signal.
			{:else}
				Something unexpected happened. The pattern broke.
			{/if}
		</p>
		{#if page.error?.message}
			<p class="error-detail">{page.error.message}</p>
		{/if}
		<a href="/" class="back-link">Return Home</a>
	</div>
</div>

<style>
	.error-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 56px);
		text-align: center;
		padding: 2rem;
	}

	.error-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		max-width: 400px;
	}

	.error-icon {
		opacity: 0.4;
		margin-bottom: 0.5rem;
	}

	.error-code {
		font-size: 4rem;
		font-weight: 200;
		letter-spacing: 0.15em;
		color: #fafafa;
		margin: 0;
	}

	.error-message {
		font-size: 1rem;
		line-height: 1.6;
		color: #888;
	}

	.error-detail {
		font-size: 0.8rem;
		color: #555;
		font-family: 'SF Mono', 'Fira Code', monospace;
		padding: 0.5rem 1rem;
		background: #111;
		border: 1px solid #1a1a1a;
		border-radius: 0.5rem;
	}

	.back-link {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.625rem 1.5rem;
		background: rgba(99, 102, 241, 0.1);
		border: 1px solid rgba(99, 102, 241, 0.2);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		color: #6366f1;
		transition: background 0.2s, border-color 0.2s;
	}

	.back-link:hover {
		background: rgba(99, 102, 241, 0.15);
		border-color: rgba(99, 102, 241, 0.3);
	}
</style>
