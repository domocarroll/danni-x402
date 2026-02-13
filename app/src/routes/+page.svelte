<script lang="ts">
	// Landing page - Danni Commerce Agent
</script>

<svelte:head>
	<title>Danni - Autonomous Brand Strategist</title>
	<meta name="description" content="x402-powered AI brand strategy. $100 per strategic brief." />
</svelte:head>

<main>
	<section class="hero">
		<h1>Danni</h1>
		<p class="subtitle">Autonomous Brand Strategist</p>
		<p class="tagline">
			Five parallel AI analysts. Real market data. One unified strategic brief.
		</p>
		<p class="price">$100 USDC per analysis</p>
		<a href="/chat" class="cta">Start a Brief</a>
	</section>
</main>

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: #0a0a0a;
		color: #fafafa;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.hero {
		text-align: center;
		max-width: 600px;
		padding: 2rem;
	}

	h1 {
		font-size: 4rem;
		font-weight: 200;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		margin: 0;
	}

	.subtitle {
		font-size: 1.1rem;
		color: #888;
		margin: 0.5rem 0 2rem;
		letter-spacing: 0.1em;
	}

	.tagline {
		font-size: 1.2rem;
		line-height: 1.6;
		color: #ccc;
		margin-bottom: 1rem;
	}

	.price {
		font-size: 1.5rem;
		color: #6366f1;
		font-weight: 600;
		margin: 2rem 0;
	}

	.cta {
		display: inline-block;
		padding: 1rem 3rem;
		background: #6366f1;
		color: white;
		text-decoration: none;
		border-radius: 0.5rem;
		font-size: 1.1rem;
		transition: background 0.2s;
	}

	.cta:hover {
		background: #4f46e5;
	}
</style>
