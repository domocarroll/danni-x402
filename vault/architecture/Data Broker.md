---
title: Data Broker
created: 2026-02-12
type: architecture
tags: [data, apify, x402, broker]
---

# Data Broker

A set of x402-protected endpoints that wrap real data sources (primarily Apify actors) behind x402 paywalls. [[Danni Commerce Agent|Danni]] pays these services autonomously to enrich her strategic analysis.

## Architecture

```
Danni pays $5 → /api/data/competitive  → Apify Actor → real competitor data
Danni pays $5 → /api/data/social       → Apify Actor → real social sentiment
Danni pays $3 → /api/data/market       → Apify Actor → real market trends
```

## Endpoints

| Endpoint | Price | Apify Actor | Returns |
|---|---|---|---|
| `GET /api/data/competitive` | $5 | Web scraper | Competitor websites, pricing, positioning |
| `GET /api/data/social` | $5 | Social scraper | Social sentiment, mentions, trends |
| `GET /api/data/market` | $3 | Google Trends + News | Market dynamics, search trends, news |

Each endpoint is x402-paywalled independently - other agents can also use them directly.

## Why Real Data Matters

- Demo shows genuine utility, not mock responses
- Judges can verify the data is real
- Danni's strategic output quality depends on real inputs
- Shows the full commerce chain: Human → Agent → Service → External API

## Apify Integration

- Free tier: 30 actor runs/month (plenty for hackathon)
- API key stored as environment variable
- Actors are pre-built scrapers (no custom scraper code needed)

## Fallback Strategy

For demo reliability:
- Cache successful Apify responses
- If Apify is down, serve cached data
- Status indicator in frontend: "live data" vs "cached"

## Related
- [[Danni Commerce Agent]]
- [[The Payment Flow]]
- [[Swarm Architecture]]
