<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';

	let { children }: { children: Snippet } = $props();
</script>

<div class="app">
	<nav aria-label="Main navigation">
		<div class="nav-inner">
			<div class="nav-left">
				<a href="/" class="nav-brand" aria-label="Danni home">Danni</a>
				<div class="nav-links" role="navigation">
					<a href="/" class:active={page.url.pathname === '/'}>Home</a>
					<a href="/chat" class:active={page.url.pathname === '/chat'}>Chat</a>
					<a href="/dashboard" class:active={page.url.pathname === '/dashboard'}>Dashboard</a>
					<a href="/graph" class:active={page.url.pathname === '/graph'}>Graph</a>
				</div>
			</div>
			<div class="wallet-status" role="status" aria-label="Network status: Base Sepolia">
				<span class="dot" aria-hidden="true"></span>
				Base Sepolia
			</div>
		</div>
	</nav>
	<main>
		{@render children()}
	</main>
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		background: #0a0a0a;
		color: #fafafa;
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	.app {
		min-height: 100vh;
	}

	nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 56px;
		background: rgba(10, 10, 10, 0.85);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid #1a1a1a;
		z-index: 100;
	}

	.nav-inner {
		max-width: 1200px;
		margin: 0 auto;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1.5rem;
	}

	.nav-left {
		display: flex;
		align-items: center;
		gap: 2.5rem;
	}

	.nav-brand {
		font-size: 0.875rem;
		font-weight: 200;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: #fafafa;
		text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
		transition: opacity 0.2s;
	}

	.nav-brand:hover {
		opacity: 0.8;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
	}

	.nav-links a {
		font-size: 0.875rem;
		letter-spacing: 0.05em;
		color: #888;
		padding: 0.25rem 0;
		border-bottom: 2px solid transparent;
		transition: color 0.2s, border-color 0.2s;
	}

	.nav-links a:hover {
		color: #fafafa;
	}

	.nav-links a.active {
		color: #fafafa;
		border-bottom-color: #6366f1;
	}

	.wallet-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: #666;
		letter-spacing: 0.03em;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #22c55e;
		box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
	}

	main {
		padding-top: 56px;
	}

	@media (max-width: 600px) {
		.nav-inner {
			padding: 0 0.75rem;
		}

		.nav-left {
			gap: 1rem;
		}

		.nav-links {
			gap: 0.75rem;
		}

		.nav-links a {
			font-size: 0.75rem;
		}

		.wallet-status {
			font-size: 0.65rem;
		}
	}
</style>
