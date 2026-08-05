---
description: Agent status — active model, current session, tasks in progress
allowed-tools: Bash
---

Respond with a concise status summary. Include:

1. **Model**: which model you're currently using
2. **Session**: current session ID (if available)
3. **Cron jobs active**: list the configured jobs from the scheduler
4. **Tasks in progress**: check Mission Control for tasks with status `in_progress` (if available)
5. **Timestamp**: current time in the configured timezone

Respond in less than 15 lines. Clean format, no unnecessary markdown.
