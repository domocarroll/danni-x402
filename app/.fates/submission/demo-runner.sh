#!/bin/bash
# ─── Danni Demo Recording Runner ─────────────────────────────────────────────
# Run this in a clean terminal during screen recording.
# Press ENTER to advance to each step. Narrate between steps.
# Terminal: dark bg (#0a0a0a), large font (16pt+), no personal info in prompt.
# ─────────────────────────────────────────────────────────────────────────────

DANNI="https://danni.subfrac.cloud"

clear
echo ""
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║   DANNI — Demo Recording Ready               ║"
echo "  ║   Press ENTER to advance each step            ║"
echo "  ╚══════════════════════════════════════════════╝"
echo ""

# ─── ACT 2: Discovery ────────────────────────────────────────────────────────

read -p "▶ [ACT 2] Agent Card discovery — press ENTER"
echo ""
echo "$ curl $DANNI/.well-known/agent.json | jq '...'"
echo ""
curl -s "$DANNI/.well-known/agent.json" | jq '{
  name,
  skills: [.skills[].id],
  pricing: .x402.pricing,
  extensions: [.capabilities.extensions[].uri | split("/") | last]
}'
echo ""

read -p "▶ [ACT 2] MCP tools/list — press ENTER"
echo ""
echo "$ curl -X POST $DANNI/api/mcp -d '{\"method\":\"tools/list\"}' | jq '...'"
echo ""
curl -s -X POST "$DANNI/api/mcp" \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq '.result.tools[] | {name, price: .annotations.x402.price, network: .annotations.x402.network}'
echo ""

# ─── ACT 3: AP2 Payment Flow ─────────────────────────────────────────────────

read -p "▶ [ACT 3] IntentMandate → CartMandate — press ENTER"
echo ""
echo '$ curl -X POST $DANNI/api/a2a -d '"'"'{"method":"SendMessage", "params":{IntentMandate}}'"'"' | jq '"'"'...'"'"''
echo ""
RESPONSE=$(curl -s -X POST "$DANNI/api/a2a" \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc":"2.0","id":1,"method":"SendMessage",
    "params":{"message":{"role":"user","parts":[{
      "type":"data","mimeType":"application/json",
      "data":{"type":"ap2.mandates.IntentMandate",
              "skillId":"brand-analysis",
              "description":"Analyze the brand positioning of Notion in the productivity space"}
    }]}}
  }')

echo "$RESPONSE" | jq '{
  taskId: .result.task.id,
  state: .result.task.status.state,
  contextId: .result.task.contextId,
  paymentStatus: .result.task.status.message.metadata["x402.payment.status"]
}'
echo ""

read -p "▶ [ACT 3] Show CartMandate details — press ENTER"
echo ""
echo "$RESPONSE" | jq '.result.task.artifacts[0].parts[0].data.contents'
echo ""

read -p "▶ [ACT 3] Show x402 payment requirements — press ENTER"
echo ""
echo "$RESPONSE" | jq '.result.task.artifacts[0].parts[0].data.paymentRequest.methodData.x402.paymentRequirements[] | {scheme, network, maxAmountRequired, resource, description}'
echo ""

# ─── ACT 5: ERC-8004 Identity ────────────────────────────────────────────────

read -p "▶ [ACT 5] ERC-8004 registration — press ENTER"
echo ""
echo "$ curl $DANNI/.well-known/agent-registration.json | jq '...'"
echo ""
curl -s "$DANNI/.well-known/agent-registration.json" | jq '{
  type,
  agentURI,
  name,
  registrations: [.registrations[] | {registry: .agentRegistry}],
  reputation: [.services[] | select(.name == "Reputation") | {endpoint: .endpoint}]
}'
echo ""

# ─── END ──────────────────────────────────────────────────────────────────────

read -p "▶ [DONE] All protocol demos complete — press ENTER to clear"
clear
echo ""
echo "  danni.subfrac.cloud"
echo ""
