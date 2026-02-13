---
title: Recursive Extraction Guide
created: 2026-02-12
type: meta
tags: [meta, extraction, context-engineering]
---

# Recursive Extraction Guide

Instructions for a fresh context window to extract maximum meaning from the Session 01 transcript and enrich the vault.

## How to Read This Vault

1. **Start with INDEX.md** - Get the full map
2. **Read architecture/ notes** - Understand what we're building
3. **Read hackathon/ notes** - Understand constraints and strategy
4. **Read core-concepts/** - Understand the technology
5. **Read this guide** - Understand what's MISSING and needs extraction

## What the Vault Already Captures (Layer 1)

Declarative facts: technology specs, architecture decisions, team structure, pricing, timeline. 30 interconnected notes with wikilinks. This is solid.

## What Needs Extraction from the Transcript

### Layer 2: Decision Rationale

Mine the transcript for WHY decisions were made. Create or update vault notes with rationale sections.

| Decision | Vault Says | Transcript Contains |
|---|---|---|
| SvelteKit over Next.js | "First x402 SvelteKit integration" | Full cost-benefit analysis: adapter is ~200 lines, Hono pattern maps directly, immutable Response model, `sequence()` for middleware, differentiator story |
| $100 pricing | "$100 per strategic brief" | The reasoning: Opus 4.6 is expensive ($0.15-0.20/call), 5 agents = $3-5, data = $13, margin = 82%, McKinsey charges $5K-50K, premium positioning differentiates from $0.001 demos |
| Dual-chain | "Base Sepolia + SKALE" | SKALE is the HOST, Kobaru facilitator already supports SKALE, same code different config, privacy narrative via BITE, gasless for Data Broker micropayments |
| Swarm over single agent | "5 sub-agents" | Justifies the $100 price, produces genuinely better output, shows AI Readiness for judges, differentiates from single-LLM wrappers |
| A2A + MCP (both) | "Hit all tracks" | "Even if it doesn't win the hackathon it's still incredible value for the business" - Dom sees this as production infrastructure, not just a demo |

### Layer 3: Rejected Alternatives

Extract these from the transcript and create a Decision Log note:

- Next.js - rejected because SvelteKit adapter is a differentiator
- Express API + React - rejected for too much setup time
- $0.001 micropayments - rejected because everyone else will do it
- Single chain (Base only) - reconsidered when SKALE facilitator support was discovered
- Mock data only - upgraded to Apify real data for demo credibility
- API-only (no CLI provider) - CLI provider added when API budget was flagged as blocker

### Layer 4: User Profile (Dom)

Extract these behavioral signals from the conversation:

- **Delegation comfort**: Very high. "I need to be confident that I can orchestrate you orchestrating my swarms"
- **Communication style**: Conversational, uses slang ("dopeness", "gucci"), prefers dialogue over forms (rejected AskUserQuestion twice)
- **Risk appetite**: High. "I'm prepared to push this far", "prepared to throw a significant amount of compute"
- **Technical depth**: Strategic, not implementation-level. "Never got my hands dirty. Not really looking to get my hands dirty either."
- **Decision speed**: Fast when aligned, wants to talk it through first
- **Priority**: Comprehensive > minimal. Wants to "demonstrate a comprehensive product"
- **Business lens**: Everything connects back to SUBFRACTURE business value, not just hackathon
- **Tools mentioned**: Claude Code teams, Sisyphus (autonomous loop), Oh My Open Code, OBS, Remotion
- **Sleep strategy**: Willing to run Sisyphus overnight for grinding tasks

### Layer 5: Structural Relationships

Create a relationships note mapping connection TYPES:

```
x402 ──depends──> Facilitator ──supports──> Base Sepolia
                                └──supports──> SKALE (via Kobaru)

Danni ──sells via──> x402
Danni ──buys via──> x402 ──from──> Data Broker ──wraps──> Apify

A2A ──discovers──> Danni
MCP ──discovers──> Danni (tools)
ERC-8004 ──trusts──> Danni (reputation)
x402 ──pays──> Danni

Swarm ──requires──> LLM Provider
LLM Provider ──switches between──> CLI (dev) / API (prod)

Frontend ──consumes──> API ──protected by──> x402 Adapter
x402 Adapter ──implements──> HTTPAdapter ──defined by──> @x402/core
```

### Layer 6: Cross-Cutting Concerns

Create notes for these gaps:

**Environment Variables** - Not documented anywhere. What env vars does each component need?
- `EVM_PRIVATE_KEY` - Danni's buyer wallet
- `EVM_PAYEE_ADDRESS` - Danni's seller address
- `FACILITATOR_URL` - Which facilitator to use
- `APIFY_API_KEY` - Data broker access
- `ANTHROPIC_API_KEY` - For API provider mode
- `USE_CLI` - Toggle LLM provider
- `SKALE_FACILITATOR_URL` - Secondary chain facilitator

**Error Handling Strategy** - What happens when:
- Facilitator is down?
- Apify actor times out?
- LLM returns garbage?
- User's wallet has insufficient funds?
- SKALE chain is unreachable?

**Caching Strategy** - For demo reliability:
- Cache Apify responses
- Cache successful LLM outputs for demo replay
- Fallback data for each Data Broker endpoint

**Deployment** - Not decided:
- Vercel? adapter-node? Hostinger VPS?
- HTTPS required for x402
- Domain name?

## Notes to Create

The extraction pass should produce these new vault notes:

1. **vault/meta/Decision Log.md** - Every decision + rationale + rejected alternatives
2. **vault/meta/Open Questions.md** - Unresolved items
3. **vault/meta/User Context.md** - Dom's working style and preferences
4. **vault/architecture/Relationship Map.md** - Structural connections between components
5. **vault/architecture/Environment Variables.md** - Complete env var reference
6. **vault/architecture/Error Handling Strategy.md** - Failure modes and mitigations
7. **vault/architecture/Caching Strategy.md** - Demo reliability patterns
8. **vault/architecture/Deployment.md** - Hosting decisions and requirements
9. **vault/hackathon/Build Sequence.md** - Temporal ordering with checkpoints
10. **vault/architecture/Interface Contracts.md** - Exact API boundaries between teams

## Extraction Method

For the JSONL transcript:

```bash
# Extract only assistant messages (the analysis and decisions)
grep '"role":"assistant"' session-01-education-and-planning.jsonl

# Extract user messages (Dom's preferences and reactions)
grep '"role":"user"' session-01-education-and-planning.jsonl

# Search for specific topics
grep -i 'pricing\|price\|\$100' session-01-education-and-planning.jsonl
grep -i 'rejected\|instead\|rather\|over\|chose' session-01-education-and-planning.jsonl
grep -i 'risk\|worry\|concern\|blocker' session-01-education-and-planning.jsonl
```

## Priority Order

1. Decision Log (prevents re-litigating)
2. Open Questions (unblocks planning)
3. Interface Contracts (unblocks parallel teams)
4. Build Sequence (unblocks execution)
5. Everything else (enriches but doesn't block)
