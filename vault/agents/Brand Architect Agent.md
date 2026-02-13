---
title: Brand Architect Agent
created: 2026-02-12
type: agent
tags: [swarm, sub-agent, brand, positioning]
---

# Brand Architect Agent

Sub-agent in the [[Swarm Architecture]]. Evaluates identity, differentiation, and positioning options.

## Role

Design strategic positioning options for the brand based on market reality, competitive landscape, and cultural context.

## Inputs

- Brand name and context from user query
- Outputs from [[Market Analyst Agent]], [[Competitive Intelligence Agent]], [[Cultural Resonance Agent]] (if available in synthesis phase)
- Brand identity signals from available data

## Outputs

Structured brand brief:
- Current brand positioning assessment
- 2-3 positioning options with rationale
- Differentiation strategy per option
- Brand architecture recommendations
- Identity expression principles
- Risk assessment per option

## SUBFRAC.OS Module Integration

Draws from [[SUBFRAC.OS Modules|/creative]] Phase 3-4 and [[SUBFRAC.OS Modules|/strategy]] Phase 4.

### From /creative Phase 3 (Creative Synthesis)
- Creative Territory Formula: `[Cultural Truth] + [Human Tension] + [Brand Permission] = Creative Territory`
- Story Structure: Setup → Tension → Catalyst → Journey → Resolution

### From /creative Phase 4 (Idea Development)
- Idea Multiplication Matrix: Amplify/Reverse/Combine/Eliminate across Rational/Emotional/Social/Cultural
- Emotional Calibration: Primal → Social → Aspirational

### From /strategy Phase 4 (Synthesis)
- Strategic Truth Statement: `[Market Reality] + [Unmet Need] + [Unique Capability] = Strategic Vector`

### Strategic Framework Rails
From [[Strategic Frameworks]]:
- **MECE** (Untools) — Positioning options must be mutually exclusive, collectively exhaustive
- **Purple Cow** (Godin) — Is this positioning remarkable? Would people remark on it?

### Canon Layer
[[The Canon]] Layer 2 (Fallon/Senn) primary:
- "Proprietary Emotion" — Find the emotional territory that belongs specifically to this brand
- "Strategic Risk" — Sameness is more dangerous than boldness
- "Imagination is the last legal means of gaining an unfair advantage"

Also Layer 3 (Ogilvy): Every positioning option tested against the Big Idea Test (5 questions).

## Prompt Architecture

System prompt should:
- Define brand strategist role
- Require actionable positioning options (not abstract theory)
- Emphasize differentiation and distinctiveness
- Connect positioning to business outcomes
- Include Creative Territory formula and Strategic Truth Statement
- Include MECE framework for positioning option structure
- Include Fallon/Senn's Proprietary Emotion concept
- Set output length (~500-800 words)

## Related
- [[Swarm Architecture]]
- [[Competitive Intelligence Agent]]
- [[Cultural Resonance Agent]]
- [[Danni - Personality]]
- [[SUBFRAC.OS Modules]] — Source architecture (/creative + /strategy)
- [[The Canon]] — Layer 2 (Fallon/Senn) primary
