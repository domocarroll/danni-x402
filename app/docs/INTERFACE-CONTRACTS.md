---
title: Interface Contracts
created: 2026-02-12
type: architecture
tags: [architecture, interfaces, teams, contracts]
---

# Interface Contracts

Exact API boundaries between parallel teams. Each team builds to these contracts independently.

## Contract 1: x402 SvelteKit Adapter (Alpha)

**Produces:** A `Handle` hook for `hooks.server.ts` and a `SvelteKitAdapter` class

```typescript
// src/lib/x402/adapter.ts
import type { HTTPAdapter } from '@x402/core/server';
import type { RequestEvent } from '@sveltejs/kit';

export class SvelteKitAdapter implements HTTPAdapter {
  constructor(event: RequestEvent);
  getHeader(name: string): string | undefined;
  getMethod(): string;
  getPath(): string;
  getUrl(): string;
  getAcceptHeader(): string;
  getUserAgent(): string;
  getQueryParams(): Record<string, string | string[]>;
  getQueryParam(name: string): string | string[] | undefined;
  getBody(): Promise<unknown>;
}
```

```typescript
// src/lib/x402/middleware.ts
import type { Handle } from '@sveltejs/kit';
import type { RoutesConfig } from '@x402/core';

export function createPaymentHook(config: {
  routes: RoutesConfig;
  facilitatorUrl: string;
  payTo: string;
  network: string;
}): Handle;
```

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { createPaymentHook } from '$lib/x402/middleware';

const paymentHook = createPaymentHook({
  routes: {
    'POST /api/danni/analyze': { price: '$100', network: 'eip155:84532' },
    'GET /api/data/*': { price: '$5', network: 'eip155:84532' },
  },
  facilitatorUrl: 'https://x402.org/facilitator',
  payTo: '0xDanniWalletAddress',
  network: 'eip155:84532',
});

export const handle = sequence(paymentHook);
```

**Consumed by:** Delta (frontend), Echo (MCP/A2A), Bravo (Data Broker)

---

## Contract 2: Data Broker Endpoints (Bravo)

**Produces:** x402-paywalled API routes that return real data

```typescript
// POST /api/data/competitive
// Request:
{ brand: string; competitors?: string[] }
// Response:
{
  brand: string;
  competitors: Array<{
    name: string;
    positioning: string;
    strengths: string[];
    weaknesses: string[];
    marketShare?: string;
  }>;
  sources: string[];
  fetchedAt: string;
}

// POST /api/data/social
// Request:
{ brand: string; platforms?: string[] }
// Response:
{
  brand: string;
  sentiment: { positive: number; neutral: number; negative: number };
  themes: string[];
  volume: number;
  sources: string[];
  fetchedAt: string;
}

// POST /api/data/market
// Request:
{ industry: string; region?: string }
// Response:
{
  industry: string;
  marketSize: string;
  growthRate: string;
  trends: string[];
  keyPlayers: string[];
  sources: string[];
  fetchedAt: string;
}
```

**x402 pricing:** $5 per endpoint call
**Consumed by:** Charlie (swarm agents call these), Delta (display data sources)

---

## Contract 3: Swarm Orchestration Engine (Charlie)

**Produces:** A single function that takes a user brief and returns a strategic analysis

```typescript
// src/lib/swarm/orchestrator.ts

interface SwarmInput {
  brief: string;              // User's strategic question
  brand?: string;             // Target brand (extracted from brief)
  industry?: string;          // Target industry
  dataBrokerBaseUrl: string;  // Where to fetch data (x402-paywalled)
  walletPrivateKey: string;   // For paying Data Broker
}

interface SwarmOutput {
  brief: SwarmInput['brief'];
  analysis: {
    market: AgentOutput;
    competitive: AgentOutput;
    cultural: AgentOutput;
    brand: AgentOutput;
    synthesis: string;         // Danni's unified strategic recommendation
  };
  metadata: {
    agentsUsed: number;
    dataSourcesPurchased: number;
    totalCostUsd: number;
    durationMs: number;
    txHashes: string[];        // On-chain payment receipts for data
  };
}

interface AgentOutput {
  agentName: string;
  status: 'completed' | 'failed' | 'timeout';
  output: string;
  sources: string[];
  durationMs: number;
}

export function executeSwarm(input: SwarmInput): Promise<SwarmOutput>;
```

**LLM Provider interface (also Charlie's responsibility):**

```typescript
// src/lib/llm/provider.ts

interface LLMProvider {
  complete(params: {
    systemPrompt: string;
    userMessage: string;
    maxTokens?: number;
  }): Promise<string>;
}

// Env var USE_CLI=true → claude -p, else → Anthropic API
export function createLLMProvider(): LLMProvider;
```

**Consumed by:** Alpha (main API route calls `executeSwarm`), Delta (streams progress)

---

## Contract 4: Frontend (Delta)

**Produces:** SvelteKit pages and components

```
src/routes/
  +page.svelte              # Landing / hero
  +layout.svelte            # Global layout, wallet status
  chat/+page.svelte         # Danni chat interface
  dashboard/+page.svelte    # Payment history, tx explorer
```

**Consumes:**

```typescript
// Main API endpoint (calls swarm, x402-protected)
POST /api/danni/analyze
Request: { brief: string }
Response: SwarmOutput (streamed via SSE for progress updates)

// Payment status
GET /api/payments/history
Response: Array<{ txHash, amount, network, timestamp, service }>
```

**Key UX requirements:**
- Glass-box: show each swarm agent activating, data being purchased, synthesis happening
- Payment flow visualization: 402 challenge → payment → settlement → receipt
- Real-time tx hashes linking to block explorers
- Danni's personality in every interaction

---

## Contract 5: MCP Server + A2A Agent Card (Echo)

**MCP Server produces:**

```typescript
// MCP tools exposed:
{
  tools: [
    {
      name: "brand_analysis",
      description: "Comprehensive brand strategy analysis by Danni",
      inputSchema: { brief: string },
      price: "$100",
      network: "eip155:84532"
    },
    {
      name: "competitive_scan",
      description: "Quick competitive landscape scan",
      inputSchema: { brand: string, competitors?: string[] },
      price: "$5",
      network: "eip155:84532"
    },
    {
      name: "market_pulse",
      description: "Industry market dynamics overview",
      inputSchema: { industry: string },
      price: "$5",
      network: "eip155:84532"
    }
  ]
}
```

**A2A Agent Card produces:**

```json
// /.well-known/agent.json
{
  "name": "Danni",
  "description": "Autonomous brand strategist powered by swarm intelligence",
  "url": "https://danni.subfrac.cloud",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false
  },
  "skills": [
    {
      "id": "brand-analysis",
      "name": "Strategic Brand Analysis",
      "description": "Premium brand strategy from 5 parallel AI analysts",
      "inputModes": ["text/plain"],
      "outputModes": ["text/plain", "application/json"]
    }
  ],
  "authentication": {
    "schemes": ["x402"]
  },
  "pricing": {
    "brand-analysis": { "amount": "$100", "network": "eip155:84532", "asset": "USDC" }
  }
}
```

**Consumed by:** External agents, hackathon judges testing interop
