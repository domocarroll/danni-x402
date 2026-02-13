# Danni Commerce Agent

x402-powered autonomous brand strategist. Five parallel AI analysts produce a strategic brief worth $100, paid for with USDC via the x402 protocol, visible in real-time through a glass-box UI.

## Runtime & Stack

- **Runtime**: bun (bun.lock, not npm/yarn)
- **Framework**: SvelteKit 2 + Svelte 5 (runes: `$state`, `$derived`, `$effect`, `$props`)
- **Language**: TypeScript (strict mode)
- **Styling**: Scoped `<style>` blocks in `.svelte` files. Dark theme (#0a0a0a bg, #fafafa text, #6366f1 accent)
- **Validation**: zod for runtime, TypeScript interfaces for compile-time
- **Payments**: @x402/core + @x402/evm on Base Sepolia (chain ID 84532)
- **Package manager**: `bun add` / `bun install` (never npm/yarn)

## Project Structure

```
src/
  routes/
    +page.svelte                          # Landing page
    +layout.svelte                        # Global layout
    chat/+page.svelte                     # Chat interface (Phase 4)
    dashboard/+page.svelte                # Payment dashboard (Phase 4)
    api/
      danni/analyze/+server.ts            # Main swarm endpoint (Phase 6 integration)
      data/competitive/+server.ts         # Data broker (Phase 3)
      data/social/+server.ts              # Data broker (Phase 3)
      data/market/+server.ts              # Data broker (Phase 3)
      payments/history/+server.ts         # Payment history
    .well-known/agent.json/+server.ts     # A2A Agent Card (Phase 5)
  lib/
    types/                                # Shared TypeScript interfaces + zod schemas
      data.ts                             # CompetitiveData, SocialData, MarketData
      swarm.ts                            # SwarmInput, SwarmOutput, AgentOutput + zod
      llm.ts                              # LLMProvider types
      index.ts                            # Re-exports
    config/
      constants.ts                        # NETWORKS, USDC addresses, PRICING, FACILITATORS
      routes.ts                           # x402 route config (getRoutes())
      index.ts                            # Re-exports
    x402/                                 # Phase 1 COMPLETE - do not modify
      adapter.ts                          # SvelteKitAdapter implements HTTPAdapter
      middleware.ts                        # createPaymentHook()
      index.ts
    swarm/                                # Phase 2 (in progress in another context)
      orchestrator.ts                     # executeSwarm()
      tracker.ts                          # SubagentTracker
      utils.ts
    llm/                                  # Phase 2 (in progress in another context)
      provider.ts                         # LLMProvider interface
      cli-backend.ts                      # claude -p backend
  hooks.server.ts                         # x402 payment middleware (Phase 1 COMPLETE)
```

## Phase Status

| Phase | Status | Owner |
|-------|--------|-------|
| 1. Foundation | COMPLETE | Claude Code |
| 2. Swarm Engine | IN PROGRESS (Plans 1-2 done, Plan 3 pending) | Claude Code (separate context) |
| 3. Data Broker | NOT STARTED - ready for work | Agent Team: Bravo |
| 4. Frontend Shell | NOT STARTED - ready for work | Agent Team: Delta |
| 5. Agent Interop | NOT STARTED - ready for work | Agent Team: Echo |

## File Ownership Boundaries (CRITICAL)

Each teammate owns specific files. DO NOT edit files outside your scope.

| Owner | Files | Description |
|-------|-------|-------------|
| **Bravo (Phase 3)** | `src/routes/api/data/**`, `src/lib/data/**` (new) | Data broker endpoints + Apify integration |
| **Delta (Phase 4)** | `src/routes/+page.svelte`, `src/routes/+layout.svelte`, `src/routes/chat/**`, `src/routes/dashboard/**`, `src/lib/components/**` (new), `src/lib/stores/**` (new) | All frontend pages and components |
| **Echo (Phase 5)** | `src/routes/.well-known/**`, `src/routes/api/a2a/**` (new), `src/lib/mcp/**` (new), `src/lib/a2a/**` (new) | A2A + MCP interop layer |
| **LOCKED** | `src/lib/x402/**`, `src/hooks.server.ts` | Phase 1 complete - do not modify |
| **LOCKED** | `src/lib/swarm/**`, `src/lib/llm/**` | Phase 2 in progress elsewhere - do not modify |
| **SHARED (read-only)** | `src/lib/types/**`, `src/lib/config/**` | Import types and constants, do not modify |

## Coding Conventions

- Use `tabs` for indentation (project .editorconfig)
- Import from `$lib/` aliases, never relative `../../`
- SvelteKit route handlers export named functions: `GET`, `POST`, etc.
- Use `json()` helper from `@sveltejs/kit` for JSON responses
- Svelte 5 runes syntax: `$state()`, `$derived()`, `$effect()`, `$props()`
- Layout uses `Snippet` type: `let { children }: { children: Snippet } = $props()`
- Type imports: `import type { X } from '...'`
- Error responses: `json({ error: 'message' }, { status: 4xx })`

## Key Constants (from src/lib/config/constants.ts)

```typescript
NETWORKS.BASE_SEPOLIA = 'eip155:84532'
PRICING.BRAND_ANALYSIS = '$100'
PRICING.DATA_ENDPOINT = '$5'
FACILITATORS.DEFAULT = 'https://x402.org/facilitator'
```

## Environment Variables

```
WALLET_ADDRESS=0x494Ee54AA00e645D27dC0dF4b7aaE707e235A544
WALLET_PRIVATE_KEY=<from .env>
APIFY_API_KEY=apify_api_vG8zDDhSyrMM8uzmVeBTPXkDeRNBRf12kk1B
```

## Interface Contracts

Full contracts in `docs/INTERFACE-CONTRACTS.md`. Quick reference:

### Contract 2 (Bravo: Data Broker)
- `POST /api/data/competitive` - `{ brand: string; competitors?: string[] }` -> `CompetitiveData`
- `POST /api/data/social` - `{ brand: string; platforms?: string[] }` -> `SocialData`
- `POST /api/data/market` - `{ industry: string; region?: string }` -> `MarketData`
- All x402-paywalled at $5. Must have cached fallback data for demo reliability.

### Contract 4 (Delta: Frontend Shell)
- Landing page with Danni branding
- Chat interface consuming `POST /api/danni/analyze` (SSE streaming)
- Payment flow visualization (402 -> sign -> settle -> receipt)
- Swarm activity display (each agent activating/producing)
- Dashboard with transaction history linking to block explorers

### Contract 5 (Echo: Agent Interop)
- A2A Agent Card at `/.well-known/agent.json` (stub exists, needs A2A JSON-RPC handler)
- MCP server exposing: `brand_analysis` ($100), `competitive_scan` ($5), `market_pulse` ($5)
- Both protocols delegate to the same backend

## Build & Test

```bash
bun install          # Install dependencies
bun run dev          # Dev server (vite)
bun run build        # Production build
bun run check        # svelte-check + TypeScript
```
