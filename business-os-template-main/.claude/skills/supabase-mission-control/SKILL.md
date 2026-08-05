---
name: supabase-mission-control
description: |
  Query and manage the Mission Control dashboard database via Supabase.
  Use for tasks, agents, activities, conversations, documents, drawings, notifications,
  and everything related to the operational dashboard.
  Triggers: task, create task, board, kanban, agent, activity, conversation,
  document, draw, notification, push, mission control, dashboard.
allowed-tools: Bash(curl *) Bash(export *) Bash(grep *)
metadata:
  author: agent
  version: "1.0"
  project: mission-control
---

# Mission Control -- Dashboard Database

Direct access to the Mission Control database via Supabase.

## Load Credentials

ALWAYS run this before any query:

```bash
export MC_SUPABASE_KEY=$(grep '^MC_SUPABASE_KEY=' agent-server/.env | cut -d= -f2)
export MC_SUPABASE_PAT=$(grep '^MC_SUPABASE_PAT=' agent-server/.env | cut -d= -f2)
export MC_URL=https://[YOUR_SUPABASE_URL].supabase.co
```

**NOTE**: Replace `[YOUR_SUPABASE_URL]` with your actual Supabase project URL.
The PAT and keys should be stored in your agent-server `.env` file.

## Access

### PostgREST (CRUD operations)
```
URL: $MC_URL/rest/v1/
Auth: -H "apikey: $MC_SUPABASE_KEY" -H "Authorization: Bearer $MC_SUPABASE_KEY"
```

### Management API (raw SQL, logs)
```
URL: https://api.supabase.com/v1/projects/[YOUR_PROJECT_ID]/
Auth: -H "Authorization: Bearer $MC_SUPABASE_PAT"
```

## Tables

### Core (Kanban + Agents)
| Table | Description |
|-------|-------------|
| **tasks** | Board tasks (status: inbox/assigned/in_progress/review/done/archived) |
| **task_assignees** | Task <-> agent relationship |
| **task_labels** | Task <-> label relationship |
| **task_relations** | Dependencies between tasks (blocks, blocked_by) |
| **agents** | Registered agents |
| **labels** | Board labels |

### Activity
| Table | Description |
|-------|-------------|
| **activities** | Activity feed (type, agent, message) |
| **conversations** | Agent <-> system conversations |
| **messages** | Messages within tasks |
| **notifications** | Push notifications |

### Chat
| Table | Description |
|-------|-------------|
| **chat_sessions** | Chat sessions |
| **chat_messages** | Individual messages (role, content, audio_url) |

### Other
| Table | Description |
|-------|-------------|
| **documents** | Documents created by agents |
| **draw** | Excalidraw pages (page_elements: jsonb) |
| **profiles** | Dashboard user profiles |
| **push_subscriptions** | Registered push devices |
| **saved_views** | Saved board views |

## Task Schema (main table)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| title | text | Task title |
| description | text | Detailed description |
| status | text | inbox, assigned, in_progress, review, done, archived |
| priority | integer | 0-4 (0=none, 1=urgent, 2=high, 3=medium, 4=low) |
| tags | text[] | Free tags |
| border_color | text | Visual color |
| due_at | timestamptz | Due date |
| estimate | integer | Estimate (hours) |
| parent_task_id | uuid | Parent task (subtasks) |
| position | integer | Board order |
| sequence_number | integer | Sequential number (#1, #2...) |

## Common Operations

### Create task
```bash
curl -s -X POST "$MC_URL/rest/v1/tasks" \
  -H "apikey: $MC_SUPABASE_KEY" \
  -H "Authorization: Bearer $MC_SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "My task",
    "description": "Details",
    "status": "inbox",
    "priority": 2
  }'
```

### Assign task to agent
```bash
# First get agent_id
curl -s "$MC_URL/rest/v1/agents?select=id,name&name=eq.AgentName" \
  -H "apikey: $MC_SUPABASE_KEY" \
  -H "Authorization: Bearer $MC_SUPABASE_KEY"

# Then assign
curl -s -X POST "$MC_URL/rest/v1/task_assignees" \
  -H "apikey: $MC_SUPABASE_KEY" \
  -H "Authorization: Bearer $MC_SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"task_id": "<task_id>", "agent_id": "<agent_id>"}'
```

### Update task status
```bash
curl -s -X PATCH "$MC_URL/rest/v1/tasks?id=eq.<task_id>" \
  -H "apikey: $MC_SUPABASE_KEY" \
  -H "Authorization: Bearer $MC_SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"status": "done"}'
```

### Log activity
```bash
curl -s -X POST "$MC_URL/rest/v1/activities" \
  -H "apikey: $MC_SUPABASE_KEY" \
  -H "Authorization: Bearer $MC_SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "type": "task_completed",
    "agent_id": "<agent_id>",
    "message": "Completed task X"
  }'
```

### List tasks by status
```bash
curl -s "$MC_URL/rest/v1/tasks?select=id,title,status,priority,created_at&status=eq.in_progress&order=priority.asc,created_at.desc" \
  -H "apikey: $MC_SUPABASE_KEY" \
  -H "Authorization: Bearer $MC_SUPABASE_KEY"
```

### Raw SQL (via Management API)
```bash
curl -s -X POST "https://api.supabase.com/v1/projects/[YOUR_PROJECT_ID]/database/query" \
  -H "Authorization: Bearer $MC_SUPABASE_PAT" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT status, count(*) FROM tasks GROUP BY status"}'
```

### Send push notification
```bash
# Via Mission Control API (not Supabase directly)
curl -s -X POST "https://your-app.vercel.app/api/notifications/send" \
  -H "Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Title", "body": "Message", "url": "/board"}'
```

## PostgREST Filters

| Operator | Meaning | Example |
|----------|---------|---------|
| eq | equals | `status=eq.done` |
| neq | not equal | `status=neq.archived` |
| in | in list | `status=in.(inbox,assigned)` |
| gt / gte | greater | `priority=gt.0` |
| lt / lte | less | `created_at=lte.2026-02-01` |
| order | sort | `order=created_at.desc` |
| limit | limit | `limit=20` |
| cs | contains (arrays) | `tags=cs.{urgent}` |
| Prefer: count=exact | count | Header |

## Environment Variables

```
MC_URL=https://[YOUR_SUPABASE_URL].supabase.co
MC_SUPABASE_KEY=<service_role_key>
MC_SUPABASE_PAT=<personal_access_token>
```

## Rules

1. **Task lifecycle:** inbox -> assigned -> in_progress -> review -> done -> archived
2. **If it's not on the kanban, the user doesn't know about it.** Log work as tasks.
3. **Log activity** after important actions.
4. For push notifications, use the Mission Control API, not Supabase directly.

## Full Schema Reference

Read `references/schema.md` for the complete database schema with all columns and types.
