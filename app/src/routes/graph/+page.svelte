<script lang="ts">
	import { onDestroy } from 'svelte';

	interface GraphNode {
		id: string;
		label: string;
		group: string;
		val: number;
		color: string;
		glow: string;
		x?: number;
		y?: number;
		z?: number;
	}

	interface GraphLink {
		source: string;
		target: string;
		color: string;
		width: number;
		particles: number;
	}

	interface GraphData {
		nodes: GraphNode[];
		links: GraphLink[];
	}

	const COLORS = {
		danni: '#6366f1',
		market: '#22d3ee',
		competitive: '#f472b6',
		cultural: '#a78bfa',
		brand: '#34d399',
		synthesis: '#f59e0b',
		danniGlow: 'rgba(99, 102, 241, 0.6)',
		marketGlow: 'rgba(34, 211, 238, 0.4)',
		competitiveGlow: 'rgba(244, 114, 182, 0.4)',
		culturalGlow: 'rgba(167, 139, 250, 0.4)',
		brandGlow: 'rgba(52, 211, 153, 0.4)',
		synthesisGlow: 'rgba(245, 158, 11, 0.5)'
	} as const;

	function buildGraphData(): GraphData {
		const nodes: GraphNode[] = [
			{ id: 'danni', label: 'Danni', group: 'core', val: 30, color: COLORS.danni, glow: COLORS.danniGlow },

			{ id: 'market', label: 'Market Analyst', group: 'agent', val: 16, color: COLORS.market, glow: COLORS.marketGlow },
			{ id: 'competitive', label: 'Competitive Intel', group: 'agent', val: 16, color: COLORS.competitive, glow: COLORS.competitiveGlow },
			{ id: 'cultural', label: 'Cultural Resonance', group: 'agent', val: 16, color: COLORS.cultural, glow: COLORS.culturalGlow },
			{ id: 'brand', label: 'Brand Architect', group: 'agent', val: 16, color: COLORS.brand, glow: COLORS.brandGlow },

			{ id: 'm1', label: 'Athletic market $180B', group: 'insight-market', val: 6, color: COLORS.market, glow: COLORS.marketGlow },
			{ id: 'm2', label: 'DTC channel shift', group: 'insight-market', val: 6, color: COLORS.market, glow: COLORS.marketGlow },
			{ id: 'm3', label: 'Gen Z wellness trend', group: 'insight-market', val: 6, color: COLORS.market, glow: COLORS.marketGlow },

			{ id: 'c1', label: 'Adidas sustainability push', group: 'insight-competitive', val: 6, color: COLORS.competitive, glow: COLORS.competitiveGlow },
			{ id: 'c2', label: 'New Balance heritage play', group: 'insight-competitive', val: 6, color: COLORS.competitive, glow: COLORS.competitiveGlow },
			{ id: 'c3', label: 'On Running momentum', group: 'insight-competitive', val: 6, color: COLORS.competitive, glow: COLORS.competitiveGlow },

			{ id: 'cu1', label: 'Just Do It exhaustion', group: 'insight-cultural', val: 6, color: COLORS.cultural, glow: COLORS.culturalGlow },
			{ id: 'cu2', label: 'Athlete empowerment fatigue', group: 'insight-cultural', val: 6, color: COLORS.cultural, glow: COLORS.culturalGlow },
			{ id: 'cu3', label: 'Community > individual', group: 'insight-cultural', val: 6, color: COLORS.cultural, glow: COLORS.culturalGlow },

			{ id: 'b1', label: 'Permission to rest', group: 'insight-brand', val: 6, color: COLORS.brand, glow: COLORS.brandGlow },
			{ id: 'b2', label: 'Inclusive excellence', group: 'insight-brand', val: 6, color: COLORS.brand, glow: COLORS.brandGlow },
			{ id: 'b3', label: 'Cultural catalyst role', group: 'insight-brand', val: 6, color: COLORS.brand, glow: COLORS.brandGlow },

			{ id: 'synthesis', label: 'Synthesis', group: 'synthesis', val: 22, color: COLORS.synthesis, glow: COLORS.synthesisGlow }
		];

		const links: GraphLink[] = [
			{ source: 'danni', target: 'market', color: COLORS.market, width: 3, particles: 4 },
			{ source: 'danni', target: 'competitive', color: COLORS.competitive, width: 3, particles: 4 },
			{ source: 'danni', target: 'cultural', color: COLORS.cultural, width: 3, particles: 4 },
			{ source: 'danni', target: 'brand', color: COLORS.brand, width: 3, particles: 4 },

			{ source: 'market', target: 'm1', color: COLORS.market, width: 1.5, particles: 2 },
			{ source: 'market', target: 'm2', color: COLORS.market, width: 1.5, particles: 2 },
			{ source: 'market', target: 'm3', color: COLORS.market, width: 1.5, particles: 2 },

			{ source: 'competitive', target: 'c1', color: COLORS.competitive, width: 1.5, particles: 2 },
			{ source: 'competitive', target: 'c2', color: COLORS.competitive, width: 1.5, particles: 2 },
			{ source: 'competitive', target: 'c3', color: COLORS.competitive, width: 1.5, particles: 2 },

			{ source: 'cultural', target: 'cu1', color: COLORS.cultural, width: 1.5, particles: 2 },
			{ source: 'cultural', target: 'cu2', color: COLORS.cultural, width: 1.5, particles: 2 },
			{ source: 'cultural', target: 'cu3', color: COLORS.cultural, width: 1.5, particles: 2 },

			{ source: 'brand', target: 'b1', color: COLORS.brand, width: 1.5, particles: 2 },
			{ source: 'brand', target: 'b2', color: COLORS.brand, width: 1.5, particles: 2 },
			{ source: 'brand', target: 'b3', color: COLORS.brand, width: 1.5, particles: 2 },

			{ source: 'market', target: 'synthesis', color: COLORS.synthesis, width: 2.5, particles: 3 },
			{ source: 'competitive', target: 'synthesis', color: COLORS.synthesis, width: 2.5, particles: 3 },
			{ source: 'cultural', target: 'synthesis', color: COLORS.synthesis, width: 2.5, particles: 3 },
			{ source: 'brand', target: 'synthesis', color: COLORS.synthesis, width: 2.5, particles: 3 },

			{ source: 'm3', target: 'cu3', color: 'rgba(255,255,255,0.12)', width: 0.5, particles: 0 },
			{ source: 'cu1', target: 'b1', color: 'rgba(255,255,255,0.12)', width: 0.5, particles: 0 },
			{ source: 'c1', target: 'm3', color: 'rgba(255,255,255,0.12)', width: 0.5, particles: 0 },
			{ source: 'cu3', target: 'b2', color: 'rgba(255,255,255,0.12)', width: 0.5, particles: 0 },
			{ source: 'c3', target: 'b3', color: 'rgba(255,255,255,0.12)', width: 0.5, particles: 0 }
		];

		return { nodes, links };
	}

	const graphData = buildGraphData();

	let container: HTMLDivElement;
	let graphInstance: ReturnType<typeof initGraph> | undefined;
	let animationId: ReturnType<typeof requestAnimationFrame> | undefined;

	type ForceGraphInstance = {
		_destructor: () => void;
		cameraPosition: (position: { x: number; y: number; z: number }) => ForceGraphInstance;
		camera: () => { position: { x: number; y: number; z: number } };
	};

	function initGraph(_ForceGraph3D: new (el: HTMLElement) => ForceGraphInstance): ForceGraphInstance {
		return _ForceGraph3D as unknown as ForceGraphInstance;
	}

	$effect(() => {
		if (!container) return;

		let destroyed = false;
		let graph: ForceGraphInstance | undefined;

		import('3d-force-graph').then(({ default: ForceGraph3D }) => {
			if (destroyed) return;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const FG = ForceGraph3D as any;
			graph = new FG(container)
				.backgroundColor('#0a0a0a')
				.showNavInfo(false)
				.width(container.clientWidth)
				.height(container.clientHeight)
				.graphData(graphData)
				.nodeVal('val')
				.nodeLabel('label')
				.nodeColor('color')
				.nodeOpacity(0.95)
				.nodeResolution(24)
				.linkColor('color')
				.linkWidth('width')
				.linkOpacity(0.6)
				.linkDirectionalParticles('particles')
				.linkDirectionalParticleWidth(1.5)
				.linkDirectionalParticleSpeed(0.006)
				.linkDirectionalParticleColor('color')
				.linkCurvature(0.15)
				.onNodeClick((node: GraphNode) => {
					const distance = 120;
					const distRatio = 1 + distance / Math.hypot(node.x ?? 0, node.y ?? 0, node.z ?? 0);
					(graph as any).cameraPosition(
						{
							x: (node.x ?? 0) * distRatio,
							y: (node.y ?? 0) * distRatio,
							z: (node.z ?? 0) * distRatio
						},
						node,
						1500
					);
				});

			graphInstance = graph as unknown as ReturnType<typeof initGraph>;

			// Auto-rotate camera
			let angle = 0;
			const rotateDistance = 350;

			function rotate() {
				if (destroyed || !graph) return;
				angle += 0.002;
				(graph as any).cameraPosition({
					x: rotateDistance * Math.sin(angle),
					z: rotateDistance * Math.cos(angle)
				});
				animationId = requestAnimationFrame(rotate);
			}
			rotate();

			// Handle resize
			const resizeObserver = new ResizeObserver(() => {
				if (!destroyed && graph) {
					(graph as any).width(container.clientWidth).height(container.clientHeight);
				}
			});
			resizeObserver.observe(container);

			// Cleanup on effect re-run
			return () => {
				destroyed = true;
				resizeObserver.disconnect();
			};
		});

		return () => {
			destroyed = true;
			if (animationId !== undefined) {
				cancelAnimationFrame(animationId);
			}
			if (graph) {
				(graph as any)._destructor();
			}
		};
	});

	onDestroy(() => {
		if (animationId !== undefined) {
			cancelAnimationFrame(animationId);
		}
	});

	const legendItems = [
		{ label: 'Danni (Orchestrator)', color: COLORS.danni },
		{ label: 'Market Analyst', color: COLORS.market },
		{ label: 'Competitive Intel', color: COLORS.competitive },
		{ label: 'Cultural Resonance', color: COLORS.cultural },
		{ label: 'Brand Architect', color: COLORS.brand },
		{ label: 'Synthesis', color: COLORS.synthesis }
	];
</script>

<svelte:head>
	<title>Swarm Graph - Danni</title>
	<meta name="description" content="3D visualization of Danni's parallel swarm intelligence at work." />
</svelte:head>

<div class="graph-page">
	<div class="graph-container" bind:this={container}></div>

	<div class="legend">
		<h3 class="legend-title">Swarm Topology</h3>
		<p class="legend-brand">Nike Analysis</p>
		{#each legendItems as item}
			<div class="legend-item">
				<span class="legend-dot" style="background: {item.color}; box-shadow: 0 0 8px {item.color};"></span>
				<span class="legend-label">{item.label}</span>
			</div>
		{/each}
		<div class="legend-divider"></div>
		<div class="legend-item">
			<span class="legend-line solid"></span>
			<span class="legend-label">Agent links</span>
		</div>
		<div class="legend-item">
			<span class="legend-line dashed"></span>
			<span class="legend-label">Cross-insights</span>
		</div>
		<p class="legend-hint">Click a node to focus</p>
	</div>
</div>

<style>
	.graph-page {
		position: relative;
		width: 100%;
		height: calc(100vh - 56px);
		overflow: hidden;
		background: #0a0a0a;
	}

	.graph-container {
		width: 100%;
		height: 100%;
	}

	.legend {
		position: absolute;
		top: 1.25rem;
		left: 1.25rem;
		background: rgba(10, 10, 10, 0.85);
		backdrop-filter: blur(12px);
		border: 1px solid #1a1a1a;
		border-radius: 0.75rem;
		padding: 1.25rem 1.5rem;
		z-index: 10;
		min-width: 200px;
	}

	.legend-title {
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #fafafa;
		margin-bottom: 0.25rem;
	}

	.legend-brand {
		font-size: 0.7rem;
		color: #666;
		margin-bottom: 1rem;
		letter-spacing: 0.05em;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.5rem;
	}

	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.legend-label {
		font-size: 0.75rem;
		color: #aaa;
	}

	.legend-divider {
		height: 1px;
		background: #1a1a1a;
		margin: 0.75rem 0;
	}

	.legend-line {
		display: inline-block;
		width: 16px;
		height: 2px;
		flex-shrink: 0;
	}

	.legend-line.solid {
		background: #888;
	}

	.legend-line.dashed {
		background: repeating-linear-gradient(
			to right,
			#555,
			#555 3px,
			transparent 3px,
			transparent 6px
		);
	}

	.legend-hint {
		font-size: 0.65rem;
		color: #555;
		margin-top: 0.75rem;
		font-style: italic;
	}
</style>
