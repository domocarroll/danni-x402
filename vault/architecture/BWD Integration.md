---
title: BWD Integration
created: 2026-02-12
type: architecture
tags: [architecture, bwd, mud, glass-box, semantic-web]
---

# BWD Integration — MUD + Glass Box

## The Concept

The glass-box UI is a text adventure. The client moves through BWD's Seven Chambers like a MUD — typing commands, talking to Guardian NPCs, progressing through rooms. Meanwhile the glass box reveals everything happening behind the scenes: swarm agents firing, data being purchased via x402, the semantic web growing in real-time, payments settling on-chain.

**Left side**: MUD text interface. Client talks to Guardians.
**Right side**: Glass box. Swarm activity, semantic graph, payment flows.

## The Flow

1. Client pays $100 via x402
2. MUD activates. Danni (The Weaver) welcomes them
3. Client moves through chambers — each chamber is a room
4. Each Guardian asks questions conversationally
5. Behind each Guardian, swarm agents run with framework rails
6. Data Broker endpoints fire during transitions (x402 sub-payments)
7. Semantic web nodes appear in the glass box as insights emerge
8. Chamber of Union: Danni synthesizes via Vesica Pisces
9. Brand World Document generated from the semantic graph
10. All payment receipts visible on-chain

## Chamber → Room Mapping

| Room | Guardian (NPC) | Swarm Engine (Hidden) | Data Acquired |
|---|---|---|---|
| Chamber of Mind | Maya (Visionary) | — | — |
| Chamber of Mirrors | Kai (Architect) | Brand Architect | Competitive data ($5) |
| Chamber of Resonance | Rio (Resonant) | Cultural Resonance | Social sentiment ($5) |
| Chamber of Poles | Alex (Navigator) | Market Analyst + Competitive Intel | Market trends ($3) |
| Chamber of Rhythm | Zara (Bard) | Cultural Resonance + Brand Architect | — |
| Chamber of Chains | Sam (Skeptic) | All agents (validation) | — |
| Chamber of Union | Danni (Weaver) | Synthesis (Vesica Pisces) | Full graph |

## Why This Wins the Hackathon

- **Commerce Realism**: $100 journey with visible sub-payments for data
- **AI Readiness**: Swarm intelligence visible in real-time, not hidden
- **UX Innovation**: Nobody else is building a MUD for brand strategy
- **Technical Depth**: x402 adapter + semantic web + swarm + glass box
- **Demo Impact**: Judges play the game. They SEE the intelligence working

## Journey Tiers (x402 Pricing)

| Tier | Price | Chambers | Swarm Depth |
|---|---|---|---|
| Brand Pulse | $100 | Mirrors → Poles → Chains → Union | Surface (5 agents) |
| Strategic Analysis | $1,000 | All 7 | Deep (5 agents + sub-swarms) |
| Brand World | $50,000 | All 7, multiple passes | Fractal recursive |

Hackathon demo: $100 tier (Quick Journey as MUD).

## Open Question: Tone Calibration

The BWD system was designed for human-facing brand workshops — Hermetic Principles, Guardian characters, chamber mysticism. It's unclear whether this narrative layer helps or hurts in an autonomous agent commerce hackathon context. The core value is the strategic frameworks, swarm architecture, and semantic web — not the mystical wrapper.

**Decision needed**: How much BWD flavour (if any) serves the hackathon demo? Discuss in x402-hackathon project context window with full depth on sponsor alignment, judging criteria, and technical narrative.

Options range from:
- **None**: Pure swarm + semantic web, no BWD narrative
- **Light**: Danni's personality + strategic frameworks, drop chambers/guardians/hermetics
- **Full**: MUD experience with chambers and guardians

## Related

- [[Strategic Frameworks]] — Rails for swarm agents
- [[Swarm Architecture]] — The engine behind the Guardians
- [[SUBFRAC.OS Modules]] — /strategy, /creative, /synthesize, /validate
- [[Value-Based Pricing Thesis]] — Why $100 for a text adventure makes sense
- [[Product Vision]] — Overall product direction
