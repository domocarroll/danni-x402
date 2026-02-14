# Voiceover Script — Danni Demo

Read this aloud while screen recording. Each section maps to a visual act.
Pace: conversational, not rushed. ~130 words per minute. Pause where marked.

---

## [TITLE CARD — 0:00]

*Wait 4 seconds for text animation. Then:*

---

## [BROWSER: Landing page — 0:05]

Every agent in this hackathon can build things. Call an API. Move tokens.

The hard part was never building — it's knowing what to build. Which market to enter. Which position to own.

That's strategy. And until now, no agent could buy it.

*[pause 2 sec]*

---

## [TERMINAL: agent.json curl — 0:25]

Let's say your agent needs brand strategy. First — discovery.

*[run curl, let output appear, pause]*

A2A Agent Card. Three skills. Prices declared. AP2 and ERC-8004 listed as extensions. Your agent knows what Danni does, what it costs, and which payment protocols it speaks — before sending a single message.

---

## [TERMINAL: MCP tools/list curl — 0:50]

Same capabilities through MCP.

*[run curl, let output appear, pause]*

Three tools. Prices in the annotations. Machine-readable. brand_analysis — one hundred dollars. competitive_scan and market_pulse — five each.

---

## [TERMINAL: IntentMandate curl — 1:10]

Now your agent wants the full analysis. It sends an IntentMandate through A2A.

*[run curl, let output appear, pause]*

State: input-required. Danni sends back a CartMandate with a context ID. One hundred dollars USDC. This is AP2 version zero-point-two running inside A2A. First TypeScript implementation.

---

## [TERMINAL: CartMandate details — 1:35]

*[run curl, let output appear]*

Itemized. The skill, the description, the price. Like an invoice — but for agents.

---

## [TERMINAL: x402 payment requirements — 1:45]

*[run curl, let output appear, pause]*

And here's the x402 payment requirements embedded in the cart. Two options — Base Sepolia, or SKALE Europa for zero gas. The agent signs an EIP-3009 USDC authorization, sends a PaymentMandate with the same context ID, and the task resumes. Settlement on-chain. Receipt in the artifacts.

---

## [BROWSER: Chat interface / Glass box — 2:10]

That's agent-to-agent. Here's what a human sees.

*[show chat UI, agents visible]*

Five agents. Market Analyst. Competitive Intel. Cultural Resonance. Brand Architect. And Danni Synthesis. Each one lights up as it works. Each output visible in real time.

These aren't generic prompts. Each agent encodes specific strategic frameworks — Ogilvy, Fallon, Holt. The synthesis finds the intersection. That's what makes the output worth a hundred dollars.

*[pause on swarm viz]*

---

## [TERMINAL: ERC-8004 registration curl — 2:40]

Every payment closes the reputation loop.

*[run curl, let output appear]*

Danni is registered on Base Sepolia via ERC-8004. Identity Registry. Reputation Registry. After every settlement, positive feedback goes on-chain. Over time, that reputation score becomes a trust signal other agents verify before committing a hundred dollars.

---

## [CLOSING CARD — 3:00]

Five protocols. One application.

Strategic intelligence — on-chain — whenever your agents need it.

*[hold 4 seconds on closing card]*

---

## Timing Notes

| Section | Start | Duration | Words |
|---------|-------|----------|-------|
| Title card | 0:00 | 5s | 0 |
| Thesis + landing | 0:05 | 20s | ~45 |
| Agent Card | 0:25 | 25s | ~50 |
| MCP tools | 0:50 | 20s | ~35 |
| IntentMandate | 1:10 | 25s | ~45 |
| CartMandate | 1:35 | 10s | ~15 |
| x402 requirements | 1:45 | 25s | ~55 |
| Glass box UI | 2:10 | 30s | ~65 |
| ERC-8004 | 2:40 | 20s | ~45 |
| Closing card | 3:00 | 5s | ~15 |
| **Total** | | **~3:05** | **~370** |
