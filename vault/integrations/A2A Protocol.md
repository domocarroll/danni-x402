---
title: A2A Protocol
created: 2026-02-12
type: integration
tags: [a2a, google, agent-interop, protocol]
---

# A2A Protocol (Agent-to-Agent)

Google's open protocol for agent interoperability. How agents discover and communicate with each other. Under the Linux Foundation.

## What It Does

| Capability | How |
|---|---|
| **Discovery** | Agent Cards (JSON manifests) describe capabilities |
| **Task Management** | Lifecycle states for agent work |
| **Collaboration** | Context and instruction sharing |
| **UX Negotiation** | Adapts to different UI capabilities |

## Built On Standard Tech

- HTTP
- SSE (Server-Sent Events)
- JSON-RPC

No exotic protocols. Fits naturally into our SvelteKit server.

## Agent Card

A JSON manifest at a well-known URL that describes what Danni can do:

```json
{
  "name": "Danni Strategic Advisor",
  "description": "Premium AI brand strategist powered by swarm intelligence",
  "capabilities": ["brand_analysis", "competitive_intelligence", "market_positioning"],
  "pricing": { "brand_analysis": "$100 USDC" },
  "payment": "x402",
  "networks": ["eip155:84532", "eip155:1444673419"]
}
```

Other A2A-compatible agents find this card, see Danni's services and pricing, and initiate a task+payment flow.

## A2A + x402 Extension

Google built an official extension: [a2a-x402](https://github.com/google-agentic-commerce/a2a-x402)

This wires A2A task lifecycle directly to [[x402 Protocol]] payments:
1. Agent discovers Danni via Agent Card
2. Agent creates task via JSON-RPC
3. x402 payment required/settled as part of task lifecycle
4. Danni delivers via A2A task response

Currently Python-only, but the protocol is language-agnostic (HTTP + JSON-RPC).

## How It Differs From MCP

| | A2A | MCP |
|---|---|---|
| **Who** | Google (Linux Foundation) | Anthropic |
| **Purpose** | Agent-to-agent communication | Agent-to-tool discovery |
| **Discovery** | Agent Cards | MCP tool listing |
| **Task model** | Full lifecycle (pending, working, done) | Request/response |
| **Payment** | Via x402 extension | Via @x402/mcp |

Both use x402 as the payment rail. Both make Danni discoverable. Different ecosystems.

## Effort: ~4-6 hours

- Agent Card (JSON): ~2 hours
- Task handler (JSON-RPC endpoint): ~4 hours
- Hits the **Google track** in the [[Hackathon Strategy|hackathon]]

## Related
- [[AP2 Protocol]]
- [[MCP Integration]]
- [[x402 Protocol]]
- [[Sponsor Alignment]]
