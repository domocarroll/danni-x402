---
title: Danni Commerce Agent
created: 2026-02-12
type: architecture
tags: [danni, agent, commerce, core]
---

# Danni Commerce Agent

The core product. Danni is simultaneously:

## As Seller
- SvelteKit API routes protected by [[x402 Protocol]]
- Users/agents pay to access strategic analysis
- Published via [[A2A Protocol]] Agent Card and [[MCP Integration]] server
- Premium [[Pricing Model]] ($100 per strategic brief)

## As Buyer
- Autonomously purchases data from [[Data Broker]] endpoints
- Pays via x402 from her own wallet
- Budget allocated per engagement ($13 data, $5 API costs)
- Transactions visible in the glass-box frontend

## The Engagement Flow

1. Client discovers Danni (via A2A Agent Card, MCP, or direct URL)
2. Client requests strategic analysis
3. Server returns 402 - $100 USDC required
4. Client pays via [[The Payment Flow]]
5. [[Swarm Architecture]] activates - 5 sub-agents in parallel
6. Danni buys data from [[Data Broker]] (sub-payments via x402)
7. Sub-agents process real data
8. Danni synthesizes into cohesive strategic brief
9. Payment settled on-chain, brief delivered with tx receipt

## Dual Persona

Danni's character (see [[Danni - Personality]]) brings warmth, sophistication, and genuine strategic depth. She's not a generic chatbot - she's the world's best strategic advisor who happens to settle payments on-chain.

## Related
- [[Product Vision]]
- [[Swarm Architecture]]
- [[The Payment Flow]]
- [[Pricing Model]]
- [[Danni - Personality]]
