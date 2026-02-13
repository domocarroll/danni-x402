import type {
	Task,
	TaskState,
	Message,
	Artifact,
} from '$lib/a2a/types.js';
import { TERMINAL_STATES } from '$lib/a2a/types.js';
import { executeSwarm } from '$lib/swarm/orchestrator.js';

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

		const briefText = task.history
			.filter((m) => m.role === 'user')
			.flatMap((m) => m.parts)
			.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
			.map((p) => p.text)
			.join('\n');

		try {
			const swarmResult = await executeSwarm({ brief: briefText });

			const resultArtifact: Artifact = {
				artifactId: crypto.randomUUID(),
				name: 'brand-analysis',
				description: 'Strategic brand analysis from Danni',
				parts: [
					{
						type: 'text',
						text: swarmResult.analysis.synthesis,
					},
					{
						type: 'data',
						mimeType: 'application/json',
						data: swarmResult,
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
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Swarm execution failed';

			this.addMessage(task.id, {
				role: 'agent',
				parts: [{ type: 'text', text: `Analysis failed: ${message}` }],
			});

			this.updateStatus(task.id, 'failed', {
				role: 'agent',
				parts: [{ type: 'text', text: `Task failed: ${message}` }],
			});
		}

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
