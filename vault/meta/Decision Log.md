---
title: Decision Log
created: 2026-02-12
type: meta
tags: [meta, decisions, rationale]
---

# Decision Log

Every architectural decision, why it was made, and what was rejected.

## D01: SvelteKit over Next.js

**Decision:** Use SvelteKit with a custom x402 adapter
**Rationale:**
- x402 SDK uses an `HTTPAdapter` interface pattern - framework adapters are ~200 lines of glue code
- SvelteKit uses Web-standard `Request`/`Response` (immutable), same as Hono - the simplest adapter target
- No Express-style response buffering gymnastics needed
- Being the first x402 SvelteKit integration is a differentiator, not a liability
- Dom's preferred framework
**Rejected:** Next.js (has `@x402/next` out of the box but no differentiation), Express+React (too much setup time)
**Cost:** ~2-3 hours to write adapter. Model on `@x402/hono` adapter in `/tmp/x402-research/typescript/packages/http/hono/src/`

## D02: $100 Premium Pricing

**Decision:** Charge $100 per strategic brief
**Rationale:**
- Opus 4.6 costs ~$0.15-0.20 per call, 5 swarm agents = $3-5 in API costs
- Data acquisition via Apify = ~$5-10
- Total cost ~$13-15, margin ~85%
- Premium pricing differentiates from every other hackathon demo doing $0.001 micropayments
- Signals real business economics, not a toy
- McKinsey charges $5K-50K for comparable strategic analysis
- Dom's instinct: "I was thinking $50 or $100"
**Rejected:** $0.50-$1.50 (commodity pricing, no story), tiered pricing (complexity for hackathon)

## D03: Dual-Chain (Base Sepolia + SKALE)

**Decision:** Support both Base Sepolia and SKALE Europa
**Rationale:**
- SKALE is the hackathon HOST - not integrating their chain is leaving track prizes on the table
- Kobaru facilitator already supports SKALE + SKALE Sepolia
- Same x402 code, different network config - minimal additional effort
- SKALE adds privacy narrative via BITE (encrypted transactions until finality)
- SKALE adds gasless narrative (zero fees for micropayments in Data Broker layer)
**Rejected:** Base-only (missed SKALE track), SKALE-only (less x402 ecosystem support)
**Key Detail:** SKALE Europa Chain ID `1444673419`, USDC at `0xD1A64e20e93E088979631061CACa74E08B3c0f55`

## D04: Swarm Intelligence (5 Sub-Agents)

**Decision:** Dispatch 5 parallel Opus-tier agents for each strategic brief
**Rationale:**
- Justifies the $100 price tag (visible work happening)
- Produces genuinely better output than a single pass
- Shows "AI Readiness" for judges - not just a wrapper
- Glass-box UI makes the swarm visible: Market Analyst, Competitive Intel, Cultural Resonance, Brand Architect, Danni (Synthesis)
- Differentiates from single-LLM chatbot entries
**Rejected:** Single agent with long prompt (no visual story, worse output)

## D05: A2A + MCP (Both)

**Decision:** Implement both Google A2A Agent Card + Anthropic MCP Server
**Rationale:**
- Dom: "even if it doesn't win us the hackathon it's still incredible value for the business"
- A2A hits Google track (A2A/AP2), MCP hits AI/Agents tracks
- A2A Agent Card is just a JSON manifest (~2 hours)
- MCP uses existing `@x402/mcp` package (~3-4 hours)
- Parallel teams make both achievable
- Production infrastructure, not just hackathon demo
**Rejected:** Pick one (left track prizes on the table)

## D06: Apify for Real Data

**Decision:** Wrap Apify actors behind x402-paywalled Data Broker endpoints
**Rationale:**
- Real data > mock data for demo credibility
- Shows three-layer commerce: Human->Agent, Agent->Service, Service->External
- Apify free tier = 30 actor runs/month, plenty for hackathon
- Data Broker endpoints are independently useful (mini marketplace)
**Rejected:** Mock data only (judges would see through it)

## D07: LLM Provider Abstraction

**Decision:** Interface-based switching between `claude -p` (CLI) and Claude API
**Rationale:**
- Dom needs API budget approval before committing to API costs
- `claude -p` uses existing Claude Code subscription, no additional cost
- Same orchestration code, swap with one env var
- Dev on CLI, demo on API
**Rejected:** API-only (budget blocker), CLI-only (too slow for parallel swarm demo)
