---
title: SKALE Network
created: 2026-02-12
type: concept
tags: [blockchain, skale, privacy, bite, gasless]
---

# SKALE Network

A network of Layer 1 blockchains built for the Internet of Agents. Gasless transactions, instant finality, and [[BITE Protocol]] for transaction privacy.

**SKALE is the hackathon host.** Integration matters for sponsor alignment.

## Key Properties

- **Gasless** - Zero gas fees, powered by compute credits
- **Instant finality** - Sub-second confirmation
- **BITE Privacy** - Transactions encrypted until finality
- **EVM compatible** - Same Solidity/EVM tooling

## x402 on SKALE

SKALE supports x402 via EIP-3009 forwarding contracts:

| Property | Value |
|---|---|
| Chain (Europa Testnet) | `eip155:1444673419` |
| Forwarder Contract | `0x7779B0d1766e6305E5f8081E3C0CDF58FcA24330` |
| USDC | `0xD1A64e20e93E088979631061CACa74E08B3c0f55` |
| Supported Facilitators | **Kobaru**, **PayAI** |

## Why SKALE Matters For Us

1. **Hackathon host** - SKALE Labs is the primary organizer
2. **Privacy narrative** - "Danni's strategic consultations are encrypted until settlement" via [[BITE Protocol]]
3. **Gasless** - Micropayments for [[Data Broker]] calls without gas overhead
4. **Dual-chain story** - Demonstrates x402's chain-agnostic nature

## EIP-3009 Forwarding

SKALE uses a forwarding contract pattern (not native ERC-3009):
1. User approves the forwarder to spend tokens
2. User signs an EIP-712 authorization
3. Relayer submits to the forwarder (gas-free on SKALE)

Technical reference: [x402 via EIP-3009 Forwarding](https://www.thegreataxios.com/blog/x402-via-eip3009-forwarding)

## Related
- [[BITE Protocol]]
- [[The Facilitator]] (Kobaru supports SKALE)
- [[Base Sepolia]] (our primary chain)
- [[Hackathon Strategy]]
