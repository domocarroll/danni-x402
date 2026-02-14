# Danni — Autonomous Brand Strategist

**Tagline:** Five AI analysts. One strategic brief. $100 USDC settled on-chain via x402.

---

## Description

When you can build anything — when compute is cheap and intelligence is on tap — the bottleneck isn't engineering. It's knowing what to build. Which market to enter. Which position to own. Which cultural tension to exploit. That's strategy, and it's the highest-leverage decision a founder or brand team makes. Get it wrong and everything downstream is wasted motion.

Danni puts that capability on-chain. Five specialist AI agents — Market Analyst, Competitive Intelligence, Cultural Resonance, Brand Architect, and Danni Synthesis — execute in parallel, drawing on encoded frameworks from Ogilvy, Fallon, and Holt to produce a strategic brief a creative director could build a campaign from. The service costs $100 USDC, settled on Base Sepolia via x402. It's live now at [danni.subfrac.cloud](https://danni.subfrac.cloud). Whenever your agents need strategic intelligence, it's there — discoverable, payable, verifiable.

This is the full agentic commerce stack in a single application: **x402 → A2A → MCP → AP2 → ERC-8004**. It ships two firsts — the first SvelteKit x402 adapter and the first TypeScript AP2 v0.2 implementation — backed by 350 tests across 13 suites.

### The Stack

**x402** gates every endpoint. A custom `SvelteKitAdapter` implements `HTTPAdapter` from `@x402/core`, bridging SvelteKit's `RequestEvent` to x402's server-side verification — the first adapter for this framework. On the client, `@x402/fetch` handles the 402 challenge automatically: detect, sign an EIP-3009 USDC authorization, retry. Settlement is on-chain via the x402.org facilitator.

**A2A** makes Danni discoverable. A full Agent Card at `/.well-known/agent.json` declares skills, pricing, and protocol extensions. The JSON-RPC handler implements PascalCase methods (`SendMessage`, `GetTask`, `CancelTask`) with proper response envelopes. Consuming agents know Danni supports agentic payments and on-chain identity before the first message is sent.

**MCP** exposes three tools — `brand_analysis` ($100), `competitive_scan` ($5), `market_pulse` ($5) — with x402 payment gating via `_meta`. Unpaid calls get `isError: true` with payment requirements. Paid calls execute and return a settlement receipt. This is how agents pay agents for premium services.

**AP2 v0.2** handles the multi-step payment lifecycle inside A2A conversations. `IntentMandate` → `CartMandate` (with embedded x402 requirements for Base Sepolia and SKALE Europa) → `PaymentMandate` → `PaymentReceipt`. Context IDs link payment to task resumption. Every mandate type is Zod-validated at the protocol boundary. First TypeScript implementation.

**ERC-8004** provides on-chain identity and reputation. Identity Registry (`0x8004A818...`) and Reputation Registry (`0x8004B663...`) on Base Sepolia. Danni is registered on-chain. After every payment, `giveFeedback()` submits positive reputation with payment tags. The `agent-registration.json` at `/.well-known/` links web discovery to on-chain identity.

### Why Strategy, Why $100

Most x402 demos are micropayments — fractions of a cent for API calls. Danni prices like professional services because that's what it delivers. A junior strategist takes a week to produce what Danni delivers in minutes, using frameworks that took decades to develop. The $100 price point is intentional: it proves x402 works for high-value, intent-to-value commerce, not just token-gating. The $5 data endpoints serve agents that need targeted intelligence without the full analysis.

### The Canon

Danni's output isn't generic LLM prose. Each agent's system prompt encodes specific strategic frameworks:

- **Ogilvy** (*Confessions*) — Research-first. The Big Idea test. Facts sell.
- **Fallon/Senn** (*Juicing the Orange*) — Ruthlessly Simple Problem. Proprietary Emotion.
- **Holt** (*How Brands Become Icons*) — Cultural contradictions. Identity myths.

The synthesis agent performs a "Vesica Pisces" intersection: Holt surfaces the cultural tension, Fallon identifies brand ownership, Ogilvy provides proof. The productive friction between these frameworks is what makes the output worth $100.

### Glass-Box Transparency

Every agent activation, every data purchase, every payment settlement is visible in the UI. `SwarmViz` renders a real-time agent grid — pulsing status indicators, live output previews, source counts. Clients see exactly which agents are working, what they're finding, and what they paid. No black boxes. If you're paying $100 for strategic intelligence, you should see the intelligence being produced.

---

## Track Submissions

### x402 Payment Protocol

The x402 reference implementations cover Express and Next.js. Nothing existed for SvelteKit. Our `SvelteKitAdapter` maps `RequestEvent` to the `HTTPAdapter` interface, and `createPaymentHook` integrates as standard server middleware in `hooks.server.ts` with `ExactEvmScheme`. On the client, `wrapFetchWithPayment` from `@x402/fetch` makes the 402→sign→retry cycle invisible to the UX. This adapter is a reusable contribution to the x402 ecosystem beyond this hackathon.

### AP2 Agentic Payments

The AP2 spec's reference implementation is Python. Ours is the first in TypeScript. The full mandate lifecycle runs inside A2A conversations with `contextId`-based task resumption — a client's `IntentMandate` and subsequent `PaymentMandate` resolve to the same task. Cart mandates embed dual-chain x402 requirements (Base Sepolia + SKALE Europa zero-gas). Every mandate type has a Zod schema. Payment status flows through `x402.payment.*` metadata keys in conversation history.

### A2A Agent Interop

Danni's Agent Card at `/.well-known/agent.json` doesn't just list skills — it declares AP2 and ERC-8004 as protocol extensions, so consuming agents can discover payment capabilities and on-chain identity *before* initiating communication. The JSON-RPC handler supports `SendMessage`, `GetTask`, and `CancelTask` with proper `{ jsonrpc: '2.0', id, result: { task } }` envelopes. The AP2 mandate lifecycle is fully embedded in the A2A conversation flow, not bolted on as a separate endpoint.

### MCP Tool Server

Three tools with x402 payment gating via `_meta` — not custom middleware, but native to the MCP message envelope. Tool `annotations` declare pricing, network, and facilitator as machine-readable metadata, so agent clients can discover costs before calling. The payment flow is symmetric: unpaid → `isError` with requirements; paid → result with settlement receipt. Same backend as A2A, different protocol surface.

### ERC-8004 Identity

Danni is registered on-chain. Identity Registry (`0x8004A818...`) and Reputation Registry (`0x8004B663...`) deployed on Base Sepolia. `agent-registration.json` at `/.well-known/` follows registration-v1 schema. The reputation loop is closed: every successful x402 payment triggers `giveFeedback()` with +1 rating and payment tag. Over time, Danni's on-chain reputation becomes a trust signal that other agents can verify before committing $100 to a transaction.

### Best Overall / Innovation

The thesis: when AI agents can build anything, strategy becomes the scarcest resource. Danni makes strategic intelligence a first-class on-chain service — discoverable via A2A, callable via MCP, payable via x402, trustable via ERC-8004. The Canon encodes real strategic frameworks rather than relying on generic LLM reasoning. The glass-box UI makes the $100 worth visible. And the full five-layer protocol stack is unique among entries.

---

## Links

- **GitHub**: [https://github.com/domocarroll/danni-x402](https://github.com/domocarroll/danni-x402)
- **Live**: [https://danni.subfrac.cloud](https://danni.subfrac.cloud)
- **Demo video**: [PLACEHOLDER — Dom recording]
