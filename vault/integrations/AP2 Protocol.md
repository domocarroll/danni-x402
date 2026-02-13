---
title: AP2 Protocol
created: 2026-02-12
type: integration
tags: [ap2, google, payments, trust]
---

# AP2 Protocol (Agent Payments Protocol)

Google's payment trust layer for agents. Complements [[A2A Protocol]] and [[x402 Protocol]].

## The Three-Layer Stack

```
A2A  → Agent discovers Danni, negotiates the task
AP2  → Establishes payment trust (verifiable credentials)
x402 → Settles the actual USDC payment on-chain
```

## What AP2 Adds

- **Verifiable Credentials (VCs)** - Cryptographically signed authorization objects
  - Intent Mandates - "I intend to buy brand analysis"
  - Cart Mandates - "Here's what I'm buying and the terms"
  - Payment Mandates - "I authorize this specific payment"
- **Payment method agnostic** - Credit cards, bank transfers, AND crypto (x402)
- **Trust infrastructure** - Accountability for autonomous agent transactions

## Relationship to x402

AP2 provides the **trust and authorization layer**. x402 provides the **settlement rail**.

"AP2 is designed to support emerging payment methods like x402" - AP2 docs

AP2 wraps x402 in proper authorization semantics. x402 moves the money.

## For Our Build

AP2 integration is more about **signaling architectural awareness** than deep implementation. The A2A x402 extension already handles the practical payment flow. Mentioning AP2 in our [[Demo Video Strategy|demo video]] and README shows we understand the full Google agentic commerce stack.

## Related
- [[A2A Protocol]]
- [[x402 Protocol]]
- [[Sponsor Alignment]]
