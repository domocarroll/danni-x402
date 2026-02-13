---
title: Tech Stack
created: 2026-02-12
type: hackathon
tags: [tech, stack, dependencies]
---

# Tech Stack

## Framework
- **SvelteKit** - Frontend + API routes + server hooks
- **TypeScript** - Throughout
- **Vite** - Build tool (via SvelteKit)

## x402 Packages
- `@x402/core` - Protocol engine (framework-agnostic)
- `@x402/evm` - EVM payment schemes (Base + SKALE)
- `@x402/fetch` - Client-side auto-payment
- `@x402/mcp` - MCP server/client wrappers
- `@x402/paywall` - Browser paywall HTML generation
- `@x402/extensions` - Bazaar discovery (optional)

## Custom
- [[SvelteKit x402 Adapter]] - Our `@x402/sveltekit` (~200 lines)

## Blockchain
- `viem` - Ethereum library (wallet creation, signing)
- Base Sepolia USDC - Primary testnet
- SKALE Europa - Secondary chain

## AI/LLM
- Claude Opus 4.6 - Danni and all sub-agents
- [[LLM Provider Abstraction]] - CLI for dev, API for production
- Anthropic SDK - For API provider

## Data
- Apify - Web scraping actors for real market data
- Apify SDK/API - Actor execution

## Agent Protocols
- `@modelcontextprotocol/sdk` - MCP server
- A2A JSON-RPC - Agent Card + task handler
- `@x402/mcp` - x402 payment wrappers for MCP

## Deployment
- Vercel or adapter-node (TBD)
- HTTPS required for x402 headers

## Related
- [[SvelteKit x402 Adapter]]
- [[LLM Provider Abstraction]]
- [[Team Architecture]]
