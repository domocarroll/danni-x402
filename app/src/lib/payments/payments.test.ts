import { describe, it, expect, beforeEach } from 'vitest';
import { recordTransaction, getTransactions, getTransactionCount } from './transaction-store.js';
import type { StoredTransaction } from './transaction-store.js';

function makeTx(overrides: Partial<StoredTransaction> = {}): StoredTransaction {
	return {
		id: crypto.randomUUID(),
		txHash: `0x${crypto.randomUUID().replace(/-/g, '')}`,
		amount: '100000000',
		service: 'brand-analysis',
		network: 'eip155:84532',
		timestamp: Date.now(),
		status: 'confirmed',
		...overrides,
	};
}

describe('transaction-store', () => {
	it('starts with transactions from prior test state (singleton)', () => {
		const initial = getTransactionCount();
		expect(typeof initial).toBe('number');
	});

	it('records a transaction and increments count', () => {
		const before = getTransactionCount();
		recordTransaction(makeTx());
		expect(getTransactionCount()).toBe(before + 1);
	});

	it('records multiple transactions', () => {
		const before = getTransactionCount();
		recordTransaction(makeTx({ service: 'competitive-scan' }));
		recordTransaction(makeTx({ service: 'market-pulse' }));
		expect(getTransactionCount()).toBe(before + 2);
	});

	it('newest transaction is first (unshift order)', () => {
		const newest = makeTx({ service: 'newest-test' });
		recordTransaction(newest);
		const txns = getTransactions();
		expect(txns[0].service).toBe('newest-test');
	});

	it('returns readonly array', () => {
		const txns = getTransactions();
		expect(Array.isArray(txns)).toBe(true);
	});

	it('preserves all transaction fields', () => {
		const tx = makeTx({
			amount: '5000000',
			service: 'market-pulse',
			status: 'pending',
			brief: 'Test brief content',
		});
		recordTransaction(tx);
		const found = getTransactions().find((t) => t.id === tx.id);
		expect(found).toBeDefined();
		expect(found!.amount).toBe('5000000');
		expect(found!.service).toBe('market-pulse');
		expect(found!.status).toBe('pending');
		expect(found!.brief).toBe('Test brief content');
	});

	it('handles transactions with all status types', () => {
		const before = getTransactionCount();
		recordTransaction(makeTx({ status: 'pending' }));
		recordTransaction(makeTx({ status: 'confirmed' }));
		recordTransaction(makeTx({ status: 'failed' }));
		expect(getTransactionCount()).toBe(before + 3);
	});
});
