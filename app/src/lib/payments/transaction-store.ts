export interface StoredTransaction {
	id: string;
	txHash: string;
	amount: string;
	service: string;
	network: string;
	timestamp: number;
	status: 'pending' | 'confirmed' | 'failed';
	brief?: string;
}

/**
 * In-memory transaction store for recording x402 payments.
 * Server-side singleton — persists for the lifetime of the dev server.
 */
const transactions: StoredTransaction[] = [];

export function recordTransaction(tx: StoredTransaction): void {
	transactions.unshift(tx);
}

export function getTransactions(): ReadonlyArray<StoredTransaction> {
	return transactions;
}

export function getTransactionCount(): number {
	return transactions.length;
}
