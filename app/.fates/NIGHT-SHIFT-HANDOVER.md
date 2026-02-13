# Night Shift Handover — Danni Commerce Agent
## 2026-02-13 ~19:00 AEST → Deadline: 2026-02-14 17:59 AEST

**You have ~23 hours. The foundation is built. Now make it sing.**

---

## What Exists (READ THESE FIRST)

```
CLAUDE.md           — Project conventions, structure, phase ownership, build commands
.planning/ROADMAP.md — Full roadmap with 8 phases
```

### Completed Phases

| Phase | What | Files | Time | Status |
|-------|------|-------|------|--------|
| 1. Foundation | SvelteKit + x402 adapter + payment middleware | src/lib/x402/*, src/hooks.server.ts | Session 02 | LOCKED |
| 2. Swarm Engine | 5-agent orchestrator + LLM CLI backend + prompts | src/lib/swarm/*, src/lib/llm/* | Session 02 | LOCKED |
| 3. Data Broker | 3 Apify endpoints + cache + fallback | src/lib/data/*, src/routes/api/data/** | 4m17s | DONE |
| 4. Frontend Shell | Landing + chat + dashboard + 4 components + 3 stores | src/routes/*, src/lib/components/*, src/lib/stores/* | 11m46s | DONE |
| 5. Agent Interop | A2A types + task manager + MCP tools + handlers + 3 endpoints | src/lib/a2a/*, src/lib/mcp/*, api/a2a, api/mcp, .well-known | 6m41s | DONE |

### 48 Source Files Total
All TypeScript + Svelte. `bun run check` = 0 errors, 0 warnings. `bun run build` = success.

---

## Phase 6: Integration (CRITICAL PATH — DO THIS FIRST)

### 6.1 Wire `/api/danni/analyze` to real swarm (~30 min)

**File:** `src/routes/api/danni/analyze/+server.ts`
**Current:** Returns placeholder JSON (line 19: `// TODO: Phase 2 - Wire executeSwarm() here`)
**Target:**
1. Parse `{ brief, brand?, industry? }` from request body (add zod validation)
2. Import and call `executeSwarm()` from `$lib/swarm/orchestrator.js`
3. Return the `SwarmOutput` as JSON
4. Note: x402 middleware in `hooks.server.ts` already gates this at $100

```typescript
import { executeSwarm } from '$lib/swarm/orchestrator.js';
import type { SwarmInput } from '$lib/types/swarm.js';
```

**Dependency:** The swarm uses `claude -p` CLI backend. Make sure `claude` is on PATH in the server environment. Set `USE_CLI=true` (or omit — it's the default).

### 6.2 Add SSE streaming to analyze endpoint (~45 min)

**Why:** The glass-box UI needs real-time events as agents activate. The `SubagentTracker` (src/lib/swarm/tracker.ts) already records `agent_start`, `agent_complete`, `agent_fail` events.

**Approach:**
1. Change `/api/danni/analyze` to return a `ReadableStream` with SSE format
2. Create a callback-based tracker that emits SSE events as they happen
3. SSE event types: `payment_confirmed`, `agent_start`, `agent_complete`, `agent_fail`, `synthesis_start`, `synthesis_complete`, `result`
4. Final `result` event contains the full `SwarmOutput` JSON

**Frontend already expects this:** `src/lib/stores/chat.svelte.ts` has `EventSource` support (lines 32, 72-77). The chat page's mock flow already uses the right state transitions.

### 6.3 Wire frontend chat to real endpoint (~20 min)

**File:** `src/routes/chat/+page.svelte`
**Current:** `runMockFlow()` simulates 10.5s animated swarm sequence
**Target:** Replace with real `EventSource` connection to `/api/danni/analyze`
**Key:** The `swarmStore.setAgentStatus()` and `paymentsStore.setPaymentStep()` calls already match the SSE event shape. This should be a near-direct swap.

### 6.4 Wire MCP handlers to real backends (~20 min)

**File:** `src/lib/mcp/handlers.ts`
- Line 27: `handleBrandAnalysis` → import and call `executeSwarm()`
- Line 63: `handleCompetitiveScan` → fetch from `http://localhost:5173/api/data/competitive` (or import data functions directly)
- Line 94: `handleMarketPulse` → fetch from `http://localhost:5173/api/data/market`

### 6.5 Wire A2A task execution (~15 min)

**File:** `src/lib/a2a/task-manager.ts:95`
- Wire `processTask()` to call `executeSwarm()` with the task's input
- Update task state as swarm progresses

### 6.6 Wire payment history (~10 min)

**File:** `src/routes/api/payments/history/+server.ts`
- Create in-memory transaction store
- Record each successful x402 payment with txHash, amount, timestamp
- Return from GET endpoint for dashboard display

### 6.7 Minor fixes (~5 min)

- `src/lib/mcp/tools.ts`: Replace hardcoded facilitator URL with import from `$lib/config/constants.js`
- `src/lib/swarm/orchestrator.ts:85-88`: Wire metadata (dataSourcesPurchased, totalCostUsd, txHashes) from actual execution

---

## Phase 7: Voice Integration (HIGH IMPACT — DEMO DIFFERENTIATOR)

### ElevenLabs: Danni Speaks

**Package:** `@elevenlabs/client` (bun add @elevenlabs/client)
**Goal:** Danni narrates the synthesis output with a premium voice

**Implementation:**
1. Create `src/lib/voice/elevenlabs.ts` — TTS wrapper
2. Create `src/routes/api/voice/synthesize/+server.ts` — POST endpoint that takes text, returns audio stream
3. Add audio playback to chat page — when synthesis completes, auto-play Danni's voice
4. Voice selection: use ElevenLabs voice design or clone a sophisticated female voice

**Environment:** `ELEVENLABS_API_KEY` needed in .env

**Why this matters:** Every other hackathon project is text-only. Danni SPEAKS. Judges hear her. That's memorable.

---

## Phase 8: Polish + Flex (PARALLEL — INDEPENDENT TASKS)

### 8.1 3D Force Graph of Danni's Thinking
- Use `3d-force-graph` skill (already available)
- Visualize the swarm's semantic web: agents as nodes, insights as edges
- Could be a separate page at `/graph` or embedded in the chat view
- Feed it from the SwarmOutput — each agent's sources become edges

### 8.2 Multi-Tier Pricing UI
- Landing page shows three tiers: $100 / $1,000 / $50,000
- $100 = standard analysis (what's built)
- $1,000 = deep analysis (more agents, more data sources, recursive passes)
- $50,000 = the statement piece (fractal recursive swarm, evolutionary generations)
- All use the same architecture, just dial the depth parameter

### 8.3 Real Brand Analysis Screenshot
- Run a REAL analysis against a live brand (Nike, Apple, or a lesser-known brand that's more interesting)
- Screenshot the glass-box UI showing agents thinking
- Include in README and submission

### 8.4 Token/Cost Transparency
- Show real-time token count and API cost in the UI
- Glass-box economics: client sees exactly what they're paying for
- Reinforces the "intent → value pricing" thesis

### 8.5 README + Architecture Diagram
- README.md with: problem statement, architecture diagram, demo instructions, the Fates narrative
- Include `.fates/loom/loom.md` as "How This Was Built" section
- Architecture diagram showing: Client → x402 → Swarm → Agents → Synthesis → Voice

---

## How to Run Overnight Compute

### Option A: Single ralph-loop (simplest)
```bash
cd ~/x402-hackathon/app
claude --model opus --dangerously-skip-permissions
# then: /ralph-loop or /ultrawork
```
Feed it this handover. It runs until done or context fills.

### Option B: Fates Pattern (parallel, proven)
Reuse the exact pattern from tonight:
1. Create team with 3 teammates
2. Each Fate launches OpenCode Sisyphus via tmux
3. Use `.fates/send-prompt.sh` for reliable prompt delivery
4. Prompt files in `.fates/prompts/` (create new ones for new phases)

**Phase 6 should be sequential** (one system touching everything).
**Phases 7 + 8 can parallelize** (voice, graph, pricing, polish are independent).

### Option C: Hybrid
- Phase 6: Single focused ultrawork session (this context or fresh)
- Phase 7+8: Spin up Fates for parallel polish work

### Context Management
Each phase should commit before context gets long. If context fills:
1. Commit all work
2. Fresh context reads this handover + git log
3. Picks up where previous context left off

---

## Key Files Quick Reference

| What | Where |
|------|-------|
| Project conventions | `CLAUDE.md` |
| Interface contracts | `docs/INTERFACE-CONTRACTS.md` |
| Type definitions | `src/lib/types/` (swarm.ts, data.ts, llm.ts) |
| Swarm orchestrator | `src/lib/swarm/orchestrator.ts` |
| Agent prompts | `src/lib/swarm/prompts/` |
| LLM provider | `src/lib/llm/provider.ts` (CLI backend) |
| x402 middleware | `src/hooks.server.ts` (LOCKED) |
| Payment config | `src/lib/config/constants.ts` |
| Frontend stores | `src/lib/stores/` (chat, swarm, payments) |
| Fates workspace | `.fates/` (loom, provenance, analysis, prompts) |
| SUBFRAC.OS modules | `/home/dom/Documents/subfrac.os/danni/personality/modules/` |
| The Canon | `vault/architecture/The Canon.md` |
| Strategic Frameworks | `vault/architecture/Strategic Frameworks.md` |
| Decision Log | `vault/meta/Decision Log.md` |

## Environment Variables (.env)

```
WALLET_ADDRESS=0x494Ee54AA00e645D27dC0dF4b7aaE707e235A544
WALLET_PRIVATE_KEY=<already in .env>
APIFY_API_KEY=apify_api_vG8zDDhSyrMM8uzmVeBTPXkDeRNBRf12kk1B
USE_CLI=true  # or omit — defaults to claude -p backend
# Add for Phase 7:
ELEVENLABS_API_KEY=<need from Dom>
```

## Build Commands

```bash
bun install          # Install deps
bun run dev          # Dev server at localhost:5173
bun run build        # Production build
bun run check        # TypeScript + svelte-check (MUST pass before commit)
```

---

## The Narrative (for submission)

This project was built by a meta-cognitive AI swarm. Three Fates (Clotho, Lachesis, Atropos) watched three parallel builders through tmux, tracking provenance, measuring drift, and guarding boundaries. The Loom wove their observations into a semantic web of the build itself.

Phases 3, 4, and 5 were built simultaneously in 12 minutes wall-clock time. 25 files. Zero errors. Zero file conflicts between independent builders. Emergent convergence: agents independently chose the same design tokens without coordination.

The build process IS the product. Danni is a brand strategist built by the same kind of swarm intelligence she uses to analyze brands. The architecture is fractal — the same pattern at every level.

Include `.fates/` in the submission. The provenance chain, the Loom narrative, the analysis logs. Show judges: this project was built by AI agents that tracked their own decisions, measured their own drift, and wove their own meaning.

---

## Priorities (If Time is Limited)

1. **Phase 6.1-6.3** — Analyze endpoint + SSE + frontend wiring (demo MUST work end-to-end)
2. **Phase 7** — Voice (ElevenLabs, biggest differentiation)
3. **Phase 8.5** — README + architecture diagram (judges read this first)
4. **Phase 8.3** — Real brand analysis screenshot (proof it works)
5. **Phase 8.1** — 3D force graph (visual wow factor)
6. **Everything else** — Nice to have

---

*The swarm built. The Fates watched. The Loom remembered. Now the night shift weaves what remains.*
