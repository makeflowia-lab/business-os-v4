#!/bin/bash
# Backup Workspace - Archive key agent-server files
# Creates timestamped tar.gz in store/backups/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

BACKUP_DIR="$PROJECT_DIR/store/backups"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
ARCHIVE="${BACKUP_DIR}/agent_backup_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

# Archive: CLAUDE.md + store/agent-server.db + scripts/analytics + .env (if exists)
INCLUDE_FILES=()
[[ -f "$PROJECT_DIR/CLAUDE.md" ]] && INCLUDE_FILES+=("CLAUDE.md")
[[ -f "$PROJECT_DIR/store/agent-server.db" ]] && INCLUDE_FILES+=("store/agent-server.db")
[[ -d "$PROJECT_DIR/scripts/analytics" ]] && INCLUDE_FILES+=("scripts/analytics")
[[ -f "$PROJECT_DIR/.env" ]] && INCLUDE_FILES+=(".env")

tar -czf "$ARCHIVE" -C "$PROJECT_DIR" "${INCLUDE_FILES[@]}" 2>/dev/null

if [ $? -eq 0 ]; then
  SIZE=$(du -h "$ARCHIVE" | cut -f1)
  echo "Backup created: $ARCHIVE (${SIZE})"
else
  echo "ERROR: Could not create backup"
  exit 1
fi

# Retain last 20 backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/agent_backup_*.tar.gz 2>/dev/null | wc -l | tr -d ' ')
if [ "$BACKUP_COUNT" -gt 20 ]; then
  REMOVE_COUNT=$((BACKUP_COUNT - 20))
  ls -1t "$BACKUP_DIR"/agent_backup_*.tar.gz | tail -n "$REMOVE_COUNT" | xargs rm -f
fi

echo "Backup complete. Total archived: $(ls -1 "$BACKUP_DIR"/agent_backup_*.tar.gz 2>/dev/null | wc -l | tr -d ' ')"
