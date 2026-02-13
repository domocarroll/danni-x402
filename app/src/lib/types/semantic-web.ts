import { z } from 'zod';

// ─── Node Types ──────────────────────────────────────────────────

export const MODULE_IDS = ['/strategy', '/creative', '/synthesize', '/validate'] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export const NODE_TYPES = [
	'fact',
	'insight',
	'tension',
	'opportunity',
	'question',
	'framework'
] as const;
export type NodeType = (typeof NODE_TYPES)[number];

export const SOURCE_TYPES = [
	'client',
	'danni',
	'market',
	'competitive',
	'cultural',
	'brand',
	'synthesis'
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const EDGE_RELATIONSHIPS = [
	'supports',
	'contradicts',
	'enables',
	'blocks',
	'informs'
] as const;
export type EdgeRelationship = (typeof EDGE_RELATIONSHIPS)[number];

// ─── Core Interfaces ─────────────────────────────────────────────

export interface SemanticNode {
	id: string;
	label: string;
	type: NodeType;
	source: SourceType;
	module: ModuleId;
	confidence: number;
	content: string;
}

export interface SemanticEdge {
	from: string;
	to: string;
	relationship: EdgeRelationship;
	strength: number;
}

export interface SemanticWeb {
	nodes: SemanticNode[];
	edges: SemanticEdge[];
}

// ─── Zod Schemas ─────────────────────────────────────────────────

export const SemanticNodeSchema = z.object({
	id: z.string(),
	label: z.string(),
	type: z.enum(NODE_TYPES),
	source: z.enum(SOURCE_TYPES),
	module: z.enum(MODULE_IDS),
	confidence: z.number().min(0).max(1),
	content: z.string()
});

export const SemanticEdgeSchema = z.object({
	from: z.string(),
	to: z.string(),
	relationship: z.enum(EDGE_RELATIONSHIPS),
	strength: z.number().min(0).max(1)
});

export const SemanticWebSchema = z.object({
	nodes: z.array(SemanticNodeSchema),
	edges: z.array(SemanticEdgeSchema)
});

// ─── Discovery Session ──────────────────────────────────────────

export const DISCOVERY_PHASES = ['greeting', 'exploring', 'deepening', 'complete'] as const;
export type DiscoveryPhase = (typeof DISCOVERY_PHASES)[number];

export interface DiscoveryTurn {
	turnNumber: number;
	question: string;
	answer: string;
	nodesAdded: SemanticNode[];
	edgesAdded: SemanticEdge[];
	timestamp: number;
}

export interface DiscoverySession {
	id: string;
	phase: DiscoveryPhase;
	web: SemanticWeb;
	turns: DiscoveryTurn[];
	moduleConfidence: Record<ModuleId, number>;
	createdAt: number;
	updatedAt: number;
	/** Original brief if provided (one-shot fallback) */
	brief?: string;
	/** Brand name extracted from conversation */
	brand?: string;
	/** Industry extracted from conversation */
	industry?: string;
}

export const DiscoveryTurnSchema = z.object({
	turnNumber: z.number(),
	question: z.string(),
	answer: z.string(),
	nodesAdded: z.array(SemanticNodeSchema),
	edgesAdded: z.array(SemanticEdgeSchema),
	timestamp: z.number()
});

export const DiscoverySessionSchema = z.object({
	id: z.string(),
	phase: z.enum(DISCOVERY_PHASES),
	web: SemanticWebSchema,
	turns: z.array(DiscoveryTurnSchema),
	moduleConfidence: z.record(z.enum(MODULE_IDS), z.number()),
	createdAt: z.number(),
	updatedAt: z.number(),
	brief: z.string().optional(),
	brand: z.string().optional(),
	industry: z.string().optional()
});

// ─── Graph Visualization ─────────────────────────────────────────

/** 3d-force-graph compatible node */
export interface GraphNode {
	id: string;
	label: string;
	color: string;
	group: SourceType;
	val: number;
}

/** 3d-force-graph compatible link */
export interface GraphLink {
	source: string;
	target: string;
	color: string;
	width: number;
}

export interface GraphData {
	nodes: GraphNode[];
	links: GraphLink[];
}

/** Color mapping for node sources */
export const SOURCE_COLORS: Record<SourceType, string> = {
	client: '#fafafa',
	danni: '#6366f1',
	market: '#22d3ee',
	competitive: '#f472b6',
	cultural: '#a78bfa',
	brand: '#34d399',
	synthesis: '#f59e0b'
};

/** Color mapping for edge relationships */
export const EDGE_COLORS: Record<EdgeRelationship, string> = {
	supports: '#34d399',
	contradicts: '#ef4444',
	enables: '#6366f1',
	blocks: '#f97316',
	informs: '#94a3b8'
};

// ─── Empty Defaults ──────────────────────────────────────────────

export function emptyWeb(): SemanticWeb {
	return { nodes: [], edges: [] };
}

export function emptyModuleConfidence(): Record<ModuleId, number> {
	return {
		'/strategy': 0,
		'/creative': 0,
		'/synthesize': 0,
		'/validate': 0
	};
}
