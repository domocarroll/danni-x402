---
title: Team Architecture
created: 2026-02-12
type: hackathon
tags: [teams, parallel, architecture]
---

# Team Architecture

Five parallel workstreams via Claude Code teams. Elephant carpaccio - each slice independently demoable, convergence produces the comprehensive product.

## Critical Path

```
x402 SvelteKit Adapter (~200 lines)
         │
         ▼
One working paid endpoint (Danni answers, payment settles)
         │
         ▼
Everything else is parallel and additive
```

## Teams

| Team | Slice | Dependency | Overnight Sisyphus? |
|---|---|---|---|
| **Alpha** | [[SvelteKit x402 Adapter]] + core payment flow | None - builds first | Delivers in hours, pivots to integration |
| **Bravo** | [[Data Broker]] endpoints (Apify + x402) | x402 adapter contract only | Yes |
| **Charlie** | [[Swarm Architecture]] engine | Can develop against mock data | Yes |
| **Delta** | Frontend (chat UI, payment visualization) | Can develop against mock API | Yes |
| **Echo** | [[MCP Integration]] + [[A2A Protocol]] | x402 adapter contract only | Yes |

## Interface Contracts

Teams work independently if interfaces are clean:
- **x402 adapter**: `HTTPAdapter` interface (defined by x402 core)
- **Data Broker**: REST endpoints with defined request/response schemas
- **Swarm**: input = user query + data, output = structured strategic brief
- **Frontend**: consumes API, displays state
- **MCP/A2A**: wraps the same endpoints in protocol-specific formats

## Live Sessions vs Overnight

**Live sessions (Dom + primary Claude):**
- Architecture decisions
- Integration passes
- Quality control
- Demo scripting

**Overnight (Sisyphus):**
- Charlie: Prompt engineering, swarm output quality
- Delta: Frontend polish, animations, responsive design
- Bravo: Apify actor wiring, data quality testing

## Related
- [[Hackathon Strategy]]
- [[Priority Stack]]
