---
description: Live status of all agents in Mission Control
allowed-tools: Bash
---

Query the current status of all agents.

Call the Mission Control endpoint:
- Use the configured MISSION_CONTROL_URL and MISSION_CONTROL_TOKEN
- Body: { "action": "query_agents" }

Present each agent with:
- Name, role, status (idle/active/blocked)
- Current task (if any)
- Level

Simple table format. Maximum 10 lines.
