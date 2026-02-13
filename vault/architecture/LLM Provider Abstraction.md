---
title: LLM Provider Abstraction
created: 2026-02-12
type: architecture
tags: [llm, claude, provider, abstraction]
---

# LLM Provider Abstraction

Swappable LLM backend so we can develop on Claude Code subscription and switch to API for the demo.

## Interface

```typescript
interface LLMProvider {
  complete(systemPrompt: string, userMessage: string): Promise<string>
}
```

## Implementations

### CLI Provider (Development)
Uses existing Claude Code subscription via `claude -p`:

```typescript
const cliProvider: LLMProvider = {
  async complete(system, user) {
    // shells out to: echo "user msg" | claude -p --system "system prompt"
  }
}
```

### API Provider (Production/Demo)
Direct Claude API via Anthropic SDK:

```typescript
const apiProvider: LLMProvider = {
  async complete(system, user) {
    // calls anthropic.messages.create() with claude-opus-4-6
  }
}
```

## Switching

```typescript
const llm = process.env.USE_CLI ? cliProvider : apiProvider;
```

## Tradeoffs

| | CLI | API |
|---|---|---|
| Cost | Existing subscription | Per-token billing |
| Speed | Slower (process spawn) | Faster |
| Parallelism | Limited | Full parallel |
| For development | Perfect | Overkill |
| For demo day | Too slow for 5 agents | Required |

## Why This Matters

API budget needs approval. This lets [[Swarm Architecture|Charlie team]] build and test the entire swarm orchestration without API costs. When budget is approved, one env var flip.

## Related
- [[Swarm Architecture]]
- [[Tech Stack]]
- [[Pricing Model]]
