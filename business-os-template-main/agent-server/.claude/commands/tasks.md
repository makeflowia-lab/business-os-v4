---
description: Current tasks on the Mission Control Kanban board
allowed-tools: Bash
---

Query the active tasks from the Mission Control dashboard.

Call the Mission Control endpoint to get tasks that are not archived:
- Use the configured MISSION_CONTROL_URL and MISSION_CONTROL_TOKEN
- Body: { "action": "query_tasks", "limit": 20 }

Present the results grouped by status (inbox, assigned, in_progress, review, done).
For each task show: title, status, priority (if not 0).
Compact format, maximum 20 lines.
