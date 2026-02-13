---
title: Wallets and Signing
created: 2026-02-12
type: concept
tags: [wallet, crypto, signing, keys]
---

# Wallets and Signing

A wallet is two things:
1. **Private key** - A secret string that signs messages. Stored as env var. Never leaves the server.
2. **Address** - The public identity derived from the key. Where money goes.

## For the Hackathon

Generate a keypair, fund with fake USDC from Circle's faucet, done. No MetaMask, no browser extensions, no user-facing crypto UX unless we choose to add it.

## EVM Signing (Base, SKALE)

```typescript
import { privateKeyToAccount } from "viem/accounts";
const signer = privateKeyToAccount("0xYourPrivateKey");
```

## Client Setup

```typescript
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";

const client = new x402Client();
registerExactEvmScheme(client, { signer: privateKeyToAccount(key) });
```

## Danni's Wallets

Danni needs two wallet roles:
- **Seller wallet** - The address that receives payments (just the address, no private key on server)
- **Buyer wallet** - The private key that signs payments when Danni buys data from [[Data Broker]]

In practice these could be the same wallet or separate for accounting clarity.

## Testnet Funding

- **USDC**: Free from [Circle Faucet](https://faucet.circle.com/) for Base Sepolia
- **ETH for gas**: Free from Base Sepolia faucet
- **SKALE**: Gasless (no ETH needed), USDC via SKALE faucet/bridge

## Related
- [[x402 Protocol]]
- [[Base Sepolia]]
- [[SKALE Network]]
- [[Danni Commerce Agent]]
