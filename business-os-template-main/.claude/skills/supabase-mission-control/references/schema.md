# Mission Control -- Complete Database Schema

## Project: [YOUR_PROJECT_ID]
## URL: https://[YOUR_SUPABASE_URL].supabase.co

## Tables

### activities
- id: uuid, type: text, agent_id: uuid, message: text, target_id: uuid, tenant_id: text, created_at: timestamptz, search_vector: tsvector

### agents
- id: uuid, name: text, role: text, status: text, level: text, avatar: text, current_task_id: uuid, session_key: text, system_prompt: text, character: text, lore: text, tenant_id: text, created_at: timestamptz, updated_at: timestamptz

### chat_messages
- id: uuid, session_id: uuid, role: text, content: text, created_at: timestamptz, audio_url: text

### chat_sessions
- id: uuid, title: text, created_at: timestamptz, updated_at: timestamptz, is_favorite: boolean

### conversations
- id: uuid, run_id: text, agent_id: uuid, prompt: text, response: text, source: text, error: text, status: text, started_at: timestamptz, ended_at: timestamptz, created_at: timestamptz

### documents
- id: uuid, title: text, content: text, type: text, path: text, task_id: uuid, created_by_agent_id: uuid, tenant_id: text, created_at: timestamptz, updated_at: timestamptz, search_vector: tsvector

### draw
- page_id: uuid, user_id: uuid, name: text, page_elements: jsonb, is_deleted: boolean, created_at: timestamptz, updated_at: timestamptz

### labels
- id: uuid, name: text, color: text, tenant_id: text, created_at: timestamptz

### message_attachments
- id: uuid, message_id: uuid, document_id: uuid

### messages
- id: uuid, task_id: uuid, from_agent_id: uuid, content: text, tenant_id: text, created_at: timestamptz

### notifications
- id: uuid, mentioned_agent_id: uuid, content: text, delivered: boolean, tenant_id: text, created_at: timestamptz

### profiles
- id: uuid, full_name: text, avatar_url: text, created_at: timestamptz, updated_at: timestamptz, role: text, email: text

### push_subscriptions
- id: uuid, user_id: uuid, endpoint: text, p256dh: text, auth: text, created_at: timestamptz, updated_at: timestamptz

### saved_views
- id: uuid, name: text, filters: jsonb, view_type: text, is_default: boolean, tenant_id: text, created_at: timestamptz

### task_assignees
- id: uuid, task_id: uuid, agent_id: uuid, assigned_at: timestamptz

### task_labels
- id: uuid, task_id: uuid, label_id: uuid

### task_relations
- id: uuid, source_task_id: uuid, target_task_id: uuid, relation_type: text, created_at: timestamptz

### tasks
- id: uuid, title: text, description: text, status: text, tags: text[], border_color: text, session_key: text, openclaw_run_id: text, started_at: timestamptz, used_coding_tools: boolean, tenant_id: text, created_at: timestamptz, updated_at: timestamptz, search_vector: tsvector, priority: integer, due_at: timestamptz, estimate: integer, parent_task_id: uuid, position: integer, sequence_number: integer

## Task Status Flow
inbox -> assigned -> in_progress -> review -> done -> archived

## Task Priority
0 = none, 1 = urgent, 2 = high, 3 = medium, 4 = low
