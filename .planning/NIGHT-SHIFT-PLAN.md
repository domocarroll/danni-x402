# Night Shift Plan — Danni Commerce Agent
## Created: 2026-02-13 ~19:30 AEST
## Deadline: 2026-02-14 07:59 UTC (17:59 AEST) — ~21 hours

---

## Strategic Pivot (Owner Decision)

**OLD FLOW:** One-shot — submit brief → pay $100 → swarm runs → result
**NEW FLOW:** Conversational discovery → rich context → swarm with depth

The BWD (Brand World Design) 7 chambers concept is the conversational mechanism, but stripped of mystical language. Stay close to the metal with Danni's core modules:

- `/strategy` Phase 1 (Context Mapping) + Phase 2 (Strategic Interrogation)
- `/creative` Phase 1 (Cultural Context Mapping) + Phase 2 (Insight Excavation)  
- `/synthesize` (Vesica Pisces — breakthrough zone)
- `/validate` (Heart Knows protocol)

The MUD-style text intake maps to 5 discovery layers:

| Layer | Module Source | What Danni Extracts |
|-------|-------------|-------------------|
| Business Reality | /strategy P1 | What they do, who they serve, core challenge |
| Competitive Landscape | /strategy P2 | Competitors, differentiators, category assumptions |
| Cultural Positioning | /creative P1 | Cultural moment, audience values, emotional territory |
| Brand Tension | /creative P2 | Current vs desired, inherited assumptions |
| Ambition & Vision | /synthesize primer | Vision, boldness level, constraints |

Each layer feeds directly into swarm agent directives. Discovery IS the product.

---

## Wave Execution Plan

### WAVE 0: Pre-flight (5 min, sequential)
- `bun run check` → 0 errors
- `bun run build` → SUCCESS

### WAVE 1: Core Discovery Engine (3 parallel agents, ~45 min) — P0
- **1A: Backend** — Discovery session state machine, question bank, API endpoints
- **1B: Frontend** — Chat page multi-turn flow, layer progress, state machine
- **1C: Types + Swarm** — DiscoveryContext type, enrich SwarmInput, agent context injection

### WAVE 2: Production Hardening (3 parallel agents, ~30 min) — P1
- **2A: API** — zod validation everywhere, error classification, timeout handling
- **2B: Frontend** — Loading states, error recovery, mobile responsive
- **2C: Swarm + Voice** — Agent failure isolation, retry logic, voice graceful degradation

### WAVE 3: Frontend Polish + Landing (2 parallel agents, ~30 min) — P2
- **3A: Discovery UX** — Layer transitions, progress indicator, micro-interactions
- **3B: Landing** — Update to 4-step flow, discovery feature card

### WAVE 4: Documentation (2 parallel agents, ~30 min) — P0
- **4A: README** — Complete rewrite for submission, mermaid architecture diagram
- **4B: CLAUDE.md** — Update structure, remove stale boundaries

### WAVE 5: Deployment (sequential, ~30 min) — P1
- Docker build + test locally
- Deploy to Hostinger VPS or Vercel
- Verify public URL

### WAVE 6: Voice + Demo Script (if time, ~20 min) — P3
- Voice synthesis for strategic brief (~500 words, ~3K of 10K credits)
- Demo video script

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Session storage | In-memory Map, 30min TTL | No DB, hackathon context |
| SwarmInput change | Add optional `discoveryContext` | Backward compatible |
| UI approach | Single /chat page with state machine | Less routing, cohesive flow |
| Discovery questions | Hardcoded, not LLM-generated | Reliability, no API cost |
| Landing update | 4 steps: Pay → Discover → Analyze → Strategy | Accurate representation |
| Deploy target | Hostinger VPS via Docker | Existing SSH access |
| Voice budget | Final brief only (~500 words = ~3K credits) | Preserve 10K credit budget |

---

## ElevenLabs Key
`ELEVENLABS_API_KEY` is set in `.env`. 10K credits. Use sparingly — test with <100 words, reserve for demo.

---

## Verification Gates (between every wave)
```bash
bun run check    # 0 errors, 0 warnings
bun run build    # SUCCESS
```

---

## File Ownership (No Conflicts Within Waves)

Wave 1:
- 1A owns: `src/lib/discovery/*`, `src/routes/api/danni/discover/*`
- 1B owns: `src/lib/stores/chat.svelte.ts`, `src/routes/chat/+page.svelte`
- 1C owns: `src/lib/types/swarm.ts`, `src/lib/swarm/*`

Wave 2:
- 2A owns: `src/routes/api/**` (endpoints)
- 2B owns: `src/routes/*.svelte`, `src/lib/components/*`
- 2C owns: `src/lib/swarm/*`, `src/lib/voice/*`

---

## Priority If Time Runs Short
1. Wave 1 (Discovery Engine) — the differentiator
2. Wave 4A (README) — judges read first
3. Wave 2 (Hardening) — judges try to break it
4. Wave 5 (Deploy) — must be accessible
5. Wave 3 (Polish) — makes it feel real
6. Wave 6 (Voice) — nice to have
