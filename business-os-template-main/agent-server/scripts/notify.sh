#!/usr/bin/env bash
# notify.sh — Envía un mensaje a Telegram desde la línea de comandos.
# Uso: scripts/notify.sh <chatId> <mensaje> [threadId]
#
# Variables requeridas: TELEGRAM_BOT_TOKEN en el .env del directorio padre.

set -euo pipefail

# Cargar .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
fi

CHAT_ID="${1:-}"
MESSAGE="${2:-}"
THREAD_ID="${3:-}"

if [[ -z "$CHAT_ID" || -z "$MESSAGE" ]]; then
  echo "Usage: $0 <chatId> <message> [threadId]" >&2
  exit 1
fi

if [[ -z "${TELEGRAM_BOT_TOKEN:-}" ]]; then
  echo "Error: TELEGRAM_BOT_TOKEN not set" >&2
  exit 1
fi

PAYLOAD=$(python3 -c "
import json, sys
data = {
    'chat_id': sys.argv[1],
    'text': sys.argv[2],
    'parse_mode': 'HTML'
}
if sys.argv[3]:
    data['message_thread_id'] = int(sys.argv[3])
print(json.dumps(data))
" "$CHAT_ID" "$MESSAGE" "$THREAD_ID")

curl -s -X POST \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  > /dev/null

echo "Message sent to $CHAT_ID"
