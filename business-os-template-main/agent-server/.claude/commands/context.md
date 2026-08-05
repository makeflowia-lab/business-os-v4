---
description: Context usage — how many tokens the current conversation is using
---

Respond with a summary of the current conversation's context usage.

Include:
1. **Estimated tokens** in the current conversation (if you have access to this data)
2. **Maximum context** for the model you're using
3. **% used** = current tokens / maximum
4. **Recommendation**: if above 70%, suggest `/compact`

If you don't have exact token numbers, make an estimate based on the number of messages in the conversation and average size.

Respond in less than 8 lines.
