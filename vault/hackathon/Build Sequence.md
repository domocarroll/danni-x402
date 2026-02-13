---
title: Build Sequence
created: 2026-02-12
type: hackathon
tags: [hackathon, execution, sequence, teams]
---

# Build Sequence

Temporal ordering with checkpoints. ~47 hours to deadline.

## Phase 0: Foundation (Hours 0-3) - BLOCKING

**Owner:** Alpha (primary session with Dom)
**Must complete before anything else starts.**

- [ ] Initialize SvelteKit project (`pnpm create svelte`)
- [ ] Install x402 packages (`@x402/core`, `@x402/evm`, `@x402/fetch`)
- [ ] Clone x402 repo for reference (if `/tmp/x402-research` doesn't persist)
- [ ] Write `SvelteKitAdapter` class (~60 lines)
- [ ] Write `createPaymentHook` middleware (~120 lines)
- [ ] Create one test endpoint: `GET /api/hello` → x402-paywalled
- [ ] Test with `@x402/fetch` client script: pay and receive response
- [ ] Generate wallet keypair, fund from Circle faucet
- [ ] Commit: "feat: x402 SvelteKit adapter - first of its kind"

**Checkpoint:** A browser/script can hit `/api/hello`, get a 402, pay USDC, and receive a 200.

---

## Phase 1: Parallel Spinup (Hours 3-8)

All teams start simultaneously once Phase 0 commits to main.

### Alpha continues: Core API
- [ ] `POST /api/danni/analyze` endpoint (accepts brief, returns mock for now)
- [ ] Wire up dual-chain config (Base Sepolia primary, SKALE secondary)
- [ ] Test SKALE via Kobaru facilitator
- [ ] Environment variable setup (`.env.example`)

### Bravo: Data Broker
- [ ] `POST /api/data/competitive` wrapping Apify actor
- [ ] `POST /api/data/social` wrapping Apify actor
- [ ] `POST /api/data/market` wrapping Apify actor
- [ ] Each endpoint x402-paywalled at $5
- [ ] Cached fallback data for demo reliability
- [ ] Commit: "feat: data broker endpoints with Apify integration"

### Charlie: Swarm Engine
- [ ] `LLMProvider` interface + CLI/API implementations
- [ ] Market Analyst agent prompt + runner
- [ ] Competitive Intelligence agent prompt + runner
- [ ] Cultural Resonance agent prompt + runner
- [ ] Brand Architect agent prompt + runner
- [ ] Danni synthesis prompt + runner
- [ ] `executeSwarm()` function orchestrating all 5
- [ ] Test with `claude -p` backend
- [ ] Commit: "feat: swarm orchestration engine with 5 sub-agents"

### Delta: Frontend Shell
- [ ] SvelteKit layout with Danni branding
- [ ] Chat interface component (text input + message display)
- [ ] Payment flow visualization component (status indicators)
- [ ] Transaction history component
- [ ] Mock API responses for independent development
- [ ] Commit: "feat: glass-box frontend shell"

### Echo: Agent Interop
- [ ] A2A Agent Card at `/.well-known/agent.json`
- [ ] A2A JSON-RPC task handler (basic)
- [ ] MCP server setup using `@x402/mcp`
- [ ] MCP tool definitions (brand_analysis, competitive_scan, market_pulse)
- [ ] Commit: "feat: A2A agent card + MCP server"

**Checkpoint (Hour 8):** Each team has a working, independently testable deliverable.

---

## Phase 2: Integration (Hours 8-16)

### Alpha: Wire Everything Together
- [ ] Connect `POST /api/danni/analyze` → `executeSwarm()` → Data Broker calls
- [ ] SSE streaming for swarm progress to frontend
- [ ] Payment receipts flowing through to response metadata
- [ ] End-to-end test: pay $100 → swarm runs → data purchased → brief returned

### Delta: Real API Integration
- [ ] Replace mock APIs with real endpoints
- [ ] SSE consumer for swarm progress visualization
- [ ] Payment flow animation (402 → sign → settle → receipt)
- [ ] Block explorer links for tx hashes

### Echo: Wire to Core
- [ ] MCP tools call actual `executeSwarm()` and Data Broker
- [ ] A2A task handler delegates to same backend
- [ ] Test with MCP client calling Danni

**Checkpoint (Hour 16):** Full loop works. User pays → swarm runs → data purchased → brief delivered → all visible in UI.

---

## Phase 3: Polish (Hours 16-36)

### Overnight Sisyphus Targets:
- [ ] Charlie: Prompt tuning - make swarm output genuinely cohesive, not five stapled summaries
- [ ] Delta: Frontend polish - animations, responsive design, loading states
- [ ] Bravo: Data quality - refine Apify actor selection, improve data parsing

### Live Session Targets:
- [ ] Danni personality infusion across all touchpoints
- [ ] Error handling + graceful degradation
- [ ] Demo walkthrough rehearsal
- [ ] README with architecture diagram
- [ ] Live deployment (Vercel or adapter-node)

**Checkpoint (Hour 36):** Production-grade. Everything works. Looks good.

---

## Phase 4: Demo Video (Hours 36-44)

- [ ] Script the narrative (problem → solution → demo → architecture → future)
- [ ] Record with OBS (screen capture of live demo)
- [ ] Edit (Remotion or manual)
- [ ] 3-5 minute target
- [ ] Upload to accessible URL

---

## Phase 5: Submission (Hours 44-47)

- [ ] Final deployment verification
- [ ] GitHub repo cleanup (README, LICENSE, .env.example)
- [ ] DoraHacks submission: GitHub link + demo video + description
- [ ] Double-check submission before deadline

---

## Critical Path

```
Phase 0 (adapter) ─── BLOCKS EVERYTHING
       │
       ├── Phase 1 Bravo (data)  ──┐
       ├── Phase 1 Charlie (swarm) ─┤── Phase 2 Integration
       ├── Phase 1 Delta (frontend) ┤
       └── Phase 1 Echo (interop)  ─┘
                                     │
                                Phase 3 Polish
                                     │
                                Phase 4 Demo Video
                                     │
                                Phase 5 Submit
```

## If Time Runs Out

See [[Priority Stack]] for what to cut. The minimum viable submission is:
1. x402 adapter + one paid endpoint (Phase 0)
2. Swarm producing output (Phase 1 Charlie)
3. Basic frontend showing the flow (Phase 1 Delta)
4. Screen recording demo video (Phase 4 simplified)
