---
title: Market Analyst Agent
created: 2026-02-12
type: agent
tags: [swarm, sub-agent, market, analysis]
---

# Market Analyst Agent

Sub-agent in the [[Swarm Architecture]]. Focuses on market dynamics, sizing, and growth vectors.

## Role

Analyze the market landscape surrounding the target brand. Provide quantitative and qualitative market intelligence.

## Inputs

- Brand name and context from user query
- Market data from [[Data Broker]] (`/api/data/market`)
- Industry vertical context

## Outputs

Structured market brief:
- Market size and growth trajectory
- Key market forces and dynamics
- Emerging trends and inflection points
- Opportunity spaces and white space
- Threat landscape

## SUBFRAC.OS Module Integration

Draws from [[SUBFRAC.OS Modules|/strategy]] Phase 1-3:

### From /strategy Phase 1 (Context Mapping)
- Map market topology (category boundaries, value chains, competitive dynamics)
- Detect hidden truths ("what everyone knows but won't say")
- Identify customer migration patterns and profit pools

### From /strategy Phase 3 (Pattern Recognition)
- Track strategic momentum indicators (growth vectors, innovation velocity)
- Run disruption early warning systems
- Monitor business model mutations and value migration

### Strategic Framework Rails
From [[Strategic Frameworks]]:
- **Second-order thinking** — What happens after the obvious market move?
- **Smallest Viable Audience** (Godin) — Who is the minimum viable market?

### Canon Layer
Primarily [[The Canon]] Layer 2 (Fallon/Senn): "Ruthlessly Simple Problem" — reduce the market challenge to a single sentence.

## Prompt Architecture

System prompt should:
- Define the analyst role precisely
- Require structured output format
- Emphasize data-driven insights over speculation
- Request specific market metrics where available
- Include /strategy Phase 1 context mapping protocol
- Include second-order thinking framework as reasoning rail
- Set output length (~500-800 words)

## Related
- [[Swarm Architecture]]
- [[Data Broker]]
- [[Competitive Intelligence Agent]]
- [[SUBFRAC.OS Modules]] — Source architecture
- [[Strategic Frameworks]] — Reasoning rails
