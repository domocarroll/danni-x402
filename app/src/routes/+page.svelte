<script lang="ts">
</script>

<svelte:head>
	<title>Danni - Autonomous Brand Strategist</title>
	<meta name="description" content="x402-powered AI brand strategy. Five parallel analysts. One unified brief. $100 USDC." />
</svelte:head>

<div class="landing">
	<section class="hero">
		<h1 class="wordmark">Danni</h1>
		<p class="subtitle">Autonomous Brand Strategist</p>
		<p class="tagline">
			Five parallel AI analysts. Real market data. One unified strategic brief.
		</p>
	</section>

	<section class="pricing">
		<h2>Choose Your Depth</h2>
		<div class="pricing-grid">
			<div class="pricing-card">
				<h3 class="tier-name">Pulse</h3>
				<div class="tier-price">
					<span class="amount">$100</span>
					<span class="currency">USDC</span>
				</div>
				<p class="tier-description">Standard analysis. Five parallel analysts. Real market data. ~2 min.</p>
				<a href="/chat" class="tier-cta">Start Analysis</a>
			</div>

			<div class="pricing-card featured">
				<div class="popular-badge">Most Popular</div>
				<h3 class="tier-name">Deep Dive</h3>
				<div class="tier-price">
					<span class="amount">$1,000</span>
					<span class="currency">USDC</span>
				</div>
				<p class="tier-description">Extended analysis. Recursive passes. 10x data sources. ~15 min.</p>
				<a href="/chat" class="tier-cta">Start Analysis</a>
			</div>

			<div class="pricing-card">
				<div class="statement-badge">Statement Piece</div>
				<h3 class="tier-name">Masterwork</h3>
				<div class="tier-price">
					<span class="amount">$50,000</span>
					<span class="currency">USDC</span>
				</div>
				<p class="tier-description">Fractal recursive swarm. Evolutionary generations. Full brand platform. ~2 hours.</p>
				<a href="/chat" class="tier-cta">Start Analysis</a>
			</div>
		</div>
	</section>

	<section class="danni-quote">
		<blockquote>
			"I've noticed something fascinating about brands that endure — they don't just sell products, they resolve cultural contradictions."
		</blockquote>
		<cite>— Danni</cite>
	</section>

	<section class="features">
		<div class="feature-card">
			<div class="feature-icon">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5">
					<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
				</svg>
			</div>
			<h3>Parallel Intelligence</h3>
			<p>Five specialist AI analysts work simultaneously — market, competitive, cultural, brand, and synthesis — delivering depth no single model can match.</p>
		</div>
		<div class="feature-card">
			<div class="feature-icon">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5">
					<circle cx="12" cy="12" r="10" />
					<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
				</svg>
			</div>
			<h3>Real Market Data</h3>
			<p>Agents purchase live competitive, social, and market data through x402 micropayments — real intelligence, not hallucinated guesses.</p>
		</div>
		<div class="feature-card">
			<div class="feature-icon">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5">
					<rect x="2" y="3" width="20" height="14" rx="2" />
					<path d="M8 21h8M12 17v4" />
				</svg>
			</div>
			<h3>Glass Box</h3>
			<p>Watch every agent activate, every data source purchased, every insight synthesized. Full transparency into how your strategy is built.</p>
		</div>
	</section>

	<section class="steps">
		<h2>How It Works</h2>
		<div class="steps-grid">
			<div class="step">
				<span class="step-number">1</span>
				<h3>Submit Your Brief</h3>
				<p>Describe your brand, product, or strategic challenge. Danni takes it from there.</p>
			</div>
			<div class="step-arrow">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5">
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</div>
			<div class="step">
				<span class="step-number">2</span>
				<h3>Swarm Analyzes</h3>
				<p>Five AI analysts run in parallel, purchasing real data and producing independent assessments.</p>
			</div>
			<div class="step-arrow">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5">
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</div>
			<div class="step">
				<span class="step-number">3</span>
				<h3>Get Strategy</h3>
				<p>Receive a unified strategic brief — market position, competitive moves, cultural insights, brand direction.</p>
			</div>
		</div>
	</section>

	<section class="footer-cta">
		<h2>Ready to see your brand differently?</h2>
		<p>One brief. Five perspectives. Complete transparency.</p>
		<a href="/chat" class="cta">Begin Analysis</a>
	</section>
</div>

<style>
	.landing {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.hero {
		text-align: center;
		padding: 6rem 0 5rem;
		animation: fadeUp 0.8s ease-out both;
	}

	.wordmark {
		font-size: 4.5rem;
		font-weight: 200;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		margin: 0;
		text-shadow: 0 0 60px rgba(99, 102, 241, 0.3);
	}

	.subtitle {
		font-size: 1.1rem;
		color: #888;
		margin: 0.5rem 0 2rem;
		letter-spacing: 0.1em;
	}

	.tagline {
		font-size: 1.25rem;
		line-height: 1.6;
		color: #ccc;
		max-width: 500px;
		margin: 0 auto;
	}

	.pricing {
		padding: 3rem 0 4rem;
		animation: fadeUp 0.8s ease-out 0.15s both;
	}

	.pricing h2 {
		text-align: center;
		font-size: 1.5rem;
		font-weight: 300;
		letter-spacing: 0.05em;
		margin-bottom: 2.5rem;
		color: #ccc;
	}

	.pricing-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.25rem;
		max-width: 960px;
		margin: 0 auto;
	}

	.pricing-card {
		position: relative;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid #1a1a1a;
		border-radius: 0.875rem;
		padding: 2rem 1.75rem;
		display: flex;
		flex-direction: column;
		transition: border-color 0.3s, background 0.3s, transform 0.2s;
	}

	.pricing-card:hover {
		border-color: #2a2a2a;
		background: rgba(255, 255, 255, 0.05);
		transform: translateY(-2px);
	}

	.pricing-card.featured {
		border-color: #6366f1;
		background: rgba(99, 102, 241, 0.05);
	}

	.pricing-card.featured:hover {
		border-color: #6366f1;
		background: rgba(99, 102, 241, 0.08);
	}

	.popular-badge,
	.statement-badge {
		position: absolute;
		top: -10px;
		left: 50%;
		transform: translateX(-50%);
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.popular-badge {
		background: #6366f1;
		color: white;
	}

	.statement-badge {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid #333;
		color: #ccc;
	}

	.tier-name {
		font-size: 1.2rem;
		font-weight: 500;
		margin-bottom: 1rem;
		letter-spacing: 0.03em;
	}

	.tier-price {
		margin-bottom: 1.5rem;
	}

	.tier-price .amount {
		font-size: 2.25rem;
		font-weight: 600;
		color: #fafafa;
	}

	.tier-price .currency {
		font-size: 0.875rem;
		color: #888;
		margin-left: 0.25rem;
	}

	.tier-description {
		font-size: 0.875rem;
		line-height: 1.6;
		color: #888;
		margin-bottom: 2rem;
		flex: 1;
	}

	.tier-cta {
		display: block;
		text-align: center;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid #2a2a2a;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background 0.2s, border-color 0.2s;
	}

	.tier-cta:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: #3a3a3a;
	}

	.pricing-card.featured .tier-cta {
		background: #6366f1;
		border-color: #6366f1;
		color: white;
	}

	.pricing-card.featured .tier-cta:hover {
		background: #4f46e5;
		border-color: #4f46e5;
	}

	.danni-quote {
		text-align: center;
		padding: 3rem 0 4rem;
		animation: fadeUp 0.8s ease-out 0.3s both;
	}

	.danni-quote blockquote {
		font-size: 1.25rem;
		font-style: italic;
		line-height: 1.7;
		color: #ccc;
		max-width: 700px;
		margin: 0 auto 1rem;
		padding-left: 2rem;
		border-left: 3px solid #6366f1;
		text-align: left;
	}

	.danni-quote cite {
		font-size: 0.875rem;
		font-style: normal;
		color: #666;
		letter-spacing: 0.05em;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
		padding: 3rem 0 5rem;
		animation: fadeUp 0.8s ease-out 0.45s both;
	}

	.feature-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid #1a1a1a;
		border-radius: 0.75rem;
		padding: 2rem;
		transition: border-color 0.3s, background 0.3s;
	}

	.feature-card:hover {
		border-color: #2a2a2a;
		background: rgba(255, 255, 255, 0.05);
	}

	.feature-icon {
		margin-bottom: 1.25rem;
	}

	.feature-card h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.feature-card p {
		font-size: 0.9rem;
		line-height: 1.6;
		color: #888;
	}

	.steps {
		padding: 3rem 0 5rem;
		animation: fadeUp 0.8s ease-out 0.6s both;
	}

	.steps h2 {
		text-align: center;
		font-size: 1.5rem;
		font-weight: 300;
		letter-spacing: 0.05em;
		margin-bottom: 3rem;
		color: #ccc;
	}

	.steps-grid {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		gap: 1.5rem;
	}

	.step {
		flex: 1;
		max-width: 260px;
		text-align: center;
	}

	.step-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(99, 102, 241, 0.15);
		color: #6366f1;
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.step h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.step p {
		font-size: 0.875rem;
		line-height: 1.6;
		color: #888;
	}

	.step-arrow {
		display: flex;
		align-items: center;
		padding-top: 0.5rem;
	}

	.footer-cta {
		text-align: center;
		padding: 4rem 0 6rem;
		border-top: 1px solid #1a1a1a;
		animation: fadeUp 0.8s ease-out 0.75s both;
	}

	.footer-cta h2 {
		font-size: 1.75rem;
		font-weight: 300;
		margin-bottom: 0.75rem;
	}

	.footer-cta p {
		color: #888;
		margin-bottom: 2rem;
		font-size: 1.05rem;
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.pricing-grid {
			grid-template-columns: 1fr;
		}

		.features {
			grid-template-columns: 1fr;
		}

		.steps-grid {
			flex-direction: column;
			align-items: center;
		}

		.step-arrow {
			transform: rotate(90deg);
		}

		.wordmark {
			font-size: 3rem;
		}

		.danni-quote blockquote {
			padding-left: 1.5rem;
			font-size: 1.1rem;
		}
	}
</style>
