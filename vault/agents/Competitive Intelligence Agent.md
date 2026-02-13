---
title: Competitive Intelligence Agent
created: 2026-02-12
type: agent
tags: [swarm, sub-agent, competitive, intelligence]
---

# Competitive Intelligence Agent

Sub-agent in the [[Swarm Architecture]]. Maps the competitive landscape.

## Role

Analyze competitors' positioning, strengths, weaknesses, and strategic patterns. Identify gaps and opportunities.

## Inputs

- Brand name and context from user query
- Competitive data from [[Data Broker]] (`/api/data/competitive`)
- Market context from [[Market Analyst Agent]] (if available)

## Outputs

Structured competitive brief:
- Key competitor identification (top 3-5)
- Positioning map (how each competitor is positioned)
- Strength/weakness analysis per competitor
- Strategic patterns (what competitors are converging on)
- Competitive gaps (underserved positions)
- Vulnerability assessment

## SUBFRAC.OS Module Integration

Draws from [[SUBFRAC.OS Modules|/strategy]] Phase 2:

### From /strategy Phase 2 (Strategic Interrogation)
- Category Truth Mining: "If your category didn't exist, what would customers do?"
- Competitive Blind Spots: "What assumptions is everyone making?"
- Customer Reality Mapping: "What progress are customers trying to make?"

### Hidden Capability: Cognitive Bias Correction
- Filter confirmation bias (don't just find what you expect)
- Adjust for survivorship bias (dead competitors matter too)
- Detect narrative fallacy (competitors' stated strategy vs actual behavior)

### Strategic Framework Rails
From [[Strategic Frameworks]]:
- **Inversion** (Untools) — What would make competitors impossible to beat? Now avoid that.
- **The Dip** (Godin) — Where are competitors quitting? That's where opportunity lives.

### Canon Layer
Primarily [[The Canon]] Layer 2 (Fallon/Senn): "Start from Scratch" — kill inherited assumptions about competitors. What would you see if you'd never analyzed this category before?

## Prompt Architecture

System prompt should:
- Define competitive analyst role
- Require structured comparison format
- Emphasize actionable intelligence over description
- Request positioning relative to the target brand
- Include /strategy Phase 2 interrogation questions
- Include inversion framework as a reasoning rail
- Set output length (~500-800 words)

## Related
- [[Swarm Architecture]]
- [[Data Broker]]
- [[Market Analyst Agent]]
- [[Brand Architect Agent]]
- [[SUBFRAC.OS Modules]] — Source architecture
- [[Strategic Frameworks]] — Reasoning rails
