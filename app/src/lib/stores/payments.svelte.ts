export type PaymentStep = 'idle' | 'challenged' | 'signing' | 'settling' | 'confirmed';

export interface Transaction {
	id: string;
	txHash: string;
	amount: string;
	service: string;
	network: string;
	timestamp: number;
	status: 'pending' | 'confirmed' | 'failed';
}

const EXPLORER_BASE = 'https://sepolia.basescan.org/tx';

function createPaymentsStore() {
	let paymentStep = $state<PaymentStep>('idle');
	let currentTxHash = $state<string | null>(null);
	let transactions = $state<Transaction[]>([
		{
			id: 'tx_demo_1',
			txHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
			amount: '$100',
			service: 'Brand Analysis',
			network: 'Base Sepolia',
			timestamp: Date.now() - 86400000,
			status: 'confirmed'
		},
		{
			id: 'tx_demo_2',
			txHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
			amount: '$5',
			service: 'Competitive Data',
			network: 'Base Sepolia',
			timestamp: Date.now() - 172800000,
			status: 'confirmed'
		},
		{
			id: 'tx_demo_3',
			txHash: '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
			amount: '$5',
			service: 'Market Data',
			network: 'Base Sepolia',
			timestamp: Date.now() - 259200000,
			status: 'confirmed'
		},
		{
			id: 'tx_demo_4',
			txHash: '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
			amount: '$100',
			service: 'Brand Analysis',
			network: 'Base Sepolia',
			timestamp: Date.now() - 345600000,
			status: 'confirmed'
		},
		{
			id: 'tx_demo_5',
			txHash: '0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
			amount: '$5',
			service: 'Social Data',
			network: 'Base Sepolia',
			timestamp: Date.now() - 432000000,
			status: 'confirmed'
		}
	]);

	const totalSpent = $derived(
		transactions
			.filter((t) => t.status === 'confirmed')
			.reduce((sum, t) => sum + parseFloat(t.amount.replace('$', '')), 0)
	);

	const totalAnalyses = $derived(
		transactions.filter((t) => t.service === 'Brand Analysis' && t.status === 'confirmed').length
	);

	const transactionCount = $derived(transactions.length);

	function setPaymentStep(step: PaymentStep) {
		paymentStep = step;
	}

	function setCurrentTxHash(hash: string | null) {
		currentTxHash = hash;
	}

	function addTransaction(tx: Transaction) {
		transactions = [tx, ...transactions];
	}

	function explorerUrl(txHash: string): string {
		return `${EXPLORER_BASE}/${txHash}`;
	}

	function formatTimestamp(ts: number): string {
		return new Date(ts).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function reset() {
		paymentStep = 'idle';
		currentTxHash = null;
	}

	return {
		get paymentStep() { return paymentStep; },
		get currentTxHash() { return currentTxHash; },
		get transactions() { return transactions; },
		get totalSpent() { return totalSpent; },
		get totalAnalyses() { return totalAnalyses; },
		get transactionCount() { return transactionCount; },
		setPaymentStep,
		setCurrentTxHash,
		addTransaction,
		explorerUrl,
		formatTimestamp,
		reset
	};
}

export const paymentsStore = createPaymentsStore();
