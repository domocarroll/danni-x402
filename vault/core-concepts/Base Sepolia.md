---
title: Base Sepolia
created: 2026-02-12
type: concept
tags: [blockchain, testnet, base, coinbase]
---

# Base Sepolia

The testnet for Base (Coinbase's L2 chain). Uses fake USDC - no real money. Primary network for our hackathon demo.

## Details

| Property | Value |
|---|---|
| Network ID (CAIP-2) | `eip155:84532` |
| Chain ID | `84532` |
| USDC Contract | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| USDC Faucet | [Circle Faucet](https://faucet.circle.com/) |
| ETH Faucet | Base Sepolia faucet |
| Facilitators | CDP, x402.org, Kobaru, Mogami, AutoIncentive |

## Mainnet Equivalent

Same code, one config change:
- Network: `eip155:8453`
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Why Base

- Coinbase's chain → best x402 support
- Every facilitator supports it
- Fastest testnet setup
- Hackathon sponsor alignment

## Related
- [[x402 Protocol]]
- [[The Facilitator]]
- [[SKALE Network]] (our secondary chain)
