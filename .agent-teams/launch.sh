#!/bin/bash
set -e

echo "=== The Fates — Danni Commerce Agent ==="
echo ""
echo "After Claude opens:"
echo "  1. Paste the prompt from .agent-teams/launch-prompt.md"
echo "  2. Wait for Clotho, Lachesis, Atropos to spawn"
echo "  3. Press Shift+Tab for delegate mode"
echo "  4. Each Fate will launch an OpenCode Sisyphus via tmux"
echo "  5. Go to sleep"
echo ""

cd ~/x402-hackathon/app
claude --model opus --dangerously-skip-permissions
