---
title: Cultural Resonance Agent
created: 2026-02-12
type: agent
tags: [swarm, sub-agent, culture, psychology]
---

# Cultural Resonance Agent

Sub-agent in the [[Swarm Architecture]]. Analyzes cultural currents and audience psychology.

## Role

Understand the cultural context surrounding the brand. Map emotional drivers, narrative fit, and cultural timing.

## Inputs

- Brand name and context from user query
- Social sentiment data from [[Data Broker]] (`/api/data/social`)
- Cultural context from LLM's training data

## Outputs

Structured cultural brief:
- Cultural currents relevant to the brand
- Audience emotional drivers and motivations
- Narrative archetypes that resonate
- Cultural timing (is this the right moment?)
- Tension points (where brand meets culture friction)
- Authenticity assessment

## SUBFRAC.OS Module Integration

Draws heavily from [[SUBFRAC.OS Modules|/creative]] — this is the most IP-dense sub-agent.

### From /creative Phase 1 (Cultural Context Mapping)
- Cultural Radar: weak signals → mainstream patterns
- Narrative Velocity: story spread rate analysis
- Emotional Currency: what feelings are tradeable
- Attention Economy: where focus flows

### From /creative Phase 2 (Insight Excavation)
- "What are people doing that they can't explain?"
- "What's the story archetype at play?"
- "What subculture is going mainstream?"
- "What taboo is becoming acceptable?"
- "What luxury is becoming necessity?"

### From /creative Phase 5 (Creative Validation)
- Cultural Relevance Scoring (0-10): zeitgeist alignment, narrative uniqueness, emotional authenticity, behavioral truth, social currency value

### Hidden Capabilities
- **Narrative Physics Engine**: Story velocity, emotional gravity, attention friction, memory adhesion
- **Creative Courage Calculator**: Distance from category norms, cultural readiness, optimal provocativeness

### Strategic Framework Rails
From [[Strategic Frameworks]]:
- **First principles** (Untools) — Strip cultural assumptions to bare truths, rebuild
- **Permission Marketing** (Godin) — Does the brand have permission to occupy this cultural space?

### Canon Layer
Primarily [[The Canon]] Layer 1 (Douglas Holt): Cultural contradictions, identity myths, myth markets. "Brands become icons when they perform identity myths that address cultural anxieties."

## Prompt Architecture

System prompt should:
- Define cultural strategist role (part anthropologist, part psychologist)
- Use more metaphorical and emotional language
- Require both analytical and intuitive insights
- Connect brand positioning to deeper human truths
- Include /creative Phase 1-2 cultural radar and excavation protocols
- Include Cultural Relevance Scoring criteria
- Include Holt's myth market analysis framework
- Set output length (~500-800 words)

This is the most "Danni-like" sub-agent in voice — it channels her philosophical depth and the deepest layer of [[Intellectual Property|SUBFRACTURE IP]].

## Related
- [[Swarm Architecture]]
- [[Data Broker]]
- [[Danni - Personality]]
- [[Brand Architect Agent]]
- [[SUBFRAC.OS Modules]] — Source architecture (/creative module)
- [[The Canon]] — Layer 1 (Holt) primary reference
