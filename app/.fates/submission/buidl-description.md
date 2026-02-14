# Danni — Autonomous Brand Strategist

**Tagline:** Five AI analysts. One strategic brief. $100 USDC settled on-chain via x402.

---

## Description

Danni is a production-deployed autonomous brand strategist that delivers agency-grade strategic briefs through swarm intelligence, paid for with USDC via the x402 payment protocol. A client submits a brand brief; five specialist AI agents — Market Analyst, Competitive Intelligence, Cultural Resonance, Brand Architect, and Danni Synthesis — execute in parallel, and the synthesis agent produces a unified strategic document a creative director could build a campaign from. The entire process is settled on-chain for $100 USDC on Base Sepolia.

This is not a demo. Danni is live at [danni.subfrac.cloud](https://danni.subfrac.cloud), backed by 350 tests across 13 suites, and implements the full agentic commerce stack end-to-end: **x402 → A2A → MCP → AP2 → ERC-8004**. No other hackathon entry demonstrates all five protocol layers working together in a single application.

### The Full Agentic Commerce Stack

**x402 Payment Protocol** gates every endpoint. We built the first-ever SvelteKit x402 adapter — a custom `SvelteKitAdapter` class that implements the `HTTPAdapter` interface from `@x402/core`, bridging SvelteKit's `RequestEvent` to x402's server-side verification. On the client, `@x402/fetch` wraps the browser's fetch with automatic 402 challenge detection: when the server returns HTTP 402 with payment requirements, the client signs an EIP-3009 USDC authorization and retries transparently. Settlement happens on-chain via the x402.org facilitator.

**A2A (Agent-to-Agent)** exposes Danni as a discoverable agent. A full Agent Card at `/.well-known/agent.json` declares skills, pricing, supported protocols, and extension capabilities. The JSON-RPC handler at `/api/a2a` implements PascalCase methods (`SendMessage`, `GetTask`, `CancelTask`) with a proper response envelope. The card declares AP2 and ERC-8004 as extensions, so consuming agents know Danni supports agentic payments and on-chain identity verification before the first message is sent.

**MCP (Model Context Protocol)** exposes three tools — `brand_analysis` ($100), `competitive_scan` ($5), `market_pulse` ($5) — with x402 payment gating via the `_meta` field. When a tool call arrives without payment, the server returns `isError: true` with embedded x402 payment requirements. When payment is included, the tool executes and the response includes a settlement receipt. This is how AI agents pay other AI agents for premium services.

**AP2 (Agentic Payments Protocol v0.2)** handles the multi-step payment lifecycle inside A2A conversations. An `IntentMandate` expresses what the client wants. Danni responds with a `CartMandate` containing itemized pricing and embedded x402 `PaymentRequirements` for Base Sepolia and SKALE Europa (dual-chain). The client signs and returns a `PaymentMandate`. After on-chain settlement, a `PaymentReceipt` with transaction hash, network, and timestamp is attached to the completed task artifacts. This is the first TypeScript implementation of AP2 v0.2.

**ERC-8004** provides on-chain identity and reputation. The Identity Registry (`0x8004A818...`) and Reputation Registry (`0x8004B663...`) are deployed on Base Sepolia. After every successful payment, Danni submits positive reputation feedback via `giveFeedback()` with the payment tag. An `agent-registration.json` at `/.well-known/` links the web-discoverable agent to its on-chain identity. Registration is pending wallet funding for gas.

### Technical Differentiators

The SvelteKit x402 adapter is a novel contribution to the x402 ecosystem — the protocol's reference implementations cover Express and Next.js, but nothing existed for SvelteKit. Our `SvelteKitAdapter` maps `RequestEvent` methods (`getHeader`, `getPath`, `getBody`, etc.) to the `HTTPAdapter` interface, and the `createPaymentHook` function integrates as standard SvelteKit server middleware in `hooks.server.ts`.

The AP2 implementation is the first in TypeScript. The spec's reference is Python-based. We built full Zod schemas for every mandate type (`IntentMandateSchema`, `CartMandateSchema`, `PaymentMandateSchema`, `PaymentReceiptSchema`) providing runtime validation at every protocol boundary.

### The Business Model

Danni prices at $100 for a full strategic brief — intent-to-value pricing, not micropayments. A brand strategy that a junior strategist would spend a week producing, delivered in minutes with transparent methodology. The $5 data endpoints (`competitive_scan`, `market_pulse`) serve agents that need targeted intelligence without the full analysis. This is agentic commerce priced like professional services, not API calls.

### The Canon

Danni's strategic intelligence isn't generic LLM output. Each agent's system prompt encodes specific frameworks from three canonical advertising texts:

- **Ogilvy** (*Confessions of an Advertising Man*) — Research-first methodology. The Big Idea test. Facts sell.
- **Fallon/Senn** (*Juicing the Orange*) — Ruthlessly Simple Problem. Proprietary Emotion. The Dip assessment.
- **Holt** (*How Brands Become Icons*) — Cultural contradictions. Identity myths. Cultural branding over mindshare.

The synthesis agent performs a "Vesica Pisces" intersection — Holt surfaces the cultural tension, Fallon identifies brand ownership, Ogilvy provides proof. The productive friction between these frameworks is the point.

### Glass-Box Transparency

Every agent activation, every data purchase, every payment settlement is visible in the UI. The `SwarmViz` component renders a real-time agent grid with pulsing status indicators, live output previews, and source counts. Clients see exactly which agents are working, what they're finding, and what they paid. No black boxes.

### How It Was Built

Danni was built using the Fates meta-cognitive architecture — three oversight agents (Clotho, Lachesis, Atropos) orchestrated parallel AI builders through tmux sessions. Phases 3, 4, and 5 (data broker, frontend, agent interop) were built simultaneously by independent Claude Opus 4.6 instances: 25 files, zero type errors, zero file conflicts, 12 minutes of wall-clock time. Build provenance is preserved in `.fates/` — every decision has a causal thread linking it to its origin.

---

## Track Submissions

### x402 Payment Protocol

Danni includes the first SvelteKit adapter for x402. The `SvelteKitAdapter` class implements `HTTPAdapter` from `@x402/core`, mapping SvelteKit's `RequestEvent` to the protocol's server interface. The `createPaymentHook` function integrates as standard middleware in `hooks.server.ts`, enforcing x402 payments on configured routes with `ExactEvmScheme` for Base Sepolia USDC. On the client side, `@x402/fetch`'s `wrapFetchWithPayment` automatically detects 402 responses, signs EIP-3009 authorizations via the connected wallet, and retries — making payment invisible to the user experience.

### AP2 Agentic Payments

This is the first TypeScript implementation of AP2 v0.2. The full mandate lifecycle — `IntentMandate` → `CartMandate` → `PaymentMandate` → `PaymentReceipt` — runs inside A2A conversations with contextId-based task resumption. Cart mandates embed x402 `PaymentRequirements` for dual-chain settlement (Base Sepolia + SKALE Europa). Every mandate type has a Zod schema for runtime validation. Payment status is tracked via `x402.payment.*` metadata keys through the conversation history.

### A2A Agent Interop

Danni serves a complete Agent Card at `/.well-known/agent.json` declaring skills, pricing, input schemas, and protocol extensions. The JSON-RPC handler at `/api/a2a` implements PascalCase methods (`SendMessage`, `GetTask`, `CancelTask`) with proper response envelopes (`{ jsonrpc: '2.0', id, result: { task } }`). The card declares AP2 v0.2 and ERC-8004 as extensions, enabling consuming agents to discover payment capabilities and on-chain identity before initiating communication.

### MCP Tool Server

Three tools are exposed via MCP's `tools/list` and `tools/call` methods: `brand_analysis` ($100 USDC, full 5-agent swarm), `competitive_scan` ($5 USDC, competitor landscape), and `market_pulse` ($5 USDC, industry dynamics). Payment gating uses the `_meta` field — unpaid calls return `isError: true` with x402 payment requirements; paid calls return results plus a settlement receipt. Tool annotations declare x402 pricing, network, and facilitator metadata for agent-readable discovery.

### ERC-8004 Identity

Identity Registry (`0x8004A818BFB912233c491871b3d84c89A494BD9e`) and Reputation Registry (`0x8004B663056A597Dffe9eCcC1965A193B7388713`) contracts are deployed on Base Sepolia. The `agent-registration.json` at `/.well-known/` follows the registration-v1 schema linking Danni's web identity to on-chain contracts. After every successful payment, `submitPaymentFeedback` calls `giveFeedback()` on the Reputation Registry with a +1 rating and payment tag. On-chain registration is pending wallet funding for gas.

### Best Overall / Innovation

Danni demonstrates that agentic commerce can be premium, transparent, and protocol-compliant simultaneously. The glass-box swarm UI shows every agent, every payment, every insight in real-time — clients see what they're paying for. The Canon (Ogilvy + Fallon + Holt) encodes real strategic frameworks into agent prompts rather than relying on generic LLM reasoning. The $100 price point proves that x402 works for intent-to-value professional services, not just micropayments. And the full five-layer protocol stack (x402 → A2A → MCP → AP2 → ERC-8004) is, as far as we can tell, unique among entries.

---

## Links

- **GitHub**: [https://github.com/domocarroll/danni-x402](https://github.com/domocarroll/danni-x402)
- **Live**: [https://danni.subfrac.cloud](https://danni.subfrac.cloud)
- **Demo video**: [PLACEHOLDER — Dom recording]
