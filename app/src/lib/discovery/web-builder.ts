import type {
	SemanticWeb,
	SemanticNode,
	SemanticEdge,
	SourceType,
	NodeType,
	ModuleId,
	EdgeRelationship,
	GraphData,
	GraphNode,
	GraphLink
} from '$lib/types/semantic-web.js';
import {
	SOURCE_COLORS,
	EDGE_COLORS,
	MODULE_IDS,
	SemanticNodeSchema,
	SemanticEdgeSchema
} from '$lib/types/semantic-web.js';

let nodeCounter = 0;

export function createNodeId(source: SourceType): string {
	return `${source}_${Date.now()}_${++nodeCounter}`;
}

export function createNode(
	label: string,
	type: NodeType,
	source: SourceType,
	module: ModuleId,
	content: string,
	confidence = 0.5
): SemanticNode {
	return {
		id: createNodeId(source),
		label,
		type,
		source,
		module,
		confidence,
		content
	};
}

export function createEdge(
	from: string,
	to: string,
	relationship: EdgeRelationship,
	strength = 0.5
): SemanticEdge {
	return { from, to, relationship, strength };
}

export function mergeWebs(base: SemanticWeb, incoming: SemanticWeb): SemanticWeb {
	const existingNodeIds = new Set(base.nodes.map((n) => n.id));
	const existingEdgeKeys = new Set(base.edges.map((e) => `${e.from}→${e.to}`));

	const newNodes = incoming.nodes.filter((n) => !existingNodeIds.has(n.id));
	const newEdges = incoming.edges.filter((e) => !existingEdgeKeys.has(`${e.from}→${e.to}`));

	return {
		nodes: [...base.nodes, ...newNodes],
		edges: [...base.edges, ...newEdges]
	};
}

export function extractSubgraph(
	web: SemanticWeb,
	predicate: (node: SemanticNode) => boolean
): SemanticWeb {
	const matchingNodes = web.nodes.filter(predicate);
	const nodeIds = new Set(matchingNodes.map((n) => n.id));

	const matchingEdges = web.edges.filter(
		(e) => nodeIds.has(e.from) || nodeIds.has(e.to)
	);

	return { nodes: matchingNodes, edges: matchingEdges };
}

export function webDensity(web: SemanticWeb): number {
	const n = web.nodes.length;
	if (n < 2) return 0;
	const maxEdges = n * (n - 1);
	return web.edges.length / maxEdges;
}

export function moduleConfidence(web: SemanticWeb): Record<ModuleId, number> {
	const counts: Record<ModuleId, { total: number; sum: number }> = {
		'/strategy': { total: 0, sum: 0 },
		'/creative': { total: 0, sum: 0 },
		'/synthesize': { total: 0, sum: 0 },
		'/validate': { total: 0, sum: 0 }
	};

	for (const node of web.nodes) {
		if (counts[node.module]) {
			counts[node.module].total++;
			counts[node.module].sum += node.confidence;
		}
	}

	const result = {} as Record<ModuleId, number>;
	for (const mod of MODULE_IDS) {
		result[mod] = counts[mod].total > 0 ? counts[mod].sum / counts[mod].total : 0;
	}
	return result;
}

export function webToGraphData(web: SemanticWeb): GraphData {
	const nodes: GraphNode[] = web.nodes.map((n) => ({
		id: n.id,
		label: n.label,
		color: SOURCE_COLORS[n.source] ?? '#94a3b8',
		group: n.source,
		val: Math.max(1, Math.round(n.confidence * 5))
	}));

	const nodeIds = new Set(web.nodes.map((n) => n.id));

	const links: GraphLink[] = web.edges
		.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to))
		.map((e) => ({
			source: e.from,
			target: e.to,
			color: EDGE_COLORS[e.relationship] ?? '#94a3b8',
			width: Math.max(0.5, e.strength * 3)
		}));

	return { nodes, links };
}

export function extractAgentSubgraph(
	web: SemanticWeb,
	agentName: string
): SemanticWeb {
	switch (agentName) {
		case 'Market Analyst':
			return extractSubgraph(
				web,
				(n) => n.module === '/strategy' || n.type === 'fact'
			);
		case 'Competitive Intel':
			return extractSubgraph(
				web,
				(n) => n.source === 'client' || n.type === 'tension'
			);
		case 'Cultural Resonance':
			return extractSubgraph(
				web,
				(n) =>
					n.module === '/creative' ||
					n.type === 'tension' ||
					n.type === 'opportunity'
			);
		case 'Brand Architect':
			return extractSubgraph(
				web,
				(n) =>
					n.type === 'tension' ||
					n.type === 'opportunity' ||
					n.confidence > 0.7
			);
		case 'Danni Synthesis':
			return web;
		default:
			return web;
	}
}

export function parseWebFromJson(raw: string): SemanticWeb {
	// Strategy 1: fenced json block
	const fenced = raw.match(/```json\s*\n([\s\S]*?)\n\s*```/);
	if (fenced) {
		try {
			return validateParsedWeb(JSON.parse(fenced[1]));
		} catch {
			// fall through
		}
	}

	// Strategy 2: greedy object match
	const greedy = raw.match(/\{[\s\S]*\}/);
	if (greedy) {
		try {
			return validateParsedWeb(JSON.parse(greedy[0]));
		} catch {
			// fall through
		}
	}

	// Strategy 3: empty web (text output always works)
	return { nodes: [], edges: [] };
}

function validateParsedWeb(data: unknown): SemanticWeb {
	if (!data || typeof data !== 'object') return { nodes: [], edges: [] };

	const obj = data as Record<string, unknown>;
	const rawNodes = Array.isArray(obj.nodes) ? obj.nodes : [];
	const rawEdges = Array.isArray(obj.edges) ? obj.edges : [];

	const nodes: SemanticNode[] = [];
	for (const n of rawNodes) {
		const parsed = SemanticNodeSchema.safeParse(n);
		if (parsed.success) nodes.push(parsed.data);
	}

	const edges: SemanticEdge[] = [];
	for (const e of rawEdges) {
		const parsed = SemanticEdgeSchema.safeParse(e);
		if (parsed.success) edges.push(parsed.data);
	}

	return { nodes, edges };
}

export function formatWebForPrompt(web: SemanticWeb): string {
	if (web.nodes.length === 0) return 'No semantic web data yet.';

	const nodeLines = web.nodes.map(
		(n) => `- [${n.type}/${n.source}] ${n.label}: ${n.content} (confidence: ${n.confidence})`
	);
	const edgeLines = web.edges.map(
		(e) => `- ${e.from} --${e.relationship}--> ${e.to} (strength: ${e.strength})`
	);

	return `## Current Semantic Web (${web.nodes.length} nodes, ${web.edges.length} edges)

### Nodes
${nodeLines.join('\n')}

### Edges
${edgeLines.join('\n')}`;
}
