---
title: Context Bootstrap
created: 2026-02-12
type: meta
tags: [meta, bootstrap, context-engineering]
priority: READ-FIRST
---

# Context Bootstrap

**Read this file first in any new session.** It reconstructs the shared mental model.

## What This Vault Is

A recursive semantic knowledge base for the Danni Commerce Agent - an x402-powered autonomous AI strategist being built for the SF Agentic Commerce x402 Hackathon (deadline: Feb 14 17:59 AEST).

## The One-Paragraph Summary

Danni is SUBFRACTURE's AI strategist, adapted for the agentic economy. She charges $100 per strategic brief via x402 payments, dispatches a swarm of 5 Opus-tier sub-agents, autonomously buys real market data from Apify-powered x402 services, and is discoverable by any agent via A2A (Google) and MCP (Anthropic). Built on SvelteKit with a custom x402 adapter (first of its kind), settling on both Base Sepolia and SKALE. Frontend shows the full payment flow in a glass-box UI.

## Reading Order

### To understand what we're building:
1. [[Product Vision]]
2. [[Danni Commerce Agent]]
3. [[The Payment Flow]]
4. [[Swarm Architecture]]
5. [[Pricing Model]]

### To understand the technology:
1. [[x402 Protocol]]
2. [[SvelteKit x402 Adapter]]
3. [[The Facilitator]]
4. [[SKALE Network]]

### To understand the hackathon:
1. [[Hackathon Strategy]]
2. [[Sponsor Alignment]]
3. [[Team Architecture]]
4. [[Priority Stack]]

### To understand agent interop:
1. [[A2A Protocol]]
2. [[MCP Integration]]
3. [[ERC-8004]]
4. [[AP2 Protocol]]

### To extract more from Session 01:
1. [[transcripts/EXTRACTION-GUIDE]]
2. Transcript: `vault/transcripts/session-01-education-and-planning.jsonl`

## Critical Context Not In The Notes

### Dom's Working Style
- Orchestrator, not implementer. "I need to be confident I can orchestrate you orchestrating my swarms."
- Prefers conversation over structured forms. Rejected AskUserQuestion prompts twice - wants dialogue.
- High delegation comfort. Uses Claude Code teams, Sisyphus autonomous loops, parallel agents aggressively.
- Business-first thinking. Everything connects to SUBFRACTURE value, not just hackathon.
- Premium positioning instinct. Pushed $100 pricing when I suggested $1.50.
- Fast decisions once aligned. Slow deliberation before commitment.

### The Danni Character
Danni Stevens is SUBFRAC.OS's AI strategist. Full personality spec in [[Danni - Personality]]. In this commerce context, her sophistication and warmth justify the premium price. She should feel like the world's best strategic advisor - not a chatbot.

### Key Open Decisions
- Deployment target (Vercel? adapter-node? Hostinger VPS?)
- Domain name
- API budget approval status for Claude API
- Exact Apify actors for each Data Broker endpoint
- ERC-8004 registry deployment on Base Sepolia (needs investigation)

### The x402 Research Repo
Cloned at `/tmp/x402-research/` (may not persist across sessions). Source of truth for adapter implementation patterns, particularly:
- `typescript/packages/http/hono/src/` - Model for our SvelteKit adapter
- `typescript/packages/core/src/http/x402HTTPResourceServer.ts` - The HTTPAdapter interface
- `typescript/packages/mcp/src/` - MCP integration patterns
- `examples/typescript/` - Reference implementations

## Next Actions

When this vault is loaded in a new session, the next step is:
1. Read [[Interface Contracts]] - API boundaries between teams are defined
2. Read [[Build Sequence]] - Temporal ordering with checkpoints is defined
3. Read [[Decision Log]] - All decisions are captured, don't re-litigate
4. **Enter plan mode** - Validate contracts, define file structure, assign teams
5. **Build** - Starting with Phase 0: Alpha team (x402 SvelteKit adapter + core payment flow)

The highest-leverage extraction targets from the transcript have been captured in the bridge notes. Remaining extraction (Layers 3-6 in EXTRACTION-GUIDE) can happen in parallel with building.

## Vault Structure

```
vault/
├── CONTEXT-BOOTSTRAP.md    ← YOU ARE HERE
├── INDEX.md                 (full topic index)
├── core-concepts/    (7)    (x402, payments, blockchain)
├── architecture/     (7)    (what we're building)
├── integrations/     (4)    (A2A, AP2, MCP, ERC-8004)
├── hackathon/        (6)    (strategy, teams, timeline)
├── agents/           (5)    (Danni + 4 sub-agents)
└── transcripts/      (2)    (JSONL + extraction guide)
```
