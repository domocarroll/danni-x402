import { createWalletClient, custom, type WalletClient } from 'viem';
import { baseSepolia } from 'viem/chains';

export type WalletState = 'disconnected' | 'connecting' | 'connected' | 'error';

function createWalletStore() {
	let state = $state<WalletState>('disconnected');
	let address = $state<`0x${string}` | null>(null);
	let client = $state<WalletClient | null>(null);
	let error = $state<string | null>(null);

	const hasProvider = $derived(
		typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
	);

	const shortAddress = $derived(
		address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null
	);

	async function connect() {
		if (!hasProvider) {
			state = 'error';
			error = 'No wallet detected. Install MetaMask or Coinbase Wallet.';
			return;
		}

		state = 'connecting';
		error = null;

		try {
			const accounts = await window.ethereum!.request({
				method: 'eth_requestAccounts',
			}) as string[];

			if (!accounts[0]) {
				state = 'error';
				error = 'No account returned from wallet';
				return;
			}

			const addr = accounts[0] as `0x${string}`;
			address = addr;

			client = createWalletClient({
				account: addr,
				chain: baseSepolia,
				transport: custom(window.ethereum!),
			});

			state = 'connected';
		} catch (err) {
			state = 'error';
			error = err instanceof Error ? err.message : 'Wallet connection failed';
		}
	}

	function disconnect() {
		state = 'disconnected';
		address = null;
		client = null;
		error = null;
	}

	function reset() {
		error = null;
		if (state === 'error') {
			state = 'disconnected';
		}
	}

	return {
		get state() { return state; },
		get address() { return address; },
		get client() { return client; },
		get error() { return error; },
		get hasProvider() { return hasProvider; },
		get shortAddress() { return shortAddress; },
		connect,
		disconnect,
		reset,
	};
}

export const walletStore = createWalletStore();
