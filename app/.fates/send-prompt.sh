#!/usr/bin/env bash
# send-prompt.sh — Reliable prompt delivery to OpenCode via tmux
# Usage: .fates/send-prompt.sh <session-name> <prompt-file>
# Example: .fates/send-prompt.sh clotho-sisyphus .fates/prompts/phase3-data-broker.txt
#
# Solves: tmux send-keys with long text is flaky in TUI apps.
# Method: load-buffer + paste-buffer handles arbitrary length reliably,
# then a separate Enter keystroke to submit.

set -euo pipefail

SESSION="${1:?Usage: send-prompt.sh <tmux-session> <prompt-file>}"
PROMPT_FILE="${2:?Usage: send-prompt.sh <tmux-session> <prompt-file>}"

if ! tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "ERROR: tmux session '$SESSION' does not exist"
  exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
  echo "ERROR: prompt file '$PROMPT_FILE' does not exist"
  exit 1
fi

echo "Loading prompt from $PROMPT_FILE into tmux buffer..."
tmux load-buffer "$PROMPT_FILE"

echo "Pasting into session $SESSION..."
tmux paste-buffer -t "$SESSION"

# Small delay to let the TUI process the paste
sleep 1

echo "Sending Enter to submit..."
tmux send-keys -t "$SESSION" Enter

echo "Done. Prompt delivered to $SESSION."
