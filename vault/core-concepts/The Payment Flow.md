---
title: The Payment Flow
created: 2026-02-12
type: concept
tags: [x402, flow, payments]
---

# The Payment Flow

The concrete HTTP exchange when someone pays [[Danni Commerce Agent]] for strategic analysis.

## The Sequence

```
User/Agent: "Analyze Nike's brand positioning"
     │
     ▼
Danni's Server: "402 - that costs $100 USDC on Base Sepolia"
     │
     ▼
Client wallet signs: "I agree to pay $100 to 0xDanni..."
     │
     ▼
Client retries with signed payment as HTTP header
     │
     ▼
Server sends signature to [[The Facilitator]]
     │
     ▼
Facilitator: "Signature valid, funds confirmed" ✓
     │
     ▼
[[Swarm Architecture|Swarm activates]] - 5 agents work in parallel
     │
     ├── Danni pays [[Data Broker]] $5 for market data (x402)
     ├── Danni pays [[Data Broker]] $5 for competitive intel (x402)
     └── Danni pays [[Data Broker]] $3 for social sentiment (x402)
     │
     ▼
Danni synthesizes → delivers strategic brief
     │
     ▼
Facilitator settles $100 on-chain (tx hash returned)
     │
     ▼
Client receives: strategic brief + blockchain receipt
```

## Bidirectional Commerce

This is what makes Danni special. She is **both buyer and seller** in a single transaction:

**As Seller:** Receives $100 from the user for strategic analysis
**As Buyer:** Autonomously spends $13 on data acquisition from x402 services

The user sees all of this in the [[Glass Box Frontend]] - the swarm activating, the sub-payments settling, the synthesis happening.

## Three Layers of Commerce

1. **Human → Agent** (user pays Danni)
2. **Agent → Service** (Danni pays [[Data Broker]])
3. **Service → External API** (Data Broker calls Apify)

Most hackathon entries show one direction. We show the full loop.

## Related
- [[x402 Protocol]]
- [[Danni Commerce Agent]]
- [[Swarm Architecture]]
- [[Data Broker]]
- [[Pricing Model]]
