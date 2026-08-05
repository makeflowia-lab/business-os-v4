---
name: google-workspace
description: Google Workspace via gog CLI -- Gmail + Calendar management. Use when the user asks about email, calendar events, scheduling, inbox management, or anything related to Gmail and Google Calendar.
---

# Google Workspace (gog CLI)

## Accounts

Configure your accounts in CLAUDE.md. Example:

| Account | Services | Use |
|---------|----------|-----|
| `your-email@gmail.com` | gmail, calendar | Personal |
| `you@company.com` | calendar | Business |

## Automation Flags

Always use these in cron jobs and scripted contexts:
- `--json` -- machine-readable output
- `--no-input` -- never prompt for user input
- `--max N` -- limit results (default 25 is too many)

## Gmail Commands

```bash
# Search inbox (threads)
gog gmail search "in:inbox newer_than:1d" --account=your-email@gmail.com --max 10 --json

# Search messages (individual emails, not threads)
gog gmail messages search "in:inbox is:unread" --account=your-email@gmail.com --max 10 --json

# Search by label
gog gmail search "label:PROMOTIONS newer_than:7d" --account=your-email@gmail.com --max 50

# List labels
gog gmail labels list --account=your-email@gmail.com --json

# Archive (remove INBOX label)
gog gmail messages modify <messageId> --remove-labels INBOX --account=your-email@gmail.com

# Send email (plain text)
gog gmail send --to recipient@example.com --subject "Subject" --body "Text" --account=your-email@gmail.com

# Send email (multi-line via stdin)
gog gmail send --to recipient@example.com --subject "Subject" --body-file - --account=your-email@gmail.com <<'EOF'
Message body here.
EOF

# Send email (HTML)
gog gmail send --to recipient@example.com --subject "Subject" --body-html "<p>HTML content</p>" --account=your-email@gmail.com
```

## Calendar Commands

```bash
# Today's events (personal)
gog calendar events primary --from $(date +%Y-%m-%dT00:00:00) --to $(date +%Y-%m-%dT23:59:59) --account=your-email@gmail.com --json

# Tomorrow's events (personal)
gog calendar events primary --from $(date -v+1d +%Y-%m-%dT00:00:00) --to $(date -v+1d +%Y-%m-%dT23:59:59) --account=your-email@gmail.com --json

# Today's events (business)
gog calendar events primary --from $(date +%Y-%m-%dT00:00:00) --to $(date +%Y-%m-%dT23:59:59) --account=you@company.com --json

# Create event
gog calendar create primary --summary "Title" --from 2026-03-01T10:00:00 --to 2026-03-01T11:00:00 --account=your-email@gmail.com

# Create event on specific calendar (use calendar ID)
gog calendar create [CALENDAR_ID] --summary "Title" --from 2026-03-01T10:00:00 --to 2026-03-01T11:00:00 --account=your-email@gmail.com
```

## Gmail Cleanup Pattern (cron job)

1. Search each low-value label in inbox:
   - `in:inbox label:PROMOTIONS newer_than:7d`
   - `in:inbox label:NEWSLETTERS newer_than:7d`
   - `in:inbox label:NOTIFICATIONS newer_than:7d`
2. Archive each message (remove INBOX label)
3. Count remaining inbox: `gog gmail search "in:inbox" --max 1 --json` (check total)
4. Return empty string if normal, alert if inbox > 20 or error

## Calendar IDs

Define your calendar IDs in CLAUDE.md. Example:

| Calendar | Calendar ID | Use |
|----------|-------------|-----|
| Personal | `your-email@gmail.com` | Default personal calendar |
| Work | `[CALENDAR_ID]` | Work tasks |
| Exercise | `[CALENDAR_ID]` | Gym / exercise |

## Rules

- NEVER send email without the user's explicit approval
- NEVER delete emails -- only archive (remove INBOX label)
- Confirm destructive calendar actions (delete, modify existing events)
- Use `--account` flag on EVERY command -- never rely on defaults
- Always include timezone offset in dates (e.g., `-06:00`)
