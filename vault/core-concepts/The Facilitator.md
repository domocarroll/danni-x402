---
title: The Facilitator
created: 2026-02-12
type: concept
tags: [x402, facilitator, settlement, blockchain]
---

# The Facilitator

The middleman that handles blockchain settlement so our server doesn't have to. The facilitator verifies payment signatures and submits transactions on-chain.

## What It Does

1. **Verifies** - Checks signatures, amounts, nonces, expiry
2. **Settles** - Submits the transaction to the blockchain
3. **Returns** - Provides tx hash back to the resource server

The facilitator does NOT hold funds. It executes pre-signed payloads that the client created.

## Available Facilitators

| Facilitator | Networks | SKALE? | Notes |
|---|---|---|---|
| **CDP (Coinbase)** | Base, Base Sepolia, Solana | No | 1,000 tx/month free, then $0.001/tx |
| **x402.org** | Base Sepolia, Solana Devnet | No | Default testnet facilitator |
| **Kobaru** | Base, Base Sepolia, **SKALE, SKALE Sepolia** | **Yes** | Our SKALE facilitator |
| **PayAI** | 13+ networks including **SKALE** | **Yes** | Multi-network |
| **AutoIncentive** | Solana, Base, testnets | No | No API keys required |
| **Mogami** | Base, Base Sepolia | No | Free, Docker option |

## Our Dual-Chain Strategy

```
Base Sepolia  → CDP Facilitator (Coinbase's own)
SKALE Europa  → Kobaru Facilitator (SKALE-native)
```

Same code, different config. The [[x402 Protocol|x402 SDK]] handles the routing.

## Integration

The facilitator URL is just a config value:
```typescript
const facilitator = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator" // or Kobaru URL for SKALE
});
```

The facilitator exposes three endpoints:
- `POST /verify` - Validate a payment payload
- `POST /settle` - Submit transaction on-chain
- `GET /supported` - List supported networks/assets

## Related
- [[x402 Protocol]]
- [[Base Sepolia]]
- [[SKALE Network]]
- [[Wallets and Signing]]
