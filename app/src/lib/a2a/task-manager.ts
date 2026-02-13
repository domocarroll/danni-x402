import type {
	Task,
	TaskState,
	Message,
	Artifact,
} from '$lib/a2a/types.js';
import { TERMINAL_STATES } from '$lib/a2a/types.js';
import { executeSwarm } from '$lib/swarm/orchestrator.js';

/**
 * Valid state transitions for A2A tasks.
 * Each key is the current state, values are allowed next states.
 */
const VALID_TRANSITIONS: Record<TaskState, readonly TaskState[]> = {
	'submitted': ['working', 'canceled', 'rejected'],
	'working': ['completed', 'failed', 'canceled', 'input-required'],
	'input-required': ['working', 'canceled'],
	'auth-required': ['working', 'canceled', 'rejected'],
	'completed': [],
	'failed': [],
	'canceled': [],
	'rejected': [],
} as const;

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

		const currentState = task.status.state;
		const allowedTransitions = VALID_TRANSITIONS[currentState];

		if (!allowedTransitions.includes(state)) {
			throw new InvalidStateTransitionError(id, currentState, state);
		}

		const updatedTask: Task = {
			...task,
			status: {
				state,
				message: statusMessage,
				timestamp: new Date().toISOString(),
			},
		};

		this.tasks.set(id, updatedTask);
		return updatedTask;
	}

	addArtifact(id: string, artifact: Artifact): Task {
		const task = this.tasks.get(id);
		if (!task) {
			throw new TaskNotFoundError(id);
		}

		if (TERMINAL_STATES.includes(task.status.state) && task.status.state !== 'completed') {
			throw new TaskMutationError(id, task.status.state, 'add artifact');
		}

		const updatedTask: Task = {
			...task,
			artifacts: [...task.artifacts, artifact],
		};

		this.tasks.set(id, updatedTask);
		return updatedTask;
	}

	addMessage(id: string, message: Message): Task {
		const task = this.tasks.get(id);
		if (!task) {
			throw new TaskNotFoundError(id);
		}

		const updatedTask: Task = {
			...task,
			history: [...task.history, message],
		};

		this.tasks.set(id, updatedTask);
		return updatedTask;
	}

	cancelTask(id: string): Task {
		const task = this.tasks.get(id);
		if (!task) {
			throw new TaskNotFoundError(id);
		}

		if (TERMINAL_STATES.includes(task.status.state)) {
			throw new TaskNotCancelableError(id, task.status.state);
		}

		const updatedTask: Task = {
			...task,
			status: {
				state: 'canceled',
				timestamp: new Date().toISOString(),
			},
		};

		this.tasks.set(id, updatedTask);
		return updatedTask;
	}

	async processTask(task: Task): Promise<Task> {
		try {
			this.updateStatus(task.id, 'working', {
				role: 'agent',
				parts: [{ type: 'text', text: 'Danni is analyzing your brief...' }],
			});
		} catch (error) {
			if (error instanceof InvalidStateTransitionError) {
				this.addMessage(task.id, {
					role: 'agent',
					parts: [{ type: 'text', text: `Cannot process task: ${error.message}` }],
				});
				return this.tasks.get(task.id)!;
			}
			throw error;
		}

		const briefText = task.history
			.filter((m) => m.role === 'user')
			.flatMap((m) => m.parts)
			.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
			.map((p) => p.text)
			.join('\n');

		if (!briefText.trim()) {
			this.addMessage(task.id, {
				role: 'agent',
				parts: [{ type: 'text', text: 'No text content found in user messages.' }],
			});

			this.updateStatus(task.id, 'failed', {
				role: 'agent',
				parts: [{ type: 'text', text: 'Task failed: empty brief' }],
			});

			return this.tasks.get(task.id)!;
		}

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

			try {
				this.updateStatus(task.id, 'failed', {
					role: 'agent',
					parts: [{ type: 'text', text: `Task failed: ${message}` }],
				});
			} catch (transitionError) {
				// If we cannot transition to failed (e.g. already in terminal state), log it
				console.error('Failed to transition task to failed state:', transitionError);
			}
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

export class InvalidStateTransitionError extends Error {
	constructor(
		public readonly taskId: string,
		public readonly fromState: TaskState,
		public readonly toState: TaskState,
	) {
		super(`Task ${taskId}: invalid transition from '${fromState}' to '${toState}'`);
		this.name = 'InvalidStateTransitionError';
	}
}

export class TaskMutationError extends Error {
	constructor(
		public readonly taskId: string,
		public readonly currentState: TaskState,
		public readonly operation: string,
	) {
		super(`Task ${taskId}: cannot ${operation} in terminal state '${currentState}'`);
		this.name = 'TaskMutationError';
	}
}

export const taskManager = new TaskManager();
