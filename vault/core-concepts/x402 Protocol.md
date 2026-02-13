---
title: x402 Protocol
created: 2026-02-12
type: concept
tags: [x402, payments, protocol, coinbase]
---

# x402 Protocol

x402 is an open-source payment protocol by Coinbase that revives HTTP's `402 Payment Required` status code for instant stablecoin micropayments directly over HTTP. No accounts, no API keys, no subscriptions - just HTTP and money.

## How It Works

1. Client requests a resource
2. Server responds with `402 Payment Required` + `PAYMENT-REQUIRED` header (base64 JSON)
3. Client signs a payment payload using its [[Wallets and Signing|wallet]]
4. Client retries with `PAYMENT-SIGNATURE` header (base64 JSON)
5. Server sends signature to [[The Facilitator]]
6. Facilitator verifies and settles on-chain
7. Server returns `200 OK` + data + `PAYMENT-RESPONSE` header (receipt with tx hash)

The whole round-trip takes ~1 second.

## Key Headers

| Header | Direction | Contains |
|---|---|---|
| `PAYMENT-REQUIRED` | Server → Client | Payment requirements (amount, network, payTo) |
| `PAYMENT-SIGNATURE` | Client → Server | Signed payment payload |
| `PAYMENT-RESPONSE` | Server → Client | Settlement receipt with tx hash |

All headers are base64-encoded JSON.

## Network Format

Networks use CAIP-2 format:
- `eip155:8453` - Base Mainnet
- `eip155:84532` - [[Base Sepolia]] (testnet)
- `eip155:1444673419` - [[SKALE Network]] Europa
- `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` - Solana Mainnet

## Payment Schemes

- **exact** - Fixed price per request (primary, what we use)
- **upto** - Consumption-based pricing (planned)

## SDK Packages

### Core (Framework-Agnostic)
- `@x402/core` - Protocol engine, types, HTTP adapter interface (depends only on zod)
- `@x402/evm` - EVM payment schemes (Base, Ethereum, SKALE)
- `@x402/svm` - Solana payment schemes
- `@x402/extensions` - Bazaar discovery, sign-in-with-x
- `@x402/paywall` - Browser paywall HTML generation
- `@x402/mcp` - [[MCP Integration]] wrappers

### Server Middleware
- `@x402/next` - Next.js middleware
- `@x402/express` - Express middleware
- `@x402/hono` - Hono middleware
- No SvelteKit package exists → we build [[SvelteKit x402 Adapter]]

### Client Libraries
- `@x402/fetch` - Wraps native fetch for auto-payment
- `@x402/axios` - Wraps Axios for auto-payment

## Architecture: The HTTPAdapter Pattern

The entire framework integration surface is one interface:

```typescript
interface HTTPAdapter {
  getHeader(name: string): string | undefined;
  getMethod(): string;
  getPath(): string;
  getUrl(): string;
  getAcceptHeader(): string;
  getUserAgent(): string;
  getQueryParams?(): Record<string, string | string[]>;
  getQueryParam?(name: string): string | string[] | undefined;
  getBody?(): unknown;
}
```

Each framework adapter implements this (~100 lines), then the framework-agnostic `x402HTTPResourceServer` handles all protocol logic. This is why [[SvelteKit x402 Adapter]] is only ~200 lines of custom code.

## V2 (Current)

Launched 2025, 100M+ payments processed. Plugin-driven architecture with lifecycle hooks (beforeVerify, afterVerify, beforeSettle, afterSettle, etc.).

## Related
- [[The Payment Flow]]
- [[The Facilitator]]
- [[SvelteKit x402 Adapter]]
- [[A2A Protocol]] (uses x402 as payment rail)
- [[AP2 Protocol]] (designed to support x402)
