import type {
	Task,
	TaskState,
	TaskStatus,
	Message,
	Artifact,
} from '$lib/a2a/types.js';
import { TERMINAL_STATES } from '$lib/a2a/types.js';

class TaskManager {
	private tasks = new Map<string, Task>();

	createTask(message: Message): Task {
		const id = crypto.randomUUID();
		const contextId = crypto.randomUUID();

		const task: Task = {
			id,
			contextId,
			status: {
				state: 'submitted',
				timestamp: new Date().toISOString(),
			},
			artifacts: [],
			history: [message],
		};

		this.tasks.set(id, task);
		return task;
	}

	getTask(id: string): Task | undefined {
		return this.tasks.get(id);
	}

	updateStatus(id: string, state: TaskState, statusMessage?: Message): Task {
		const task = this.tasks.get(id);
		if (!task) {
			throw new TaskNotFoundError(id);
		}

		task.status = {
			state,
			message: statusMessage,
			timestamp: new Date().toISOString(),
		};

		return task;
	}

	addArtifact(id: string, artifact: Artifact): Task {
		const task = this.tasks.get(id);
		if (!task) {
			throw new TaskNotFoundError(id);
		}

		task.artifacts.push(artifact);
		return task;
	}

	addMessage(id: string, message: Message): Task {
		const task = this.tasks.get(id);
		if (!task) {
			throw new TaskNotFoundError(id);
		}

		task.history.push(message);
		return task;
	}

	cancelTask(id: string): Task {
		const task = this.tasks.get(id);
		if (!task) {
			throw new TaskNotFoundError(id);
		}

		if (TERMINAL_STATES.includes(task.status.state)) {
			throw new TaskNotCancelableError(id, task.status.state);
		}

		task.status = {
			state: 'canceled',
			timestamp: new Date().toISOString(),
		};

		return task;
	}

	async processTask(task: Task): Promise<Task> {
		this.updateStatus(task.id, 'working', {
			role: 'agent',
			parts: [{ type: 'text', text: 'Danni is analyzing your brief...' }],
		});

		// TODO: Phase 6 — wire to executeSwarm()
		const briefText = task.history
			.filter((m) => m.role === 'user')
			.flatMap((m) => m.parts)
			.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
			.map((p) => p.text)
			.join('\n');

		const resultArtifact: Artifact = {
			artifactId: crypto.randomUUID(),
			name: 'brand-analysis',
			description: 'Strategic brand analysis from Danni',
			parts: [
				{
					type: 'text',
					text: `Strategic analysis for: "${briefText}"\n\nThis is a placeholder response — the swarm engine (Phase 2) will produce the real analysis with market, competitive, cultural, and brand architecture insights from 5 parallel AI analysts.`,
				},
				{
					type: 'data',
					mimeType: 'application/json',
					data: {
						brief: briefText,
						analysis: {
							market: { agentName: 'Market Analyst', status: 'completed', output: 'Placeholder — swarm not yet connected', sources: [], durationMs: 0 },
							competitive: { agentName: 'Competitive Intel', status: 'completed', output: 'Placeholder — swarm not yet connected', sources: [], durationMs: 0 },
							cultural: { agentName: 'Cultural Resonance', status: 'completed', output: 'Placeholder — swarm not yet connected', sources: [], durationMs: 0 },
							brand: { agentName: 'Brand Architect', status: 'completed', output: 'Placeholder — swarm not yet connected', sources: [], durationMs: 0 },
							synthesis: 'Placeholder — swarm not yet connected',
						},
						metadata: {
							agentsUsed: 5,
							dataSourcesPurchased: 0,
							totalCostUsd: 100,
							durationMs: 0,
							txHashes: [],
						},
					},
				},
			],
		};

		this.addArtifact(task.id, resultArtifact);

		this.addMessage(task.id, {
			role: 'agent',
			parts: [{ type: 'text', text: 'Analysis complete. Results attached as artifact.' }],
		});

		this.updateStatus(task.id, 'completed', {
			role: 'agent',
			parts: [{ type: 'text', text: 'Task completed successfully.' }],
		});

		return this.tasks.get(task.id)!;
	}
}

export class TaskNotFoundError extends Error {
	constructor(public readonly taskId: string) {
		super(`Task not found: ${taskId}`);
		this.name = 'TaskNotFoundError';
	}
}

export class TaskNotCancelableError extends Error {
	constructor(
		public readonly taskId: string,
		public readonly currentState: TaskState,
	) {
		super(`Task ${taskId} is in terminal state: ${currentState}`);
		this.name = 'TaskNotCancelableError';
	}
}

export const taskManager = new TaskManager();
