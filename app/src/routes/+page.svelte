<script lang="ts">
	import UnicornHero from '$lib/components/UnicornHero.svelte';

	function reveal(node: HTMLElement) {
		node.style.opacity = '0';
		node.style.transform = 'translateY(24px)';
		node.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						node.style.opacity = '1';
						node.style.transform = 'translateY(0)';
						observer.unobserve(node);
					}
				}
			},
			{ threshold: 0.15 }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<svelte:head>
	<title>Danni - Autonomous Brand Strategist</title>
	<meta name="description" content="x402-powered AI brand strategy. Five parallel analysts. One unified brief. $100 USDC." />
</svelte:head>

<div class="landing">
	<section class="hero">
		<div class="hero-bg">
			<UnicornHero />
		</div>
		<div class="hero-content">
			<h1 class="wordmark">Danni</h1>
			<p class="acronym">Dedicated Autonomous Neural Networked Intelligence</p>
			<p class="tagline">
				Strategic intelligence, on-chain, whenever your agents need it.
			</p>
		</div>
	</section>

	<section class="pricing" use:reveal>
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

	<section class="danni-quote" use:reveal>
		<blockquote>
			"I've noticed something fascinating about brands that endure — they don't just sell products, they resolve cultural contradictions."
		</blockquote>
		<cite>— Danni</cite>
	</section>

	<section class="features" use:reveal>
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

	<section class="steps" use:reveal>
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

	<section class="footer-cta" use:reveal>
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
		position: relative;
		text-align: center;
		padding: 0;
		min-height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		animation: fadeUp 0.8s ease-out both;
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
		width: 100vw;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	.hero-content {
		position: relative;
		z-index: 1;
		padding: 6rem 2rem 5rem;
	}

	.hero-content::before {
		content: '';
		position: absolute;
		inset: -4rem -8rem;
		background: radial-gradient(
			ellipse 55% 50% at 50% 48%,
			rgba(10, 10, 10, 0.85) 0%,
			rgba(10, 10, 10, 0.5) 40%,
			transparent 70%
		);
		z-index: -1;
		pointer-events: none;
	}

	.wordmark {
		font-family: 'Space Grotesk', system-ui, sans-serif;
		font-size: 5rem;
		font-weight: 300;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		margin: 0;
		text-shadow: 0 0 80px rgba(99, 102, 241, 0.35), 0 0 30px rgba(0, 0, 0, 0.9);
	}

	.acronym {
		font-family: 'Space Grotesk', system-ui, sans-serif;
		font-size: 0.7rem;
		color: rgba(99, 102, 241, 0.7);
		margin: 1rem 0 2.5rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		font-weight: 400;
		text-shadow: 0 0 20px rgba(99, 102, 241, 0.2), 0 1px 8px rgba(0, 0, 0, 0.9);
	}

	.tagline {
		font-family: 'Inter', system-ui, sans-serif;
		font-size: 1.15rem;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.6);
		max-width: 480px;
		font-weight: 300;
		margin: 0 auto;
		text-shadow: 0 1px 12px rgba(0, 0, 0, 0.6);
	}

	.pricing {
		padding: 3rem 0 4rem;
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

	.cta {
		display: inline-block;
		padding: 0.875rem 2.5rem;
		background: #6366f1;
		color: white;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
	}

	.cta:hover {
		background: #4f46e5;
		transform: translateY(-1px);
		box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
	}

	.cta:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
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
