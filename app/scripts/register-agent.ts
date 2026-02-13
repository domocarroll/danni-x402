import { createPublicClient, createWalletClient, http } from 'viem';
import type { Hex } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e';
const AGENT_URI = 'https://danni.subfrac.cloud';

const IDENTITY_REGISTRY_ABI = [
	{
		name: 'register',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [{ name: 'agentURI', type: 'string' }],
		outputs: [{ name: 'agentId', type: 'uint256' }],
	},
	{
		name: 'getAgentId',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'agentURI', type: 'string' }],
		outputs: [{ name: '', type: 'uint256' }],
	},
] as const;

async function main() {
	const privateKey = process.env.WALLET_PRIVATE_KEY;
	if (!privateKey) {
		console.error('Error: WALLET_PRIVATE_KEY environment variable is required');
		console.error('Usage: WALLET_PRIVATE_KEY=0x... bun run scripts/register-agent.ts');
		process.exit(1);
	}

	const account = privateKeyToAccount(privateKey as Hex);
	console.log(`Registering agent with wallet: ${account.address}`);

	const publicClient = createPublicClient({
		chain: baseSepolia,
		transport: http(),
	});

	const walletClient = createWalletClient({
		account,
		chain: baseSepolia,
		transport: http(),
	});

	try {
		const existingId = await publicClient.readContract({
			address: IDENTITY_REGISTRY as Hex,
			abi: IDENTITY_REGISTRY_ABI,
			functionName: 'getAgentId',
			args: [AGENT_URI],
		});

		if (existingId && existingId > 0n) {
			console.log(`Agent already registered with ID: ${existingId}`);
			console.log(`URI: ${AGENT_URI}`);
			return;
		}
	} catch {
		// Not registered yet
	}

	console.log(`Registering agent URI: ${AGENT_URI}`);
	const hash = await walletClient.writeContract({
		address: IDENTITY_REGISTRY as Hex,
		abi: IDENTITY_REGISTRY_ABI,
		functionName: 'register',
		args: [AGENT_URI],
	});

	console.log(`Transaction submitted: ${hash}`);
	console.log('Waiting for confirmation...');

	const receipt = await publicClient.waitForTransactionReceipt({ hash });
	console.log(`Confirmed in block ${receipt.blockNumber}`);
	console.log(`Status: ${receipt.status}`);

	const agentId = await publicClient.readContract({
		address: IDENTITY_REGISTRY as Hex,
		abi: IDENTITY_REGISTRY_ABI,
		functionName: 'getAgentId',
		args: [AGENT_URI],
	});

	console.log(`Agent registered successfully!`);
	console.log(`Agent ID: ${agentId}`);
	console.log(`Explorer: https://sepolia.basescan.org/tx/${hash}`);
}

main().catch((err) => {
	console.error('Registration failed:', err);
	process.exit(1);
});
