import { describe, it, expect, beforeEach } from 'vitest';
import {
	taskManager,
	TaskNotFoundError,
	TaskNotCancelableError,
	InvalidStateTransitionError,
} from './task-manager.js';
import type { Message } from './types.js';

function makeMessage(text: string, role: 'user' | 'agent' = 'user'): Message {
	return { role, parts: [{ type: 'text', text }] };
}

describe('TaskManager', () => {
	describe('createTask', () => {
		it('creates task with unique id and contextId', () => {
			const task = taskManager.createTask(makeMessage('test'));
			expect(task.id).toBeDefined();
			expect(task.contextId).toBeDefined();
			expect(task.status.state).toBe('submitted');
			expect(task.history).toHaveLength(1);
			expect(task.artifacts).toHaveLength(0);
		});

		it('accepts explicit contextId', () => {
			const task = taskManager.createTask(makeMessage('test'), 'my-custom-context');
			expect(task.contextId).toBe('my-custom-context');
		});

		it('generates unique contextId when not provided', () => {
			const t1 = taskManager.createTask(makeMessage('a'));
			const t2 = taskManager.createTask(makeMessage('b'));
			expect(t1.contextId).not.toBe(t2.contextId);
		});
	});

	describe('getTask', () => {
		it('retrieves existing task', () => {
			const created = taskManager.createTask(makeMessage('get-test'));
			const found = taskManager.getTask(created.id);
			expect(found).toBeDefined();
			expect(found!.id).toBe(created.id);
		});

		it('returns undefined for nonexistent task', () => {
			expect(taskManager.getTask('nonexistent-id')).toBeUndefined();
		});
	});

	describe('findTaskByContextId', () => {
		it('finds task by contextId', () => {
			const task = taskManager.createTask(makeMessage('context-lookup'));
			const found = taskManager.findTaskByContextId(task.contextId);
			expect(found).toBeDefined();
			expect(found!.id).toBe(task.id);
		});

		it('finds task by explicit contextId', () => {
			const task = taskManager.createTask(makeMessage('explicit-ctx'), 'lookup-ctx-123');
			const found = taskManager.findTaskByContextId('lookup-ctx-123');
			expect(found).toBeDefined();
			expect(found!.id).toBe(task.id);
		});

		it('returns undefined for unknown contextId', () => {
			expect(taskManager.findTaskByContextId('unknown-ctx')).toBeUndefined();
		});
	});

	describe('updateStatus', () => {
		it('transitions submitted → working', () => {
			const task = taskManager.createTask(makeMessage('status-test'));
			const updated = taskManager.updateStatus(task.id, 'working');
			expect(updated.status.state).toBe('working');
		});

		it('transitions working → input-required', () => {
			const task = taskManager.createTask(makeMessage('ir-test'));
			taskManager.updateStatus(task.id, 'working');
			const updated = taskManager.updateStatus(task.id, 'input-required');
			expect(updated.status.state).toBe('input-required');
		});

		it('transitions input-required → working (AP2 resume)', () => {
			const task = taskManager.createTask(makeMessage('resume-test'));
			taskManager.updateStatus(task.id, 'working');
			taskManager.updateStatus(task.id, 'input-required');
			const resumed = taskManager.updateStatus(task.id, 'working');
			expect(resumed.status.state).toBe('working');
		});

		it('transitions working → completed', () => {
			const task = taskManager.createTask(makeMessage('complete-test'));
			taskManager.updateStatus(task.id, 'working');
			const completed = taskManager.updateStatus(task.id, 'completed');
			expect(completed.status.state).toBe('completed');
		});

		it('rejects invalid transition submitted → completed', () => {
			const task = taskManager.createTask(makeMessage('invalid-transition'));
			expect(() => taskManager.updateStatus(task.id, 'completed')).toThrow(
				InvalidStateTransitionError,
			);
		});

		it('rejects invalid transition submitted → input-required', () => {
			const task = taskManager.createTask(makeMessage('invalid-ir'));
			expect(() => taskManager.updateStatus(task.id, 'input-required')).toThrow(
				InvalidStateTransitionError,
			);
		});

		it('rejects transition from terminal state', () => {
			const task = taskManager.createTask(makeMessage('terminal-test'));
			taskManager.updateStatus(task.id, 'working');
			taskManager.updateStatus(task.id, 'completed');
			expect(() => taskManager.updateStatus(task.id, 'working')).toThrow(
				InvalidStateTransitionError,
			);
		});

		it('throws TaskNotFoundError for nonexistent task', () => {
			expect(() => taskManager.updateStatus('no-such-task', 'working')).toThrow(
				TaskNotFoundError,
			);
		});

		it('includes status message when provided', () => {
			const task = taskManager.createTask(makeMessage('msg-test'));
			const msg = makeMessage('Processing...', 'agent');
			const updated = taskManager.updateStatus(task.id, 'working', msg);
			expect(updated.status.message).toBeDefined();
			expect(updated.status.message!.parts[0]).toEqual({
				type: 'text',
				text: 'Processing...',
			});
		});
	});

	describe('addArtifact', () => {
		it('appends artifact to task', () => {
			const task = taskManager.createTask(makeMessage('artifact-test'));
			taskManager.updateStatus(task.id, 'working');
			const updated = taskManager.addArtifact(task.id, {
				artifactId: 'art-1',
				name: 'test-artifact',
				parts: [{ type: 'text', text: 'artifact content' }],
			});
			expect(updated.artifacts).toHaveLength(1);
			expect(updated.artifacts[0].name).toBe('test-artifact');
		});

		it('throws for nonexistent task', () => {
			expect(() =>
				taskManager.addArtifact('nonexistent', {
					artifactId: 'x',
					parts: [{ type: 'text', text: 'x' }],
				}),
			).toThrow(TaskNotFoundError);
		});
	});

	describe('addMessage', () => {
		it('appends message to task history', () => {
			const task = taskManager.createTask(makeMessage('history-test'));
			const updated = taskManager.addMessage(task.id, makeMessage('follow-up'));
			expect(updated.history).toHaveLength(2);
		});
	});

	describe('cancelTask', () => {
		it('cancels a submitted task', () => {
			const task = taskManager.createTask(makeMessage('cancel-test'));
			const canceled = taskManager.cancelTask(task.id);
			expect(canceled.status.state).toBe('canceled');
		});

		it('cancels an input-required task', () => {
			const task = taskManager.createTask(makeMessage('cancel-ir'));
			taskManager.updateStatus(task.id, 'working');
			taskManager.updateStatus(task.id, 'input-required');
			const canceled = taskManager.cancelTask(task.id);
			expect(canceled.status.state).toBe('canceled');
		});

		it('throws for completed task', () => {
			const task = taskManager.createTask(makeMessage('cancel-completed'));
			taskManager.updateStatus(task.id, 'working');
			taskManager.updateStatus(task.id, 'completed');
			expect(() => taskManager.cancelTask(task.id)).toThrow(TaskNotCancelableError);
		});

		it('throws for nonexistent task', () => {
			expect(() => taskManager.cancelTask('nonexistent')).toThrow(TaskNotFoundError);
		});
	});

	describe('AP2 contextId continuity flow', () => {
		it('intent → input-required → resume working via contextId lookup', () => {
			const intentTask = taskManager.createTask(makeMessage('intent'));
			taskManager.updateStatus(intentTask.id, 'working');
			taskManager.updateStatus(intentTask.id, 'input-required', {
				role: 'agent',
				parts: [{ type: 'text', text: 'Payment required' }],
			});

			const found = taskManager.findTaskByContextId(intentTask.contextId);
			expect(found).toBeDefined();
			expect(found!.status.state).toBe('input-required');

			taskManager.addMessage(found!.id, makeMessage('payment-payload'));
			const resumed = taskManager.updateStatus(found!.id, 'working', {
				role: 'agent',
				parts: [{ type: 'text', text: 'Payment verified' }],
			});

			expect(resumed.id).toBe(intentTask.id);
			expect(resumed.contextId).toBe(intentTask.contextId);
			expect(resumed.status.state).toBe('working');
			expect(resumed.history).toHaveLength(2);
		});

		it('full AP2 lifecycle: intent → cart → payment → receipt → completed', () => {
			const task = taskManager.createTask(makeMessage('full lifecycle'));
			taskManager.updateStatus(task.id, 'working');

			taskManager.addArtifact(task.id, {
				artifactId: 'cart-1',
				name: 'cart-mandate',
				parts: [{ type: 'data', mimeType: 'application/json', data: { type: 'ap2.mandates.CartMandate' } }],
			});

			taskManager.updateStatus(task.id, 'input-required');

			const found = taskManager.findTaskByContextId(task.contextId)!;
			expect(found.artifacts).toHaveLength(1);

			taskManager.addMessage(found.id, makeMessage('payment submitted'));
			taskManager.updateStatus(found.id, 'working');

			taskManager.addArtifact(found.id, {
				artifactId: 'receipt-1',
				name: 'payment-receipt',
				parts: [{ type: 'data', mimeType: 'application/json', data: { type: 'ap2.mandates.PaymentReceipt' } }],
			});

			taskManager.updateStatus(found.id, 'completed');

			const final = taskManager.getTask(found.id)!;
			expect(final.status.state).toBe('completed');
			expect(final.artifacts).toHaveLength(2);
			expect(final.history).toHaveLength(2);
		});
	});
});
