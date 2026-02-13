# Sisyphus Night Shift Mission — Danni Commerce Agent
## Deployed: 2026-02-13 ~23:00 AEST | Deadline: 2026-02-14 17:59 AEST (~19h)
## Intensity: 3 (Maximum Autonomous)

---

## THE MISSION

Optimize Danni Commerce Agent across ALL hackathon judging tracks. The semantic web has been built — AP2 types, ERC-8004 contracts, x402 client, A2A compliance all scaffolded. What remains: **wire the last connections, polish the glass, make the demo sing.**

The story for judges: "Danni demonstrates the complete agentic commerce stack — discover, trust, communicate, pay, deliver, rate. No other entry shows the full loop."

---

## JUDGING TRACKS (Priority-Weighted)

### Track 1: x402 Payment Protocol (Coinbase — PRIMARY)
- **Status:** Server middleware COMPLETE. Client-side @x402/fetch WIRED.
- **Gap:** Need AP2 payment metadata flow INSIDE A2A protocol
- **Evidence:** Real USDC settlement on Base Sepolia, not mocked

### Track 2: ERC-8004 Identity + Reputation (Coinbase Tag — DIFFERENTIATOR)
- **Status:** Contracts + ABIs in `src/lib/erc8004/`. Registration + reputation functions built.
- **Gap:** Need to actually CALL register() on Base Sepolia, create `/.well-known/agent-registration.json`
- **Evidence:** On-chain identity NFT, reputation feedback after analysis

### Track 3: A2A Agent-to-Agent (Google — HIGH)
- **Status:** PascalCase methods, response envelope, Agent Card with extensions
- **Gap:** Need x402 payment metadata flow inside A2A task lifecycle (input-required state)
- **Evidence:** Full A2A JSON-RPC compliance, payment within protocol

### Track 4: MCP Tool Integration (AI Tooling)
- **Status:** tools/list and tools/call implemented
- **Gap:** Verify x402 payment metadata in `_meta["x402/payment"]`
- **Evidence:** MCP server callable by any AI framework

### Track 5: Innovation + Demo Quality (General)
- **Status:** Glass-box UI, swarm visualization, pricing tiers
- **Gap:** Visual polish (scroll-to-bottom, markdown, loading states, favicon, OG tags)
- **Evidence:** Professional demo video, polished UX

---

## WORK PRIORITY QUEUE (Execute in order)

### Wave 1: Protocol Wiring (Highest Impact, ~4h)

**Task 1.1: ERC-8004 Identity Registration Script**
- Create `scripts/register-agent.ts` that calls `register("https://danni.subfrac.cloud")`
- Run on Base Sepolia, capture the agentId
- Store agentId in `.env` as `DANNI_AGENT_ID`
- Create route `/.well-known/agent-registration.json` endpoint

**Task 1.2: A2A x402 Payment Metadata Flow**
- When A2A SendMessage hits a paid skill → return task with `status: "input-required"` and `x402.payment.required` in metadata
- Client sends `x402.payment.payload` in metadata on retry
- Server validates payment, processes task, returns `x402.payment.receipts` in result metadata
- Use AP2 types from `src/lib/ap2/types.ts` and flows from `src/lib/ap2/x402-flow.ts`

**Task 1.3: Wire ERC-8004 Reputation into Post-Analysis Flow**
- After successful analysis + payment, call `submitPaymentFeedback()` from erc8004/reputation.ts
- Log the reputation tx hash in response metadata
- This closes the trust→pay→deliver→rate loop

### Wave 2: Protocol Polish (~2h)

**Task 2.1: MCP x402 Transport Compliance**
- In `tools/call` handler, if tool requires payment → return `isError: true` with `_meta["x402/payment"]`
- On payment receipt in `_meta["x402/payment-response"]`, process the call
- Verify against x402 MCP transport spec

**Task 2.2: Agent Registration Endpoint**
- Create `src/routes/.well-known/agent-registration.json/+server.ts`
- Return ERC-8004 compliant registration JSON with agentId, x402Support flag, capabilities

### Wave 3: Visual & Demo Polish (~3h)

**Task 3.1: Chat UX Polish**
- Auto-scroll to bottom on new messages
- Markdown rendering in MessageBubble (use marked or similar)
- Loading skeleton states while swarm runs
- Smooth transitions between payment steps

**Task 3.2: Landing Page & Meta**
- Favicon (Danni brand icon)
- OG meta tags for social sharing
- 404 page
- Loading state for initial page load

**Task 3.3: Graph Page Enhancement**
- Dynamic import for 3d-force-graph (code splitting)
- Ensure graph renders the semantic web of agent insights
- Visual connection between payment, trust, and analysis nodes

### Wave 4: Demo Preparation (~2h)

**Task 4.1: Deployment**
- Verify `bun run build` succeeds
- Set up deployment (Vercel or VPS tunnel)
- Test with real MetaMask on Base Sepolia

**Task 4.2: Demo Flow Script**
- Write demo video script (3-5 min)
- Identify key moments: wallet connect → 402 challenge → payment → swarm activate → synthesis
- Capture screenshots of each state

---

## TECHNICAL REFERENCE

### File Map (What exists)
```
src/lib/ap2/          — AP2 types, x402-flow helpers (CartMandate, PaymentReceipt, etc.)
src/lib/erc8004/      — Contract constants + ABIs, reputation/identity functions
src/lib/x402/         — LOCKED: adapter.ts, middleware.ts. OPEN: client.ts
src/lib/a2a/          — types.ts (error codes, schemas), task-manager.ts
src/lib/mcp/          — tools.ts (tool definitions), handlers.ts (tool execution)
src/lib/swarm/        — orchestrator.ts, tracker.ts, agent prompts
src/lib/stores/       — chat, swarm, payments, wallet (Svelte 5 runes)
src/lib/components/   — MessageBubble, AgentCard, SwarmViz, PaymentFlow
```

### Key Imports
```typescript
import { buildCartMandate, buildPaymentReceipt, buildPaymentMetadata } from '$lib/ap2/x402-flow.js';
import { X402_METADATA_KEYS, AP2_EXTENSIONS } from '$lib/ap2/types.js';
import { getAgentId, submitPaymentFeedback, getReputationSummary } from '$lib/erc8004/reputation.js';
import { ERC8004_CONTRACTS } from '$lib/erc8004/constants.js';
import { PRICING, NETWORKS, USDC, FACILITATORS } from '$lib/config/index.js';
```

### Guardrails
1. `bun run check` before every commit (0 errors required)
2. LOCKED files: `src/lib/x402/adapter.ts`, `src/lib/x402/middleware.ts`, `src/hooks.server.ts`
3. LOCKED: `src/lib/swarm/prompts/*` (the IP)
4. Dark theme: #0a0a0a bg, #fafafa text, #6366f1 accent
5. Svelte 5 runes only ($state, $derived, $effect, $props)
6. Immutability: spread new objects, never mutate
7. Tabs for indentation
8. Import from `$lib/` aliases

### Environment
```
WALLET_ADDRESS=0x494Ee54AA00e645D27dC0dF4b7aaE707e235A544
WALLET_PRIVATE_KEY=<in .env>
APIFY_API_KEY=apify_api_vG8zDDhSyrMM8uzmVeBTPXkDeRNBRf12kk1B
USE_CLI=true
```

### Build Commands
```bash
bun install
bun run dev
bun run build
bun run check
```
