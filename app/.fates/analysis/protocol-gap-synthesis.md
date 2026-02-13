# Protocol Gap Synthesis — The Semantic Web
## Compiled: 2026-02-13 ~21:30 AEST | 4 Research Agents | ~20 hours to deadline

---

## The Ecosystem Map

```
                    TRUST LAYER
                    ┌──────────────────────────────┐
                    │  ERC-8004: Trustless Agents   │
                    │  Identity → Reputation → Validation
                    │  Base Sepolia: 0x8004A818...  │
                    └──────────┬───────────────────┘
                               │ "Should I trust this agent?"
                               ▼
    DISCOVERY          COMMUNICATION           PAYMENT
    ┌──────────┐      ┌──────────────┐      ┌──────────────┐
    │ Agent    │      │   A2A v0.3   │      │  x402 v2     │
    │ Card     │─────▶│  JSON-RPC    │─────▶│  HTTP 402    │
    │ /.well-  │      │  SendMessage │      │  EIP-3009    │
    │ known/   │      │  GetTask     │      │  Base Sepolia│
    └──────────┘      └──────┬───────┘      └──────┬───────┘
                             │                     │
                     ┌───────┴───────┐     ┌───────┴───────┐
                     │   MCP v1.0    │     │  @x402/fetch  │
                     │  tools/list   │     │  Auto 402     │
                     │  tools/call   │     │  Sign+Retry   │
                     └───────────────┘     └───────────────┘
```

**Key insight:** These are not independent protocols. They form a stack:
- ERC-8004 answers: "Who is this agent? Can I trust it?"
- A2A/MCP answers: "How do I talk to it?"
- x402 answers: "How do I pay it?"
- AP2 (Google) is the agent payments orchestration layer connecting A2A ↔ x402

---

## Gap Analysis: What We Have vs What We Need

### 1. x402 Payment Flow (CRITICAL — This is THE hackathon)

| Layer | Status | Gap |
|-------|--------|-----|
| Server-side middleware | SOLID | hooks.server.ts correctly uses x402HTTPResourceServer |
| Client-side fetch | SIMULATED | chat/+page.svelte fakes 402→sign→retry with delays |
| Payment headers | MISSING | No PAYMENT-SIGNATURE header sent by frontend |
| Settlement receipt | MISSING | txHash randomly generated, not from PAYMENT-RESPONSE header |
| @x402/fetch package | NOT INSTALLED | Need `bun add @x402/fetch` |
| Wallet connect | NOT IMPLEMENTED | Need viem WalletClient with window.ethereum |

**Fix:** Install @x402/fetch, create wallet store, wire real 402 flow into chat page.
**Effort:** 2-3 hours. **Impact:** CRITICAL — without this, we're demoing fake payments at an x402 hackathon.

### 2. A2A Protocol Compliance

| Component | Status | Gap |
|-----------|--------|-----|
| Method names | WRONG | `message/send` → should be `SendMessage` (PascalCase) |
| Agent Card auth | WRONG | `authentication.schemes` → should be `capabilities.extensions` |
| Agent Card url | DEPRECATED | Top-level `url` removed in v1.0 |
| Error codes | WRONG | -32003/-32004 swapped |
| Response envelope | WRONG | Returns raw Task, should wrap in `{ task: {...} }` |
| x402 in A2A | MISSING | Payment should flow via A2A metadata, not just HTTP headers |
| messageId | OPTIONAL | Should be REQUIRED |
| Streaming | DECLARED | `streaming: true` in card but not implemented via A2A SSE |

**Fix:** Rename methods, fix Agent Card, fix error codes, add response envelope, add x402 metadata flow.
**Effort:** 3-4 hours total. **Impact:** HIGH — judges from Google (A2A authors) will check this.

### 3. MCP Transport Compliance

| Component | Status | Gap |
|-----------|--------|-----|
| tools/list | IMPLEMENTED | OK |
| tools/call | IMPLEMENTED | OK |
| _meta["x402/payment"] | UNKNOWN | Need to verify payment metadata handling |
| Payment required signal | UNKNOWN | Should use isError + structuredContent |

**Fix:** Verify and update MCP handler for x402 transport spec.
**Effort:** 1-2 hours. **Impact:** MEDIUM — MCP server is a separate track/tag.

### 4. ERC-8004 Integration (NEW — Not Currently Implemented)

| Component | Status | What's Needed |
|-----------|--------|--------------|
| Identity Registry | NOT DONE | Register Danni as NFT on Base Sepolia |
| Agent Registration File | NOT DONE | JSON at /.well-known/agent-registration.json |
| Reputation Registry | NOT DONE | Submit feedback after consultations |
| x402Support flag | NOT DONE | Set in agent registration file |
| Contract addresses | KNOWN | Identity: 0x8004A818BFB912233c491871b3d84c89A494BD9e |
| | | Reputation: 0x8004B663056A597Dffe9eCcC1965A193B7388713 |

**Fix:** Register Danni on-chain, create agent registration file, wire reputation feedback.
**Effort:** 4-6 hours. **Impact:** HIGH — ERC-8004 is a hackathon tag AND differentiator.

### 5. AP2 (Google Agent Payments Protocol)

| Component | Status | What's Needed |
|-----------|--------|--------------|
| Understanding | PARTIAL | AP2 is the bridge between A2A and x402 |
| Implementation | NOT DONE | Need to research AP2 spec further |

**Fix:** Research AP2 spec, determine if it's separate from A2A x402 extension.
**Effort:** Unknown. **Impact:** MEDIUM-HIGH — Google is a sponsor.

---

## Priority Matrix: 20 Hours Left

| Priority | Task | Effort | Impact | Who |
|----------|------|--------|--------|-----|
| P0 | Wire @x402/fetch into frontend (real payments) | 2-3h | CRITICAL | Stream 1 |
| P0 | Fix A2A method names + Agent Card + error codes | 1-2h | HIGH | Stream 2 |
| P1 | A2A x402 payment metadata flow | 2-3h | HIGH | Stream 2 |
| P1 | ERC-8004 identity registration | 3-4h | HIGH | Stream 3 |
| P1 | A2A response envelope fix | 30min | MEDIUM | Stream 2 |
| P2 | MCP x402 transport compliance | 1-2h | MEDIUM | Stream 2 |
| P2 | ERC-8004 reputation feedback | 2h | MEDIUM | Stream 3 |
| P2 | Visual polish (original Stream 1 tasks) | 2-3h | MEDIUM | Stream 1 |
| P3 | Demo video recording | 1h | CRITICAL | Dom |
| P3 | DoraHacks submission | 30min | CRITICAL | Dom |

---

## Recommended Night Watch Strategy

### Stream 1 (Clotho/Alpha): x402 Client-Side + Visual Polish
1. `bun add @x402/fetch`
2. Create `src/lib/stores/wallet.svelte.ts` (viem WalletClient, window.ethereum)
3. Create `src/lib/x402/client.ts` (walletToSigner bridge, createPaymentFetch)
4. Rewire `src/routes/chat/+page.svelte` — replace simulated payment with real 402 flow
5. Extract settlement receipt from PAYMENT-RESPONSE header for real txHash
6. THEN do visual polish: scroll-to-bottom, loading states, markdown rendering

### Stream 2 (Lachesis/Beta): A2A + MCP Compliance
1. Fix Agent Card schema (capabilities.extensions, remove deprecated fields)
2. Rename JSON-RPC methods to PascalCase
3. Fix error codes
4. Add response envelope wrapper
5. Implement x402 payment metadata flow inside A2A protocol
6. Verify MCP handler against x402 transport spec

### Stream 3 (Atropos/Gamma): ERC-8004 + Deploy
1. Research ERC-8004 contracts on Base Sepolia
2. Write registration script (register Danni identity via viem)
3. Create agent-registration.json at /.well-known/
4. Wire reputation feedback after analysis completion
5. Deploy to VPS or set up tunnel for demo

---

## The Story for Judges

"Danni demonstrates the complete agentic commerce stack:
- **ERC-8004** for on-chain identity and reputation (trust)
- **A2A** for agent-to-agent discovery and communication (interop)
- **MCP** for tool-based integration with AI frameworks (tooling)
- **x402** for HTTP-native stablecoin payments (payment)
- All on **Base Sepolia** with real USDC settlement

No other entry will show the full loop: discover → trust → communicate → pay → deliver → rate."
