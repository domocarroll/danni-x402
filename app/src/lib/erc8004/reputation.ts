import { createPublicClient, createWalletClient, http, keccak256, toHex } from 'viem';
import type { Hex } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import {
	ERC8004_CONTRACTS,
	REPUTATION_REGISTRY_ABI,
	IDENTITY_REGISTRY_ABI,
} from './constants.js';

function getClients() {
	const privateKey = process.env.WALLET_PRIVATE_KEY;
	if (!privateKey) {
		throw new Error('WALLET_PRIVATE_KEY environment variable is required for ERC-8004 operations');
	}

	const account = privateKeyToAccount(privateKey as Hex);
	const publicClient = createPublicClient({
		chain: baseSepolia,
		transport: http(),
	});
	const walletClient = createWalletClient({
		account,
		chain: baseSepolia,
		transport: http(),
	});

	return { account, publicClient, walletClient };
}

export async function getAgentId(agentURI: string): Promise<bigint> {
	const { publicClient } = getClients();
	const agentId = await publicClient.readContract({
		address: ERC8004_CONTRACTS.IDENTITY_REGISTRY as Hex,
		abi: IDENTITY_REGISTRY_ABI,
		functionName: 'getAgentId',
		args: [agentURI],
	});
	return agentId;
}

export async function submitPaymentFeedback(opts: {
	agentId: bigint;
	endpoint: string;
	transactionHash: string;
	paymentAmount: string;
}): Promise<Hex> {
	const { walletClient } = getClients();

	const feedbackHash = keccak256(toHex(opts.transactionHash));

	const hash = await walletClient.writeContract({
		address: ERC8004_CONTRACTS.REPUTATION_REGISTRY as Hex,
		abi: REPUTATION_REGISTRY_ABI,
		functionName: 'giveFeedback',
		args: [
			opts.agentId,
			BigInt(100),
			0,
			'x402-payment',
			'brand-analysis',
			opts.endpoint,
			`tx:${opts.transactionHash}`,
			feedbackHash,
		],
	});

	return hash;
}

export async function getReputationSummary(agentId: bigint): Promise<{
	count: bigint;
	averageScore: bigint;
}> {
	const { publicClient } = getClients();
	const [count, avg] = await publicClient.readContract({
		address: ERC8004_CONTRACTS.REPUTATION_REGISTRY as Hex,
		abi: REPUTATION_REGISTRY_ABI,
		functionName: 'getSummary',
		args: [agentId, [], 'x402-payment', ''],
	});

	return { count, averageScore: avg };
}
