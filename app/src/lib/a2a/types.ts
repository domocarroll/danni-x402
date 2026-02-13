import { z } from 'zod';

// ─── A2A Task States ─────────────────────────────────────────────────────────

export type TaskState =
	| 'submitted'
	| 'working'
	| 'completed'
	| 'failed'
	| 'canceled'
	| 'input-required'
	| 'auth-required'
	| 'rejected';

export const TERMINAL_STATES: TaskState[] = ['completed', 'failed', 'canceled', 'rejected'];

// ─── Parts ───────────────────────────────────────────────────────────────────

export interface TextPart {
	type: 'text';
	text: string;
}

export interface DataPart {
	type: 'data';
	mimeType: string;
	data: unknown;
}

export interface FilePart {
	type: 'file';
	mimeType: string;
	url?: string;
	data?: string;
	filename?: string;
}

export type Part = TextPart | DataPart | FilePart;

// ─── Messages & Artifacts ────────────────────────────────────────────────────

export interface Message {
	role: 'user' | 'agent';
	parts: Part[];
	messageId?: string;
	metadata?: Record<string, unknown>;
}

export interface Artifact {
	artifactId: string;
	name?: string;
	description?: string;
	parts: Part[];
	metadata?: Record<string, unknown>;
}

// ─── Task Status ─────────────────────────────────────────────────────────────

export interface TaskStatus {
	state: TaskState;
	message?: Message;
	timestamp?: string;
}

// ─── Task ────────────────────────────────────────────────────────────────────

export interface Task {
	id: string;
	contextId: string;
	status: TaskStatus;
	artifacts: Artifact[];
	history: Message[];
	metadata?: Record<string, unknown>;
}

// ─── Agent Card Types ────────────────────────────────────────────────────────

export interface AgentSkill {
	id: string;
	name: string;
	description: string;
	tags?: string[];
	examples?: string[];
	inputModes?: string[];
	outputModes?: string[];
}

export interface AgentCapabilities {
	streaming?: boolean;
	pushNotifications?: boolean;
}

export interface AgentProvider {
	organization: string;
	url: string;
}

export interface AgentCard {
	name: string;
	description: string;
	url: string;
	version: string;
	provider?: AgentProvider;
	capabilities: AgentCapabilities;
	skills: AgentSkill[];
	defaultInputModes?: string[];
	defaultOutputModes?: string[];
	authentication?: {
		schemes: string[];
		x402?: {
			network: string;
			asset: string;
			facilitator: string;
		};
	};
	pricing?: Record<string, { amount: string; network: string; asset: string }>;
}

// ─── JSON-RPC 2.0 Types ─────────────────────────────────────────────────────

export interface JsonRpcRequest {
	jsonrpc: '2.0';
	id: string | number;
	method: string;
	params?: unknown;
}

export interface JsonRpcSuccessResponse {
	jsonrpc: '2.0';
	id: string | number;
	result: unknown;
}

export interface JsonRpcErrorResponse {
	jsonrpc: '2.0';
	id: string | number | null;
	error: {
		code: number;
		message: string;
		data?: unknown;
	};
}

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;

// ─── A2A Method Params ───────────────────────────────────────────────────────

export interface SendMessageParams {
	message: Message;
	configuration?: {
		acceptedOutputModes?: string[];
		blocking?: boolean;
		historyLength?: number;
	};
	metadata?: Record<string, unknown>;
}

export interface GetTaskParams {
	id: string;
	historyLength?: number;
}

export interface CancelTaskParams {
	id: string;
}

// ─── Error Codes ─────────────────────────────────────────────────────────────

export const A2A_ERROR_CODES = {
	/** JSON-RPC standard errors */
	PARSE_ERROR: -32700,
	INVALID_REQUEST: -32600,
	METHOD_NOT_FOUND: -32601,
	INVALID_PARAMS: -32602,
	INTERNAL_ERROR: -32603,

	/** A2A-specific errors */
	TASK_NOT_FOUND: -32001,
	TASK_NOT_CANCELABLE: -32002,
	PUSH_NOTIFICATION_NOT_SUPPORTED: -32003,
	UNSUPPORTED_OPERATION: -32004,
	CONTENT_TYPE_NOT_SUPPORTED: -32005,
	INVALID_AGENT_RESPONSE: -32006,
	EXTENSION_SUPPORT_REQUIRED: -32008,
} as const;

// ─── Zod Validation Schemas ─────────────────────────────────────────────────

const TextPartSchema = z.object({
	type: z.literal('text'),
	text: z.string(),
});

const DataPartSchema = z.object({
	type: z.literal('data'),
	mimeType: z.string(),
	data: z.unknown(),
});

const FilePartSchema = z.object({
	type: z.literal('file'),
	mimeType: z.string(),
	url: z.string().optional(),
	data: z.string().optional(),
	filename: z.string().optional(),
});

export const PartSchema = z.union([TextPartSchema, DataPartSchema, FilePartSchema]);

export const MessageSchema = z.object({
	role: z.enum(['user', 'agent']),
	parts: z.array(PartSchema).min(1),
	messageId: z.string().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const JsonRpcRequestSchema = z.object({
	jsonrpc: z.literal('2.0'),
	id: z.union([z.string(), z.number()]),
	method: z.string(),
	params: z.unknown().optional(),
});

export const SendMessageParamsSchema = z.object({
	message: MessageSchema,
	configuration: z.object({
		acceptedOutputModes: z.array(z.string()).optional(),
		blocking: z.boolean().optional(),
		historyLength: z.number().optional(),
	}).optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const GetTaskParamsSchema = z.object({
	id: z.string(),
	historyLength: z.number().optional(),
});

export const CancelTaskParamsSchema = z.object({
	id: z.string(),
});
