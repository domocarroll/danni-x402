import type { WalletClient, Account } from 'viem';

/**
 * x402 client-side payment integration for SvelteKit.
 *
 * Bridges viem WalletClient to the @x402/evm ClientEvmSigner interface,
 * enabling browser wallets (MetaMask, Coinbase Wallet) to sign EIP-3009
 * transferWithAuthorization messages for x402 payment flows.
 */

interface ClientEvmSigner {
	readonly address: `0x${string}`;
	signTypedData(message: {
		domain: Record<string, unknown>;
		types: Record<string, unknown>;
		primaryType: string;
		message: Record<string, unknown>;
	}): Promise<`0x${string}`>;
}

export function walletToSigner(walletClient: WalletClient): ClientEvmSigner {
	if (!walletClient.account) {
		throw new Error('Wallet client must have an account');
	}

	return {
		address: walletClient.account.address,
		signTypedData: async (msg) => {
			const signature = await walletClient.signTypedData({
				account: walletClient.account as Account,
				domain: msg.domain,
				types: msg.types,
				primaryType: msg.primaryType,
				message: msg.message,
			});
			return signature;
		},
	};
}

export async function createPaymentFetch(walletClient: WalletClient) {
	const { wrapFetchWithPayment } = await import('@x402/fetch');
	const { ExactEvmScheme } = await import('@x402/evm/exact/client');
	const { x402Client } = await import('@x402/core/client');

	const signer = walletToSigner(walletClient);
	const client = new x402Client()
		.register('eip155:84532', new ExactEvmScheme(signer));

	return wrapFetchWithPayment(fetch, client);
}

export interface PaymentReceipt {
	txHash?: string;
	success?: boolean;
	network?: string;
	[key: string]: unknown;
}

export function decodePaymentResponse(header: string | null): PaymentReceipt | null {
	if (!header) return null;
	try {
		return JSON.parse(atob(header)) as PaymentReceipt;
	} catch {
		return null;
	}
}
