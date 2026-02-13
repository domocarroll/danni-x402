---
title: ElevenLabs Voice Integration
created: 2026-02-12
type: integration
tags: [integration, voice, elevenlabs, demo]
---

# ElevenLabs Voice Integration

Danni speaks. Not text-to-speech afterthought - conversational AI voice as the primary interface.

## Why This Matters

Most hackathon entries: text in → text out.
Ours: voice conversation where Danni walks you through a $50,000 strategic brief with the warmth and mystique of her character.

The judges *hear* Danni. That's unforgettable.

## Technical Integration

### SDK Options
- **JavaScript SDK** (`@elevenlabs/client@0.12.2`) - best for SvelteKit (framework-agnostic)
- **React SDK** (`@elevenlabs/react@0.12.3`) - has pre-built components but React-specific
- **CLI** (`@elevenlabs/agents-cli@0.6.1`) - "agents as code" for backend

### Architecture
```
User speaks → ElevenLabs STT → Danni's brain (our API) → Strategic response → ElevenLabs TTS → User hears Danni
```

Or with the Conversational AI agent:
```
ElevenLabs Agent (Danni's voice + personality)
    │
    ├── Uses our x402-paywalled tools via MCP
    ├── RAG knowledge base (SUBFRACTURE methodology)
    └── WebSocket real-time to SvelteKit frontend
```

### Key Capabilities
- Real-time conversational AI (not just TTS)
- WebRTC/WebSocket for low-latency voice
- MCP protocol support (Danni's voice agent calls the same tools)
- RAG knowledge base (feed strategic frameworks, The Canon)
- 5000+ voices, 31 languages
- Custom voice cloning possible

### Voice Selection
Danni needs a voice that embodies:
- Sophisticated intelligence (clear, articulate)
- Warmth (not robotic, not overly casual)
- Subtle mystique (unhurried, confident)
- Professional authority (trusted advisor)

## Integration with x402 Flow

The voice conversation IS the product being sold:
1. Client pays $50,000 via x402
2. Voice session activates
3. Danni speaks: "I've identified something fascinating about your brand..."
4. Swarm runs in background, Danni narrates insights as they emerge
5. Full strategic brief delivered as voice + document

## Claude Skills Resource
Comprehensive ElevenLabs skill at: https://github.com/jezweb/claude-skills/tree/main/skills/elevenlabs-agents
- 29 platform features documented
- 27+ error patterns prevented
- Templates for agent creation
- MCP integration patterns

## Broader Skills Repository
https://github.com/jezweb/claude-skills (97 skills)
Relevant for our build:
- Claude API skill (LLM provider)
- MCP/Tools skills (MCP server)
- Tailwind v4 (frontend)
- Cloudflare Workers (deployment)

## Demo Video Integration
The demo video itself could feature Danni's voice narrating. Not a human voiceover - Danni introduces herself.

## Related
- [[Danni - Personality]] - Voice must match character
- [[Swarm Architecture]] - Voice narrates swarm activity
- [[MCP Integration]] - ElevenLabs agent uses MCP tools
- [[Demo Video Strategy]] - Voice-first demo experience
