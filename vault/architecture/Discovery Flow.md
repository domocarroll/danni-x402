---
title: Discovery Flow
created: 2026-02-13
type: architecture
tags: [architecture, flow, discovery, intake, pipeline]
---

# Discovery Flow

The complete pipeline from finding Danni to receiving a strategic brief. One payment. Everything included.

## The Principle

Discovery is not a sales funnel. It is phase one of the product. The client has already committed. Danni gathers business context because she needs it to do the work — and the way she gathers it IS the experience they're paying for.

This is what separates a $100 brief from a generic LLM wrapper. The client isn't paying for tokens. They're paying for Danni to *listen* before she thinks.

## The Pipeline

```
FIND → PRICE → PAY → DISCOVER → EXECUTE → DELIVER → DONE
```

### 1. Find Danni

How agents and humans discover that Danni exists:

| Channel | Mechanism | Who |
|---|---|---|
| [[ERC-8004]] | Identity Registry query | Autonomous agents evaluating trust |
| [[A2A Protocol]] | Agent Card at `/.well-known/agent.json` | A2A-compatible agents (Google ecosystem) |
| [[MCP Integration]] | Tool listing (`brand_analysis`, `quick_pulse`) | MCP-compatible agents (Claude, Gemini) |
| Direct URL | `danni.subfrac.cloud` | Humans, referrals, hackathon judges |

An agent checking [[ERC-8004]] sees Danni's reputation score, x402 support flag, and service endpoints. A human sees the glass-box UI and hears Danni's voice. Both paths converge at the same place: understanding what Danni offers and what it costs.

### 2. See the Price

The 402 response. Three tiers, one architecture:

| Tier | Price | What You Get |
|---|---|---|
| Brand Pulse | $100 | Surface swarm — 5 agents, 1 pass, 4 chambers |
| Strategic Analysis | $1,000 | Deep swarm — 5 agents + sub-swarms, all 7 chambers |
| Enterprise Strategy | $50,000 | Fractal recursion — multiple passes, evolutionary generations, all 7 chambers |

See [[Pricing Model]] for economics and [[Value-Based Pricing Thesis]] for the philosophy.

### 3. Pay

One x402 transaction. Everything downstream is included — discovery conversation, swarm compute, data acquisition, synthesis, delivery. No micro-charges. No upsells. No "that'll cost extra."

The payment settles on [[core-concepts/The Payment Flow|Base Sepolia]] (primary) or [[SKALE Network]] (gasless). The client chose the depth. The rest is Danni's problem.

### 4. Discover (The Intake)

Payment activates the session. This is where Danni does her job.

#### What's Happening

Danni runs [[SUBFRAC.OS Modules|/strategy]] Phase 1 (Context Mapping) and Phase 2 (Interrogation) live with the client. She's building the context architecture that will feed the swarm. Every question she asks has a purpose — she's populating the input nodes of the semantic graph.

#### Two Modalities

**Voice (ElevenLabs Conversational AI)**
Danni speaks. Real-time, low-latency, WebSocket connection. The client talks about their business and Danni listens with the warmth and precision of her [[agents/Danni - Personality|personality]] — asking follow-ups, making unexpected connections, showing she's three steps ahead. The conversation is the interface.

See [[ElevenLabs Voice]] for technical integration.

**MUD (Brand World Design Chambers)**
The client moves through [[BWD Integration|BWD's Seven Chambers]] like a text adventure. Each room has a Guardian NPC who extracts a different layer of business context — vision, competitive landscape, cultural positioning, narrative tension, validation. The glass box shows the semantic web growing in real-time as context nodes populate.

See [[BWD Integration]] for chamber-to-agent mapping.

**Layered Experience**
Voice and MUD can run simultaneously. Danni speaks while the MUD renders the textual journey on screen. The voice provides the emotional warmth. The MUD provides the structural progression. The glass box provides the transparency.

#### What Discovery Extracts

| Context Layer | Questions | Maps To |
|---|---|---|
| Business reality | What do you do? Who do you serve? What's working? | Market Analyst directives |
| Competitive landscape | Who else plays here? What do they get right/wrong? | Competitive Intel directives |
| Cultural positioning | What does your audience care about beyond your category? | Cultural Resonance directives |
| Brand tension | What's the gap between who you are and who you want to be? | Brand Architect directives |
| Ambition | What would wild success look like? What are you afraid of? | Danni Synthesis framing |

Each layer feeds directly into a swarm agent's system prompt. The discovery conversation is literally writing the brief that the swarm will execute against. Nothing is wasted.

### 5. Execute (The Swarm)

Discovery complete. Danni has what she needs. The swarm fires.

Context from discovery flows into agent directives. Each agent gets its assigned [[Strategic Frameworks|thinking frameworks]] as rails. [[architecture/Data Broker|Data Broker]] endpoints fire for real market data (x402 sub-payments, included in the client's price). The glass box shows all of it — agents working, data flowing, the semantic graph densifying.

Depth scales with tier:
```
$100:    depth=1, generations=1   (surface pass)
$1,000:  depth=2, generations=3   (deep pass)
$50,000: depth=N, generations=10+ (fractal, evolutionary)
```

Same architecture. The depth parameter changes. See [[Swarm Architecture]] and [[Pricing Model]].

### 6. Deliver

Danni synthesizes via [[SUBFRAC.OS Modules|/synthesize]] (Vesica Pisces engine) and validates via [[SUBFRAC.OS Modules|/validate]] (Heart Knows protocol).

The deliverable is:
- **The semantic graph** — navigable, auditable, every insight traceable back through reasoning
- **The strategic brief** — a document a creative director could build a campaign from
- **The voice narration** — Danni walks through the key insights, speaking with genuine care about what she found
- **On-chain receipts** — every payment visible, every data acquisition logged

### 7. Done

The relationship lasts exactly as long as the value exchange. No retainer. No QBR. No renewal conversation. If the client wants to go deeper, they come back and pay for the next tier.

## Why This Wins

- **Commerce realism**: One payment, visible sub-payments for data, real economics
- **UX innovation**: Nobody else is building a voice-powered MUD for brand strategy
- **AI readiness**: Swarm intelligence visible in real-time, not hidden behind a loading spinner
- **The discovery phase itself**: Proves Danni isn't a form-to-LLM wrapper. She listens. She thinks. Then she works.

## The Speed Inversion

The old world charged more for speed. Rush fees. Weekend rates. The implicit message: fast means we care less.

Danni inverts this. 30 minutes instead of 12 weeks is not a compromise — it's proof that the bottleneck was never intelligence. It was coordination. Meetings. Alignment. The human overhead of getting smart people in the same room at the same time.

Strip the coordination constraint and what remains is the thinking itself — structured through proprietary frameworks, executed by five parallel minds, synthesized through a methodology no one else owns.

Speed does not discount value. It amplifies it.

## Related

- [[Pricing Model]] — Tier economics and scale-invariant architecture
- [[Value-Based Pricing Thesis]] — The death of seat-based SaaS
- [[BWD Integration]] — MUD chambers and Guardian NPCs
- [[ElevenLabs Voice]] — Conversational AI voice integration
- [[SUBFRAC.OS Modules]] — /strategy P1-P2 power the discovery phase
- [[Swarm Architecture]] — What fires after discovery
- [[ERC-8004]] — How agents evaluate trust before engaging
- [[A2A Protocol]] — Agent-to-agent discovery
- [[MCP Integration]] — Tool-based discovery
- [[Intellectual Property]] — The three-layer moat
- [[The Payment Flow]] — How x402 settlement works
