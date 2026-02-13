---
title: SvelteKit x402 Adapter
created: 2026-02-12
type: architecture
tags: [sveltekit, x402, adapter, framework]
---

# SvelteKit x402 Adapter

Our custom framework integration. First x402 SvelteKit integration in existence. A key differentiator for the [[Hackathon Strategy|hackathon]].

## Why It's Only ~200 Lines

The [[x402 Protocol|x402 SDK]] uses a clean Adapter pattern. All protocol logic lives in `@x402/core` (framework-agnostic). Framework adapters are thin translation layers.

Existing adapters for comparison:
- `@x402/next`: 697 lines (3 files)
- `@x402/express`: 491 lines (2 files)
- `@x402/hono`: 419 lines (2 files)

The actual unique middleware logic (after removing docs, re-exports, factories):
- Next.js: ~45 lines
- Express: ~90 lines (inflated by response buffering)
- Hono: ~55 lines

## What We Build

### 1. SvelteKitAdapter (~60 lines)
Implements `HTTPAdapter` wrapping SvelteKit's `RequestEvent`:

```typescript
class SvelteKitAdapter implements HTTPAdapter {
  constructor(private event: RequestEvent) {}
  getHeader(name) { return this.event.request.headers.get(name) ?? undefined; }
  getMethod() { return this.event.request.method; }
  getPath() { return this.event.url.pathname; }
  getUrl() { return this.event.url.toString(); }
  // ... ~10 methods total, each 1-3 lines
}
```

### 2. Payment Hook (~120 lines)
A SvelteKit `Handle` function for `hooks.server.ts`:

```typescript
export const handle: Handle = async ({ event, resolve }) => {
  const adapter = new SvelteKitAdapter(event);
  if (!httpServer.requiresPayment(context)) return resolve(event);

  const result = await httpServer.processHTTPRequest(context);

  switch (result.type) {
    case "payment-error": return new Response(body, { status: 402, headers });
    case "payment-verified":
      const response = await resolve(event);
      const settlement = await httpServer.processSettlement(...);
      // Add settlement headers
      return new Response(response.body, { ...headers });
  }
};
```

### 3. Route Handler Wrapper (~50 lines)
Optional `withX402` for `+server.ts` handlers.

## Why SvelteKit Is Actually Easy

- **Standard Web APIs** - `RequestEvent` wraps standard `Request`, `URL` objects
- **Immutable Response model** - Like Hono, no Express-style response buffering needed
- **`sequence()`** - Native middleware composition for hooks
- **No special path handling** - Standard `URL.pathname`

## Modeled On

The **Hono adapter** is the closest structural analog (both use web-standard Request/Response). Source at: `/tmp/x402-research/typescript/packages/http/hono/src/`

## Related
- [[x402 Protocol]]
- [[Tech Stack]]
- [[Product Vision]]
