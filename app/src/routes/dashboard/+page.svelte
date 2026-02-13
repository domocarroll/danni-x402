<script lang="ts">
	import { paymentsStore } from '$lib/stores/payments.svelte';
</script>

<svelte:head>
	<title>Danni - Dashboard</title>
</svelte:head>

<div class="dashboard">
	<div class="dash-header">
		<h1>Payment Dashboard</h1>
		<p class="dash-subtitle">Transaction history on Base Sepolia</p>
	</div>

	<div class="stats">
		<div class="stat-card">
			<span class="stat-value">${paymentsStore.totalSpent}</span>
			<span class="stat-label">Total Spent</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{paymentsStore.totalAnalyses}</span>
			<span class="stat-label">Analyses</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{paymentsStore.transactionCount}</span>
			<span class="stat-label">Transactions</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">${paymentsStore.totalAnalyses > 0 ? (paymentsStore.totalSpent / paymentsStore.transactionCount).toFixed(0) : 0}</span>
			<span class="stat-label">Avg per Tx</span>
		</div>
	</div>

	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th>Date</th>
					<th>Service</th>
					<th>Amount</th>
					<th>Status</th>
					<th>Transaction</th>
				</tr>
			</thead>
			<tbody>
				{#each paymentsStore.transactions as tx (tx.id)}
					<tr>
						<td class="date">{paymentsStore.formatTimestamp(tx.timestamp)}</td>
						<td>{tx.service}</td>
						<td class="amount">{tx.amount}</td>
						<td>
							<span class="status-badge" class:confirmed={tx.status === 'confirmed'} class:pending={tx.status === 'pending'} class:failed={tx.status === 'failed'}>
								{tx.status}
							</span>
						</td>
						<td>
							<a href={paymentsStore.explorerUrl(tx.txHash)} target="_blank" rel="noopener" class="tx-link">
								{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
								</svg>
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.dashboard {
		max-width: 1000px;
		margin: 0 auto;
		padding: 3rem 1.5rem;
	}

	.dash-header {
		margin-bottom: 2rem;
	}

	.dash-header h1 {
		font-size: 1.75rem;
		font-weight: 300;
		letter-spacing: 0.03em;
	}

	.dash-subtitle {
		color: #666;
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin-bottom: 2.5rem;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid #1a1a1a;
		border-radius: 0.75rem;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: #fafafa;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.table-container {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #1a1a1a;
		border-radius: 0.75rem;
		overflow: hidden;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 0.875rem 1rem;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #555;
		border-bottom: 1px solid #1a1a1a;
	}

	td {
		padding: 0.875rem 1rem;
		font-size: 0.875rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.03);
	}

	tr:last-child td {
		border-bottom: none;
	}

	.date {
		color: #888;
		font-size: 0.8rem;
	}

	.amount {
		font-weight: 600;
		color: #6366f1;
	}

	.status-badge {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		border-radius: 1rem;
		font-size: 0.7rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.status-badge.confirmed {
		background: rgba(34, 197, 94, 0.1);
		color: #22c55e;
	}

	.status-badge.pending {
		background: rgba(234, 179, 8, 0.1);
		color: #eab308;
	}

	.status-badge.failed {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
	}

	.tx-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		color: #6366f1;
		font-size: 0.8rem;
		font-family: ui-monospace, monospace;
		transition: opacity 0.2s;
	}

	.tx-link:hover {
		opacity: 0.8;
	}

	@media (max-width: 768px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}

		.table-container {
			overflow-x: auto;
		}
	}
</style>
