#!/usr/bin/env bash
# deploy.sh — Deploy Danni Commerce Agent to production
# Usage: ./scripts/deploy.sh [host]
# Default host: localhost (for local production testing)

set -euo pipefail

HOST="${1:-localhost}"
PORT="${PORT:-3000}"

echo "=== Danni Commerce Agent — Deploy ==="
echo "Host: $HOST"
echo "Port: $PORT"

# Step 1: Build
echo ""
echo "--- Building ---"
bun run check
bun run build

# Step 2: Verify build output
if [ ! -f "build/index.js" ]; then
  echo "ERROR: build/index.js not found"
  exit 1
fi

echo ""
echo "--- Build complete ---"
echo ""

# Step 3: Start
if [ "$HOST" = "localhost" ]; then
  echo "Starting local production server on port $PORT..."
  echo "Set USE_CLI=true for Claude CLI backend or USE_CLI=false with ANTHROPIC_API_KEY for API backend"
  echo ""
  PORT=$PORT bun build/index.js
else
  echo "Remote deployment to $HOST not yet configured."
  echo "To deploy manually:"
  echo "  1. rsync -avz --exclude node_modules --exclude .svelte-kit . $HOST:/opt/danni/"
  echo "  2. ssh $HOST 'cd /opt/danni && bun install --frozen-lockfile && bun run build'"
  echo "  3. ssh $HOST 'cd /opt/danni && PORT=$PORT bun build/index.js'"
fi
