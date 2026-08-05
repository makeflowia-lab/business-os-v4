# Sistema PRP (Product Requirements Proposal)

> **Los Blueprints del Centro de Mando** - Contract between human and AI before writing code

---

## What is a PRP

A PRP is the **blueprint for a piece of the system**. It defines WHAT to build before writing a single line of code.

| Section | Purpose | Responsible |
|---------|---------|-------------|
| **Objective** | What gets built (final state) | Human defines |
| **Why** | Business value | Human defines |
| **What** | Behavior + success criteria | Human + AI |
| **Context** | Docs, references, existing code | AI investigates |
| **Blueprint** | Implementation phases (no subtasks) | AI generates |
| **Learnings** | Self-shielding - errors and fixes | AI updates |

---

## Workflow

```
1. Human: "I need [feature]"
2. AI: Investigate context and feasibility
3. AI: Generate PRP-XXX-name.md using this template
4. Human: Review and approve
5. AI: Execute Blueprint phase by phase (see bucle-agentico-blueprint.md)
6. AI: Document learnings in the PRP (Self-Shielding)
```

---

## Naming

- Files: `PRP-[NUMBER]-[description-kebab].md`
- States: `PENDING` -> `APPROVED` -> `IN PROGRESS` -> `COMPLETED`

---

# TEMPLATE PRP

```markdown
# PRP-XXX: [Title]

> **State**: PENDING
> **Date**: YYYY-MM-DD
> **Project**: Mission Control

---

## Objective

[What gets built - desired final state in 1-2 sentences]

## Why

| Problem | Solution |
|---------|----------|
| [User pain] | [How this feature solves it] |

**Business value**: [Measurable impact]

## What

### Success Criteria
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
- [ ] [Measurable criterion 3]

### Expected Behavior
[Description of the main flow - Happy Path]

---

## Context

### References
- `Mission-Control/src/features/` - Existing feature patterns to follow
- `agent-server/` - Agent server source code
- `your-project/src/features/[existing]/` - Pattern to follow

### Proposed Architecture (Feature-First)
```
Mission-Control/src/features/[new-feature]/
├── components/
├── hooks/
├── services/
└── types/
```

### Data Model (if applicable)
```sql
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
```

---

## Blueprint (Assembly Line)

> IMPORTANT: Only define PHASES. Subtasks are generated when entering each phase
> following the agentic loop (map context -> generate subtasks -> execute)

### Phase 1: [Name]
**Objective**: [What is achieved when this phase completes]
**Validation**: [How to verify it's complete]

### Phase 2: [Name]
**Objective**: [What is achieved]
**Validation**: [How to verify]

### Phase N: Final Validation
**Objective**: System working end-to-end
**Validation**:
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] Playwright screenshot confirms UI
- [ ] Success criteria met

---

## Learnings (Self-Shielding)

> This section GROWS with each error found during implementation.

### [YYYY-MM-DD]: [Learning title]
- **Error**: [What failed]
- **Fix**: [How it was fixed]
- **Apply to**: [Where else this applies]

---

## Gotchas

- [ ] [Gotcha 1]
- [ ] [Gotcha 2]

## Anti-Patterns

- DO NOT create new patterns if existing ones work
- DO NOT ignore TypeScript errors
- DO NOT hardcode values (use constants)
- DO NOT skip Zod validation on user inputs
- DO NOT copy code from reference projects (adapt to your stack)

---

*PRP pending approval. No code has been modified.*
```

---

## Stack (Golden Path)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase (Auth + DB + Realtime) |
| AI Engine | Vercel AI SDK v5 + OpenRouter |
| Validation | Zod |
| State | Zustand |
| Real-time | Supabase Realtime |
| Testing | Playwright MCP |
