import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	createNodeId,
	createNode,
	createEdge,
	mergeWebs,
	extractSubgraph,
	webDensity,
	moduleConfidence,
	webToGraphData,
	extractAgentSubgraph,
	parseWebFromJson,
	formatWebForPrompt
} from './web-builder.js';
import type {
	SemanticNode,
	SemanticEdge,
	SemanticWeb,
	NodeType,
	SourceType,
	ModuleId,
	EdgeRelationship
} from '$lib/types/semantic-web.js';

describe('createNodeId', () => {
	it('returns a string containing the source name', () => {
		const id = createNodeId('client');
		expect(id).toContain('client');
		expect(typeof id).toBe('string');
	});

	it('includes timestamp and counter components', () => {
		const id = createNodeId('market');
		expect(id).toMatch(/^market_\d+_\d+$/);
	});

	it('generates unique ids for multiple calls', () => {
		const id1 = createNodeId('competitive');
		const id2 = createNodeId('competitive');
		expect(id1).not.toBe(id2);
	});

	it('handles different source types', () => {
		const sources: SourceType[] = ['client', 'danni', 'market', 'competitive', 'cultural', 'brand', 'synthesis'];
		sources.forEach(source => {
			const id = createNodeId(source);
			expect(id).toContain(source);
		});
	});
});

describe('createNode', () => {
	it('returns a SemanticNode with all provided fields', () => {
		const node = createNode('Test Label', 'fact', 'client', '/strategy', 'Test content', 0.8);
		expect(node.label).toBe('Test Label');
		expect(node.type).toBe('fact');
		expect(node.source).toBe('client');
		expect(node.module).toBe('/strategy');
		expect(node.content).toBe('Test content');
		expect(node.confidence).toBe(0.8);
	});

	it('uses default confidence of 0.5 when not provided', () => {
		const node = createNode('Label', 'insight', 'market', '/creative', 'content');
		expect(node.confidence).toBe(0.5);
	});

	it('generates unique id for each node', () => {
		const node1 = createNode('Label1', 'fact', 'client', '/strategy', 'content1');
		const node2 = createNode('Label2', 'fact', 'client', '/strategy', 'content2');
		expect(node1.id).not.toBe(node2.id);
	});

	it('supports all node types', () => {
		const types: NodeType[] = ['fact', 'insight', 'tension', 'opportunity', 'question', 'framework'];
		types.forEach(type => {
			const node = createNode('Label', type, 'client', '/strategy', 'content');
			expect(node.type).toBe(type);
		});
	});

	it('supports all modules', () => {
		const modules: ModuleId[] = ['/strategy', '/creative', '/synthesize', '/validate'];
		modules.forEach(module => {
			const node = createNode('Label', 'fact', 'client', module, 'content');
			expect(node.module).toBe(module);
		});
	});

	it('supports confidence range 0-1', () => {
		const node = createNode('Label', 'fact', 'client', '/strategy', 'content', 0.0);
		expect(node.confidence).toBe(0.0);
		const node2 = createNode('Label', 'fact', 'client', '/strategy', 'content', 1.0);
		expect(node2.confidence).toBe(1.0);
	});
});

describe('createEdge', () => {
	it('returns a SemanticEdge with provided fields', () => {
		const edge = createEdge('node1', 'node2', 'supports', 0.9);
		expect(edge.from).toBe('node1');
		expect(edge.to).toBe('node2');
		expect(edge.relationship).toBe('supports');
		expect(edge.strength).toBe(0.9);
	});

	it('uses default strength of 0.5 when not provided', () => {
		const edge = createEdge('from', 'to', 'enables');
		expect(edge.strength).toBe(0.5);
	});

	it('supports all relationship types', () => {
		const relationships: EdgeRelationship[] = ['supports', 'contradicts', 'enables', 'blocks', 'informs'];
		relationships.forEach(rel => {
			const edge = createEdge('from', 'to', rel);
			expect(edge.relationship).toBe(rel);
		});
	});

	it('allows strength values 0-1', () => {
		const edge1 = createEdge('from', 'to', 'supports', 0.0);
		expect(edge1.strength).toBe(0.0);
		const edge2 = createEdge('from', 'to', 'supports', 1.0);
		expect(edge2.strength).toBe(1.0);
	});
});

describe('mergeWebs', () => {
	let base: SemanticWeb;
	let incoming: SemanticWeb;

	beforeEach(() => {
		base = {
			nodes: [
				{ id: 'n1', label: 'Node 1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.8, content: 'content1' }
			],
			edges: [
				{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.6 }
			]
		};

		incoming = {
			nodes: [
				{ id: 'n2', label: 'Node 2', type: 'insight', source: 'market', module: '/creative', confidence: 0.7, content: 'content2' }
			],
			edges: [
				{ from: 'n2', to: 'n3', relationship: 'enables', strength: 0.8 }
			]
		};
	});

	it('combines nodes and edges from both webs', () => {
		const merged = mergeWebs(base, incoming);
		expect(merged.nodes.length).toBe(2);
		expect(merged.edges.length).toBe(2);
	});

	it('deduplicates nodes by id', () => {
		incoming.nodes.push(base.nodes[0]);
		const merged = mergeWebs(base, incoming);
		expect(merged.nodes.filter(n => n.id === 'n1')).toHaveLength(1);
	});

	it('deduplicates edges by from→to key', () => {
		incoming.edges.push({ from: 'n1', to: 'n2', relationship: 'contradicts', strength: 0.5 });
		const merged = mergeWebs(base, incoming);
		expect(merged.edges.filter(e => e.from === 'n1' && e.to === 'n2')).toHaveLength(1);
	});

	it('preserves edge direction in deduplication', () => {
		incoming.edges.push({ from: 'n2', to: 'n1', relationship: 'supports', strength: 0.5 });
		const merged = mergeWebs(base, incoming);
		expect(merged.edges.length).toBe(3);
	});

	it('keeps base nodes and edges in order', () => {
		const merged = mergeWebs(base, incoming);
		expect(merged.nodes[0]).toBe(base.nodes[0]);
		expect(merged.edges[0]).toBe(base.edges[0]);
	});

	it('returns empty web when merging two empty webs', () => {
		const merged = mergeWebs({ nodes: [], edges: [] }, { nodes: [], edges: [] });
		expect(merged.nodes).toHaveLength(0);
		expect(merged.edges).toHaveLength(0);
	});
});

describe('extractSubgraph', () => {
	let web: SemanticWeb;

	beforeEach(() => {
		web = {
			nodes: [
				{ id: 'n1', label: 'Node 1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.8, content: 'c1' },
				{ id: 'n2', label: 'Node 2', type: 'tension', source: 'market', module: '/creative', confidence: 0.6, content: 'c2' },
				{ id: 'n3', label: 'Node 3', type: 'opportunity', source: 'cultural', module: '/synthesize', confidence: 0.9, content: 'c3' }
			],
			edges: [
				{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.7 },
				{ from: 'n2', to: 'n3', relationship: 'enables', strength: 0.8 },
				{ from: 'n1', to: 'n3', relationship: 'informs', strength: 0.6 }
			]
		};
	});

	it('filters nodes by predicate', () => {
		const subgraph = extractSubgraph(web, n => n.type === 'fact');
		expect(subgraph.nodes.length).toBe(1);
		expect(subgraph.nodes[0].id).toBe('n1');
	});

	it('includes edges touching matching nodes', () => {
		const subgraph = extractSubgraph(web, n => n.id === 'n1' || n.id === 'n2');
		expect(subgraph.edges).toContainEqual({ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.7 });
		expect(subgraph.edges).toContainEqual({ from: 'n2', to: 'n3', relationship: 'enables', strength: 0.8 });
		expect(subgraph.edges).toContainEqual({ from: 'n1', to: 'n3', relationship: 'informs', strength: 0.6 });
		expect(subgraph.edges).toHaveLength(3);
	});

	it('excludes edges when neither endpoint matches', () => {
		const subgraph = extractSubgraph(web, n => n.id === 'n1');
		const touchesN1 = subgraph.edges.filter(e => e.from === 'n1' || e.to === 'n1');
		expect(subgraph.edges.length).toBe(touchesN1.length);
	});

	it('returns empty subgraph when predicate matches nothing', () => {
		const subgraph = extractSubgraph(web, () => false);
		expect(subgraph.nodes).toHaveLength(0);
		expect(subgraph.edges).toHaveLength(0);
	});

	it('filters by module', () => {
		const subgraph = extractSubgraph(web, n => n.module === '/creative');
		expect(subgraph.nodes).toContainEqual(web.nodes[1]);
		expect(subgraph.nodes.length).toBe(1);
	});

	it('filters by confidence threshold', () => {
		const subgraph = extractSubgraph(web, n => n.confidence > 0.7);
		expect(subgraph.nodes.map(n => n.id)).toEqual(['n1', 'n3']);
	});
});

describe('webDensity', () => {
	it('returns 0 for empty web', () => {
		const web: SemanticWeb = { nodes: [], edges: [] };
		expect(webDensity(web)).toBe(0);
	});

	it('returns 0 for single node', () => {
		const web: SemanticWeb = {
			nodes: [{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c' }],
			edges: []
		};
		expect(webDensity(web)).toBe(0);
	});

	it('returns 0 for two nodes with no edges', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c2' }
			],
			edges: []
		};
		expect(webDensity(web)).toBe(0);
	});

	it('calculates correct density for two nodes with one edge', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c2' }
			],
			edges: [{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.5 }]
		};
		const density = webDensity(web);
		expect(density).toBe(0.5);
	});

	it('returns density < 1 for sparse web', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c2' },
				{ id: 'n3', label: 'N3', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c3' }
			],
			edges: [{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.5 }]
		};
		const density = webDensity(web);
		expect(density).toBeLessThan(1);
		expect(density).toBeGreaterThan(0);
	});

	it('handles dense web approaching 1', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c2' },
				{ id: 'n3', label: 'N3', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c3' }
			],
			edges: [
				{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.5 },
				{ from: 'n2', to: 'n3', relationship: 'supports', strength: 0.5 },
				{ from: 'n1', to: 'n3', relationship: 'supports', strength: 0.5 }
			]
		};
		const density = webDensity(web);
		expect(density).toBeLessThanOrEqual(1);
		expect(density).toBeGreaterThan(0);
	});
});

describe('moduleConfidence', () => {
	it('returns zero confidence for all modules on empty web', () => {
		const web: SemanticWeb = { nodes: [], edges: [] };
		const conf = moduleConfidence(web);
		expect(conf['/strategy']).toBe(0);
		expect(conf['/creative']).toBe(0);
		expect(conf['/synthesize']).toBe(0);
		expect(conf['/validate']).toBe(0);
	});

	it('calculates average confidence per module', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.8, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'fact', source: 'client', module: '/strategy', confidence: 0.6, content: 'c2' }
			],
			edges: []
		};
		const conf = moduleConfidence(web);
		expect(conf['/strategy']).toBe(0.7);
		expect(conf['/creative']).toBe(0);
	});

	it('handles multiple modules', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.9, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'fact', source: 'client', module: '/creative', confidence: 0.7, content: 'c2' },
				{ id: 'n3', label: 'N3', type: 'fact', source: 'client', module: '/synthesize', confidence: 0.5, content: 'c3' },
				{ id: 'n4', label: 'N4', type: 'fact', source: 'client', module: '/validate', confidence: 0.3, content: 'c4' }
			],
			edges: []
		};
		const conf = moduleConfidence(web);
		expect(conf['/strategy']).toBe(0.9);
		expect(conf['/creative']).toBe(0.7);
		expect(conf['/synthesize']).toBe(0.5);
		expect(conf['/validate']).toBe(0.3);
	});

	it('averages multiple nodes in same module', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.4, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'fact', source: 'client', module: '/strategy', confidence: 0.6, content: 'c2' },
				{ id: 'n3', label: 'N3', type: 'fact', source: 'client', module: '/strategy', confidence: 0.8, content: 'c3' }
			],
			edges: []
		};
		const conf = moduleConfidence(web);
		expect(conf['/strategy']).toBe(0.6);
	});

	it('returns all four modules in result', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' }
			],
			edges: []
		};
		const conf = moduleConfidence(web);
		expect(Object.keys(conf)).toHaveLength(4);
		expect(conf).toHaveProperty('/strategy');
		expect(conf).toHaveProperty('/creative');
		expect(conf).toHaveProperty('/synthesize');
		expect(conf).toHaveProperty('/validate');
	});
});

describe('webToGraphData', () => {
	it('transforms nodes to GraphNode format', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'Node 1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.8, content: 'c1' }
			],
			edges: []
		};
		const graphData = webToGraphData(web);
		expect(graphData.nodes).toHaveLength(1);
		expect(graphData.nodes[0].id).toBe('n1');
		expect(graphData.nodes[0].label).toBe('Node 1');
		expect(graphData.nodes[0].group).toBe('client');
	});

	it('assigns colors from SOURCE_COLORS', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' }
			],
			edges: []
		};
		const graphData = webToGraphData(web);
		expect(graphData.nodes[0].color).toBe('#fafafa');
	});

	it('calculates node val from confidence', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.0, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'fact', source: 'client', module: '/strategy', confidence: 1.0, content: 'c2' }
			],
			edges: []
		};
		const graphData = webToGraphData(web);
		expect(graphData.nodes[0].val).toBeGreaterThanOrEqual(1);
		expect(graphData.nodes[1].val).toBeGreaterThanOrEqual(1);
	});

	it('transforms edges to GraphLink format', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c2' }
			],
			edges: [
				{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.7 }
			]
		};
		const graphData = webToGraphData(web);
		expect(graphData.links).toHaveLength(1);
		expect(graphData.links[0].source).toBe('n1');
		expect(graphData.links[0].target).toBe('n2');
	});

	it('assigns colors to edges from EDGE_COLORS', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c2' }
			],
			edges: [
				{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.5 }
			]
		};
		const graphData = webToGraphData(web);
		expect(graphData.links[0].color).toBe('#34d399');
	});

	it('filters edges with missing endpoints', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' }
			],
			edges: [
				{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.5 }
			]
		};
		const graphData = webToGraphData(web);
		expect(graphData.links).toHaveLength(0);
	});

	it('calculates edge width from strength', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c2' }
			],
			edges: [
				{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.0 },
				{ from: 'n2', to: 'n1', relationship: 'supports', strength: 1.0 }
			]
		};
		const graphData = webToGraphData(web);
		expect(graphData.links[0].width).toBeGreaterThanOrEqual(0.5);
		expect(graphData.links[1].width).toBeGreaterThanOrEqual(0.5);
	});
});

describe('extractAgentSubgraph', () => {
	let web: SemanticWeb;

	beforeEach(() => {
		web = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.8, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'tension', source: 'market', module: '/creative', confidence: 0.6, content: 'c2' },
				{ id: 'n3', label: 'N3', type: 'opportunity', source: 'cultural', module: '/creative', confidence: 0.9, content: 'c3' },
				{ id: 'n4', label: 'N4', type: 'insight', source: 'client', module: '/synthesize', confidence: 0.4, content: 'c4' }
			],
			edges: []
		};
	});

	it('Market Analyst filters /strategy module and fact type', () => {
		const subgraph = extractAgentSubgraph(web, 'Market Analyst');
		expect(subgraph.nodes.map(n => n.id)).toContain('n1');
	});

	it('Competitive Intel filters client source or tension type', () => {
		const subgraph = extractAgentSubgraph(web, 'Competitive Intel');
		const ids = subgraph.nodes.map(n => n.id);
		expect(ids).toContain('n1');
		expect(ids).toContain('n2');
		expect(ids).toContain('n4');
	});

	it('Cultural Resonance filters /creative module or tension/opportunity type', () => {
		const subgraph = extractAgentSubgraph(web, 'Cultural Resonance');
		const ids = subgraph.nodes.map(n => n.id);
		expect(ids).toContain('n2');
		expect(ids).toContain('n3');
	});

	it('Brand Architect filters tension/opportunity or confidence > 0.7', () => {
		const subgraph = extractAgentSubgraph(web, 'Brand Architect');
		const ids = subgraph.nodes.map(n => n.id);
		expect(ids).toContain('n1');
		expect(ids).toContain('n2');
		expect(ids).toContain('n3');
	});

	it('Danni Synthesis returns the entire web', () => {
		const subgraph = extractAgentSubgraph(web, 'Danni Synthesis');
		expect(subgraph.nodes).toEqual(web.nodes);
		expect(subgraph.edges).toEqual(web.edges);
	});

	it('unknown agent returns the entire web', () => {
		const subgraph = extractAgentSubgraph(web, 'Unknown Agent');
		expect(subgraph.nodes).toEqual(web.nodes);
		expect(subgraph.edges).toEqual(web.edges);
	});
});

describe('parseWebFromJson', () => {
	it('parses fenced json block', () => {
		const raw = 'Here is some text\n```json\n{"nodes":[],"edges":[]}\n```\nMore text';
		const web = parseWebFromJson(raw);
		expect(web).toEqual({ nodes: [], edges: [] });
	});

	it('parses greedy object match when no fence', () => {
		const raw = 'Text before {"nodes":[],"edges":[]} text after';
		const web = parseWebFromJson(raw);
		expect(web).toEqual({ nodes: [], edges: [] });
	});

	it('returns empty web for garbage input', () => {
		const raw = 'just some random text with no json';
		const web = parseWebFromJson(raw);
		expect(web).toEqual({ nodes: [], edges: [] });
	});

	it('parses complex valid web structure', () => {
		const raw = `\`\`\`json
{
	"nodes": [
		{"id":"n1","label":"L1","type":"fact","source":"client","module":"/strategy","confidence":0.8,"content":"c1"}
	],
	"edges": [
		{"from":"n1","to":"n2","relationship":"supports","strength":0.7}
	]
}
\`\`\``;
		const web = parseWebFromJson(raw);
		expect(web.nodes).toHaveLength(1);
		expect(web.edges).toHaveLength(1);
	});

	it('filters out invalid nodes during parsing', () => {
		const raw = `\`\`\`json
{
	"nodes": [
		{"id":"n1","label":"L1","type":"fact","source":"client","module":"/strategy","confidence":0.8,"content":"c1"},
		{"invalid":"node"}
	],
	"edges": []
}
\`\`\``;
		const web = parseWebFromJson(raw);
		expect(web.nodes).toHaveLength(1);
	});

	it('filters out invalid edges during parsing', () => {
		const raw = `\`\`\`json
{
	"nodes": [],
	"edges": [
		{"from":"n1","to":"n2","relationship":"supports","strength":0.7},
		{"invalid":"edge"}
	]
}
\`\`\``;
		const web = parseWebFromJson(raw);
		expect(web.edges).toHaveLength(1);
	});

	it('handles json with extra properties', () => {
		const raw = `\`\`\`json
{
	"nodes": [],
	"edges": [],
	"extra": "property",
	"ignored": true
}
\`\`\``;
		const web = parseWebFromJson(raw);
		expect(web.nodes).toHaveLength(0);
		expect(web.edges).toHaveLength(0);
	});

	it('prefers fenced block over greedy match', () => {
		const raw = 'Bad json {"nodes":null} here\n```json\n{"nodes":[],"edges":[]}\n```\nMore bad json {"invalid"}';
		const web = parseWebFromJson(raw);
		expect(web).toEqual({ nodes: [], edges: [] });
	});
});

describe('formatWebForPrompt', () => {
	it('returns placeholder text for empty web', () => {
		const web: SemanticWeb = { nodes: [], edges: [] };
		const formatted = formatWebForPrompt(web);
		expect(formatted).toBe('No semantic web data yet.');
	});

	it('includes node count and edge count in header', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.8, content: 'c1' }
			],
			edges: [
				{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.7 }
			]
		};
		const formatted = formatWebForPrompt(web);
		expect(formatted).toContain('1 nodes');
		expect(formatted).toContain('1 edges');
	});

	it('formats each node with type/source/label/content/confidence', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'Test Label', type: 'fact', source: 'client', module: '/strategy', confidence: 0.85, content: 'Test content' }
			],
			edges: []
		};
		const formatted = formatWebForPrompt(web);
		expect(formatted).toContain('[fact/client]');
		expect(formatted).toContain('Test Label');
		expect(formatted).toContain('Test content');
		expect(formatted).toContain('0.85');
	});

	it('formats each edge with from/relationship/to/strength', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'node1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' },
				{ id: 'node2', label: 'N2', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c2' }
			],
			edges: [
				{ from: 'node1', to: 'node2', relationship: 'supports', strength: 0.75 }
			]
		};
		const formatted = formatWebForPrompt(web);
		expect(formatted).toContain('node1');
		expect(formatted).toContain('--supports-->');
		expect(formatted).toContain('node2');
		expect(formatted).toContain('0.75');
	});

	it('separates nodes and edges sections', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' }
			],
			edges: [
				{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.5 }
			]
		};
		const formatted = formatWebForPrompt(web);
		expect(formatted).toContain('### Nodes');
		expect(formatted).toContain('### Edges');
		const nodeIndex = formatted.indexOf('### Nodes');
		const edgeIndex = formatted.indexOf('### Edges');
		expect(nodeIndex).toBeLessThan(edgeIndex);
	});

	it('returns markdown format', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' }
			],
			edges: []
		};
		const formatted = formatWebForPrompt(web);
		expect(formatted).toContain('##');
		expect(formatted).toContain('-');
	});

	it('handles multiple nodes and edges', () => {
		const web: SemanticWeb = {
			nodes: [
				{ id: 'n1', label: 'N1', type: 'fact', source: 'client', module: '/strategy', confidence: 0.5, content: 'c1' },
				{ id: 'n2', label: 'N2', type: 'insight', source: 'market', module: '/creative', confidence: 0.7, content: 'c2' }
			],
			edges: [
				{ from: 'n1', to: 'n2', relationship: 'supports', strength: 0.6 },
				{ from: 'n2', to: 'n1', relationship: 'informs', strength: 0.5 }
			]
		};
		const formatted = formatWebForPrompt(web);
		expect(formatted).toContain('2 nodes');
		expect(formatted).toContain('2 edges');
		expect(formatted.match(/^-/gm)).toHaveLength(4);
	});
});
