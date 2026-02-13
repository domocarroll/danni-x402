---
title: Swarm Architecture
created: 2026-02-12
type: architecture
tags: [swarm, agents, orchestration, multi-agent]
---

# Swarm Architecture

The $100 price tag is justified by genuine multi-agent intelligence. Danni dispatches 5 sub-agents working in parallel, each producing deep analysis in their domain.

## The Swarm

| Agent | Role | Focus |
|---|---|---|
| [[Market Analyst Agent]] | Market dynamics | Sizing, trends, growth vectors, market forces |
| [[Competitive Intelligence Agent]] | Competitor mapping | Positioning, strengths, gaps, strategies |
| [[Cultural Resonance Agent]] | Audience psychology | Cultural currents, emotional drivers, narrative fit |
| [[Brand Architect Agent]] | Identity design | Differentiation, positioning options, brand architecture |
| **Danni (Synthesis)** | Strategic integration | Takes all 4 streams + data, produces unified recommendation |

## Execution Flow

```
User query arrives
     │
     ├── Data acquisition (parallel)
     │   ├── [[Data Broker]]: market data ($5)
     │   ├── [[Data Broker]]: competitive intel ($5)
     │   └── [[Data Broker]]: social sentiment ($3)
     │
     ├── Sub-agents process (parallel, after data)
     │   ├── Market Analyst → market brief
     │   ├── Competitive Intel → competitor map
     │   ├── Cultural Resonance → audience insights
     │   └── Brand Architect → positioning options
     │
     └── Danni synthesizes → final strategic brief
```

## Cost Economics

- 5 parallel Opus 4.6 calls: ~$3-5
- Data acquisition via [[Data Broker]]: ~$13
- Total cost per engagement: ~$18
- Revenue per engagement: $100
- **Margin: ~82%**

## LLM Execution

Uses [[LLM Provider Abstraction]]:
- **Development**: `claude -p` (uses existing Claude Code subscription)
- **Production/Demo**: Claude API (per-token billing, full parallelism)

## SUBFRAC.OS Module Architecture

Each sub-agent runs a subset of [[SUBFRAC.OS Modules]]. Danni runs the full stack.

| Agent | Primary Module | Canon Layer |
|---|---|---|
| [[Market Analyst Agent]] | /strategy Phase 1-3 | Fallon/Senn (Execution) |
| [[Competitive Intelligence Agent]] | /strategy Phase 2 | Fallon/Senn (Execution) |
| [[Cultural Resonance Agent]] | /creative Phase 1-2, 5 | Holt (Vision) |
| [[Brand Architect Agent]] | /creative Phase 3-4, /strategy Phase 4 | Fallon/Senn + Ogilvy |
| **Danni (Synthesis)** | /synthesize + /validate | All three layers |

### The Synthesis Pass

This is what makes 5 agents feel like one mind:

1. **Vesica Pisces** (/synthesize) — Danni maps the Strategic Truth Circle (Market Analyst + Competitive Intel findings) against the Creative Insight Circle (Cultural Resonance + Brand Architect findings). Breakthrough lives in the overlap.

2. **Heart Knows** (/validate) — Every recommendation passes the 5-test validation: Mom Test, Dinner Party Test, Money Test, Time Test, Competition Test. Minimum score: 7/10.

3. **Breakthrough Statement** — Final output structured as:
   ```
   We discovered that [STRATEGIC TRUTH]
   Intersects with [CREATIVE INSIGHT]
   To create [BREAKTHROUGH CONCEPT]
   Which allows [BRAND]
   To [TRANSFORMATIVE OUTCOME]
   ```

This is genuine intellectual work — finding tensions between sub-agent findings, resolving contradictions, identifying the strategic through-line. The [[Intellectual Property|SUBFRACTURE IP]] is what makes this irreplaceable.

## Output Quality

The hardest part is making 5 agent outputs feel like one mind, not five outputs stapled together. The SUBFRAC.OS module architecture provides the structure. [[The Canon]]'s productive dialectic provides the tension. Danni's voice provides the coherence.

## Related
- [[Danni Commerce Agent]]
- [[Data Broker]]
- [[LLM Provider Abstraction]]
- [[Pricing Model]]
- [[SUBFRAC.OS Modules]] — Brain architecture
- [[The Canon]] — Three-layer strategic foundation
- [[Strategic Frameworks]] — Reasoning rails per agent
