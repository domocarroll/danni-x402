---
title: MCP Integration
created: 2026-02-12
type: integration
tags: [mcp, anthropic, tools, agent]
---

# MCP Integration (Model Context Protocol)

Anthropic's standard for AI agents to discover and use tools. Makes Danni accessible to Claude, Gemini, and any MCP-compatible client.

## What MCP Does

MCP is a menu for agents. Danni publishes her capabilities as MCP tools:

| Tool | Cost | Description |
|---|---|---|
| `brand_analysis` | $100 | Full [[Swarm Architecture|swarm]] strategic brief |
| `quick_pulse` | $25 | Single-agent brand assessment |
| `competitive_scan` | $50 | Competitive landscape analysis |

An AI agent connects to Danni's MCP server, sees the menu, and calls tools. [[x402 Protocol]] handles payment automatically.

## x402 + MCP Flow

The `@x402/mcp` package adapts the [[The Payment Flow|payment flow]] for MCP:

1. Agent calls `callTool("brand_analysis", { brand: "Nike" })` - no payment
2. Danni returns `isError: true` with `PaymentRequired` data
3. Agent creates payment payload using its wallet
4. Agent retries with `PaymentPayload` in `_meta["x402/payment"]`
5. Danni verifies, executes swarm, settles payment
6. Returns strategic brief with `SettleResponse` in `_meta["x402/payment-response"]`

## MCP Server Setup

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createPaymentWrapper, x402ResourceServer } from "@x402/mcp";

const mcpServer = new McpServer({ name: "danni-strategist", version: "1.0.0" });
const paid = createPaymentWrapper(resourceServer, { accepts });

mcpServer.tool("brand_analysis", "Premium strategic analysis ($100)",
  { brand: z.string(), context: z.string().optional() },
  paid(async (args) => ({
    content: [{ type: "text", text: strategicBrief }]
  }))
);
```

## Effort: ~3-4 hours

`@x402/mcp` already exists. We wrap our endpoints in MCP tool format.

## Related
- [[A2A Protocol]]
- [[x402 Protocol]]
- [[Danni Commerce Agent]]
- [[Sponsor Alignment]]
