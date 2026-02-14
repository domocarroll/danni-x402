# Demo Video Script — Danni

**Target length:** 3:00–3:30
**Format:** Screen recording with voiceover
**Tool:** OBS or Loom. Dark terminal + browser side-by-side where needed.

---

## ACT 1 — The Thesis (0:00–0:25)

**Visual:** Black screen, white text fading in. Then cut to danni.subfrac.cloud landing page.

**Voiceover:**

> "Every agent in this hackathon can build things. Call an API. Move tokens. The hard part was never building — it's knowing *what* to build. Which market to enter. Which position to own. That's strategy. And right now, no agent can buy it.
>
> Danni changes that."

**On screen at 0:20:** Browser loads danni.subfrac.cloud. The landing page is visible.

---

## ACT 2 — Discovery: An Agent Finds Danni (0:25–1:10)

**Visual:** Terminal (dark theme, matching Danni UI). Clean, readable font.

**Voiceover:**

> "Let's say your agent needs brand strategy. First, it discovers Danni."

**Action:** Run in terminal:

```bash
curl -s https://danni.subfrac.cloud/.well-known/agent.json | jq '{name, skills: [.skills[].id], extensions: [.capabilities.extensions[].uri]}'
```

> "A2A Agent Card. Three skills. AP2 and ERC-8004 declared as extensions. Your agent knows what Danni does, what it costs, and which payment protocols it speaks — before sending a single message."

**Then:**

```bash
curl -s -X POST https://danni.subfrac.cloud/api/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq '.result.tools[] | {name, price: .annotations.x402.price}'
```

> "Same capabilities, MCP surface. Three tools. Prices in the annotations. Machine-readable."

**Pause on the output.** Let judges read it. `brand_analysis: $100`, `competitive_scan: $5`, `market_pulse: $5`.

---

## ACT 3 — The Payment Flow: AP2 Inside A2A (1:10–2:00)

**Visual:** Terminal. This is the technical meat.

**Voiceover:**

> "Your agent wants brand analysis. It sends an IntentMandate through A2A."

**Action:**

```bash
curl -s -X POST https://danni.subfrac.cloud/api/a2a \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc":"2.0","id":1,"method":"SendMessage",
    "params":{"message":{"role":"user","parts":[{
      "type":"data","mimeType":"application/json",
      "data":{"type":"ap2.mandates.IntentMandate",
              "skillId":"brand-analysis",
              "description":"Analyze the brand positioning of Notion in the productivity space"}
    }]}}
  }' | jq '{
    state: .result.task.status.state,
    contextId: .result.task.contextId,
    paymentStatus: .result.task.status.message.metadata["x402.payment.status"],
    cartMandate: .result.task.artifacts[0].name
  }'
```

> "State: input-required. Danni sends back a CartMandate with the contextId — $100 USDC, embedded x402 payment requirements for Base Sepolia. Dual-chain: SKALE Europa as a zero-gas alternative.
>
> This is AP2 v0.2 running inside A2A. First TypeScript implementation. The agent signs an EIP-3009 USDC authorization, sends a PaymentMandate with the same contextId, and the task resumes. Settlement is on-chain. Receipt is in the task artifacts."

**If you have testnet USDC:** Show the PaymentMandate curl completing the flow.
**If not:** Show the CartMandate output with the x402 payment requirements expanded, and explain the next step verbally. The protocol compliance is already proven.

---

## ACT 4 — The Glass Box (2:00–2:40)

**Visual:** Switch to browser. danni.subfrac.cloud/chat interface.

**Voiceover:**

> "That's the agent-to-agent flow. Here's what a human client sees."

**Action:** Show the chat interface. If a previous analysis is cached/available, show the glass-box UI:

> "Five agents. Market Analyst, Competitive Intelligence, Cultural Resonance, Brand Architect, and Danni Synthesis. Each one lights up as it works. Each one's output is visible. You see exactly what your $100 bought.
>
> The agents aren't running generic prompts. Each one encodes specific strategic frameworks — Ogilvy's Big Idea test, Fallon's Ruthlessly Simple Problem, Holt's cultural contradictions. The synthesis finds the intersection. That's The Canon."

**Show:** Agent cards with status indicators, output previews, the synthesis result.

---

## ACT 5 — On-Chain Identity (2:40–3:00)

**Visual:** Terminal, then Base Sepolia block explorer.

**Voiceover:**

> "Every payment closes the reputation loop."

**Action:**

```bash
curl -s https://danni.subfrac.cloud/.well-known/agent-registration.json | jq '{type, agentURI, registrations}'
```

> "Danni is registered on Base Sepolia via ERC-8004. Identity Registry, Reputation Registry. After every settlement, giveFeedback submits a positive reputation score on-chain. Over time, that score is a trust signal — other agents can verify it before committing $100."

---

## ACT 6 — Close (3:00–3:15)

**Visual:** Back to landing page or black screen with text.

**Voiceover:**

> "Five protocols. One application. Strategy, on-chain, whenever your agents need it."

**On screen:** `danni.subfrac.cloud` — the URL, clean, nothing else.

---

## Production Notes

### Terminal Setup
- Dark background (#0a0a0a or similar) to match Danni's UI theme
- Large, readable font (16pt+). Judges watch on laptops
- Use `jq` to filter curl output — show only what matters, not raw JSON walls

### Pacing
- Let outputs breathe. Don't narrate over JSON appearing — pause, let judges read, then explain
- Each curl command: 2-3 seconds to type/appear, 2-3 seconds for response, 5-10 seconds of narration

### Voiceover Tone
- Confident, not breathless. You're showing work you trust
- Match Danni's brand: sophisticated, direct, warm but not soft
- Don't say "we built" every sentence. The work speaks

### What NOT To Show
- Source code. Judges can read the repo. The video proves it works live
- Architecture diagrams. The submission has the mermaid chart. Video is for live proof
- Test output. "350 tests" is a spoken stat, not a screen we watch

### Recording Checklist
- [ ] Clear browser history / bookmarks bar (or use clean profile)
- [ ] Close all other tabs
- [ ] Terminal: no personal info in prompt, clean history
- [ ] Test every curl command BEFORE recording — all respond in <2 seconds
- [ ] Audio levels: voiceover clear, no background noise
- [ ] Resolution: 1920x1080 minimum
