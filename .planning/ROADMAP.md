# Roadmap: Danni Commerce Agent

## Overview

Build an x402-powered autonomous brand strategist in ~26 hours. Two parallel tracks: Claude Code builds the swarm engine (Danni's brain) while OpenCode Sisyphus grinds the infrastructure (adapter, frontend, data, interop). Tracks converge at integration. `claude -p` for free dev iteration, Agent SDK swap for demo.

## Compute Strategy

| Track | Owner | Compute |
|-------|-------|---------|
| Swarm engine + prompts | Claude Code (Opus 4.6) | Core IP, kept in-house |
| x402 adapter | OpenCode Sisyphus | Bounded spec from Interface Contracts |
| Frontend shell | OpenCode Sisyphus | Bounded spec from Interface Contracts |
| Data Broker | OpenCode Sisyphus | Bounded spec from Interface Contracts |
| A2A + MCP | OpenCode Sisyphus | Bounded spec from Interface Contracts |
| Integration | Claude Code | Cross-cutting, needs all context |
| Polish | OpenCode overnight | Grind mode |

## Phases

- [x] **Phase 1: Foundation** - SvelteKit project + x402 adapter + project skeleton (BLOCKS PARALLEL)
- [x] **Phase 2: Swarm Engine** - 5-agent orchestration with `claude -p` backend (CLAUDE CODE)
- [ ] **Phase 3: Data Broker** - Apify-backed x402-paywalled data endpoints (OPENCODE SISYPHUS)
- [ ] **Phase 4: Frontend Shell** - Glass-box UI with chat, payment viz, swarm activity (OPENCODE SISYPHUS)
- [ ] **Phase 5: Agent Interop** - A2A Agent Card + MCP server (OPENCODE SISYPHUS)
- [ ] **Phase 6: Integration** - Wire everything together, end-to-end flow (CLAUDE CODE)
- [ ] **Phase 7: Polish & Deploy** - Error handling, personality, deployment (OPENCODE OVERNIGHT)
- [ ] **Phase 8: Demo & Submit** - Video production + DoraHacks submission

## Phase Details

### Phase 1: Foundation
**Goal**: SvelteKit project skeleton with x402 adapter and project structure for all teams to build against
**Depends on**: Nothing (BLOCKS EVERYTHING)
**Owner**: Claude Code
**Requirements**: REQ-01, REQ-02
**Success Criteria** (what must be TRUE):
  1. SvelteKit project initialized with x402 packages installed
  2. SvelteKitAdapter class implements HTTPAdapter interface (9 methods)
  3. createPaymentHook middleware intercepts configured routes and returns 402
  4. A test endpoint accepts x402 payment and returns 200 with content
  5. Wallet keypair generated and funded from Circle faucet
  6. Project structure defined so parallel tracks can work independently
  7. Interface Contracts from vault committed as reference specs
**Plans**: 1 plan (complete)

### Phase 2: Swarm Engine
**Goal**: Danni produces a real strategic brief worth $100 from 5 parallel sub-agents
**Depends on**: Phase 1 (project structure only -- does NOT need x402 to work)
**Owner**: Claude Code (core IP -- not delegated)
**Requirements**: REQ-03, REQ-08
**LLM Strategy**: `claude -p` for dev/testing (free on Max sub), Agent SDK swap for demo
**Reference**: Research-agent demo at `/tmp/claude-agent-sdk-demos/research-agent/` for SubagentTracker pattern, hooks, parallel spawning
**Success Criteria** (what must be TRUE):
  1. LLMProvider interface with CLI backend (`claude -p`) working
  2. Market Analyst agent: /strategy P1-3 + Canon Layer 2 (Fallon/Senn) + assigned frameworks
  3. Competitive Intel agent: /strategy P2 + Canon Layer 2 + assigned frameworks
  4. Cultural Resonance agent: /creative P1-2,5 + Canon Layer 1 (Ogilvy) + assigned frameworks
  5. Brand Architect agent: /creative P3-4, /strategy P4 + Canon Layer 2-3 (Fallon->Holt)
  6. Danni Synthesis: /synthesize + /validate + all Canon layers -> unified strategic brief
  7. executeSwarm() orchestrates all 5 and returns SwarmOutput matching Interface Contract
  8. Output quality: a creative director could build a campaign from the brief
**Plans:** 3 plans
Plans:
- [ ] 02-01-PLAN.md -- LLM provider abstraction + CLI backend + utilities + zod schemas
- [ ] 02-02-PLAN.md -- Five agent system prompts (SUBFRAC.OS + Canon + Frameworks IP)
- [ ] 02-03-PLAN.md -- Orchestrator wiring + agent runners + smoke test

### Phase 3: Data Broker
**Goal**: Three x402-paywalled API endpoints returning real market data from Apify
**Depends on**: Phase 1 (needs x402 adapter + project structure)
**Owner**: OpenCode Sisyphus (ultrawork mode)
**Spec**: vault/architecture/Interface Contracts.md -> Contract 2
**Requirements**: REQ-04
**Success Criteria** (what must be TRUE):
  1. POST /api/data/competitive returns competitor analysis for a brand
  2. POST /api/data/social returns social sentiment data
  3. POST /api/data/market returns industry market dynamics
  4. Each endpoint is x402-paywalled at $5
  5. Cached fallback data exists for demo reliability
**Plans**: TBD

### Phase 4: Frontend Shell
**Goal**: SvelteKit UI showing chat interface, payment flow visualization, and swarm activity
**Depends on**: Phase 1 (needs routes defined, works against mock API responses)
**Owner**: OpenCode Sisyphus (ultrawork mode)
**Spec**: vault/architecture/Interface Contracts.md -> Contract 4
**Requirements**: REQ-05, REQ-08
**Success Criteria** (what must be TRUE):
  1. Landing page with Danni branding and value proposition
  2. Chat interface where users submit strategic briefs
  3. Payment flow visualization (402 challenge -> sign -> settle -> receipt)
  4. Swarm activity display showing each agent activating and producing output
  5. Transaction history with block explorer links
**Plans**: TBD

### Phase 5: Agent Interop
**Goal**: Danni discoverable by other agents via A2A and MCP protocols
**Depends on**: Phase 1 (needs endpoint structure defined)
**Owner**: OpenCode Sisyphus (ultrawork mode)
**Spec**: vault/architecture/Interface Contracts.md -> Contract 5
**Requirements**: REQ-06, REQ-07
**Success Criteria** (what must be TRUE):
  1. A2A Agent Card served at /.well-known/agent.json with correct schema
  2. A2A JSON-RPC task handler accepts and processes requests
  3. MCP server exposes brand_analysis, competitive_scan, market_pulse tools
  4. MCP tools include x402 pricing metadata
  5. External agent can discover and call Danni via either protocol
**Plans**: TBD

### Phase 6: Integration
**Goal**: All subsystems wired together into a working end-to-end flow
**Depends on**: Phases 2, 3, 4, 5
**Owner**: Claude Code (cross-cutting, needs all context)
**Requirements**: REQ-10
**Success Criteria** (what must be TRUE):
  1. POST /api/danni/analyze calls executeSwarm() which calls Data Broker endpoints
  2. SSE streaming delivers swarm progress to frontend in real-time
  3. Payment receipts (tx hashes) flow through to response metadata
  4. MCP and A2A handlers delegate to the same backend
  5. Full loop: pay $100 -> swarm runs -> data purchased -> brief delivered -> visible in UI
  6. Agent SDK swap tested: `USE_CLI=false` triggers API-backed execution
**Plans**: TBD

### Phase 7: Polish & Deploy
**Goal**: Production-grade demo with error handling, personality, and live deployment
**Depends on**: Phase 6
**Owner**: OpenCode overnight grind + Claude Code quality pass
**Requirements**: REQ-08
**Success Criteria** (what must be TRUE):
  1. Error handling and graceful degradation on all endpoints
  2. Danni personality infused across all touchpoints
  3. Responsive design works on demo screen sizes
  4. Deployed to accessible URL
  5. README with architecture diagram
**Plans**: TBD

### Phase 8: Demo & Submit
**Goal**: Compelling demo video and complete DoraHacks submission
**Depends on**: Phase 7
**Owner**: Dom + Claude Code
**Requirements**: REQ-09
**Success Criteria** (what must be TRUE):
  1. 3-5 minute demo video showing problem -> solution -> live demo -> architecture -> future
  2. Video uploaded to accessible URL
  3. GitHub repo cleaned up (README, LICENSE, .env.example)
  4. DoraHacks submission complete with all required fields
  5. Submission verified before deadline
**Plans**: TBD

## Critical Path

```
Phase 1 (Foundation) --- BLOCKS EVERYTHING
       |
       +-- Phase 2 (Swarm Engine)    [Claude Code]  --+
       +-- Phase 3 (Data Broker)     [OpenCode]       +-- Phase 6 Integration
       +-- Phase 4 (Frontend Shell)  [OpenCode]       |   [Claude Code]
       +-- Phase 5 (Agent Interop)   [OpenCode]      -+
                                                       |
                                                  Phase 7 Polish
                                                  [OpenCode overnight]
                                                       |
                                                  Phase 8 Demo & Submit
```

## Progress

| Phase | Owner | Plans Complete | Status | Completed |
|-------|-------|----------------|--------|-----------|
| 1. Foundation | Claude Code | 1/1 | Complete | 2026-02-13 |
| 2. Swarm Engine | Claude Code | 3/3 | Complete | 2026-02-13 |
| 3. Data Broker | OpenCode | 0/TBD | Not started | - |
| 4. Frontend Shell | OpenCode | 0/TBD | Not started | - |
| 5. Agent Interop | OpenCode | 0/TBD | Not started | - |
| 6. Integration | Claude Code | 0/TBD | Not started | - |
| 7. Polish & Deploy | OpenCode + CC | 0/TBD | Not started | - |
| 8. Demo & Submit | Dom + CC | 0/TBD | Not started | - |
