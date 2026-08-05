# Business OS

An AI-powered operating system for your business. Three production-ready components that work together or independently.

```
You (Browser / Telegram / Phone)
    |
    ├── Mission Control ──> Web dashboard (PWA)
    |       ├── Kanban board, AI chat, activity feed
    |       ├── Cron job management, calendar, drawing
    |       └── Chat ──→ Agent Server (localhost:3099)
    |
    ├── Agent Server ──> Claude Code on your machine
    |       ├── Telegram bot (talk to your AI from anywhere)
    |       ├── Dual-sector memory (learns about you over time)
    |       ├── Cron scheduler (daily briefings, autonomous tasks)
    |       └── Voice I/O (speech-to-text + text-to-speech)
    |
    └── Finance OS ──> Personal finance tracker
            ├── Transactions, recurring expenses
            ├── Reports, charts, budgets
            └── AI CFO agent
```

## AI-Assisted Setup (Recommended)

The fastest way to get started. Open Claude Code in this directory and paste the setup prompt:

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/business-os.git
cd business-os

# 2. Open Claude Code
claude

# 3. Paste the setup prompt
cat docs/SETUP_PROMPT.md
# Then tell Claude: "Set me up"
```

Claude will walk you through everything: choosing components, creating your Supabase database, configuring API keys, setting up your Telegram bot, installing the background service, and personalizing your AI assistant. Usually under 15 minutes.

## Manual Setup

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and logged in (for Agent Server)
- A Telegram account (for Agent Server — 2 minutes to create a bot via [@BotFather](https://t.me/BotFather))

### 1. Mission Control

Web dashboard with Kanban board, AI chat, cron jobs, calendar, and Excalidraw drawing. Installable as a PWA on your phone.

```bash
cd Mission-Control
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm install && npm run dev
```

Create the database tables by running the SQL from `docs/SETUP_PROMPT.md` (Section 3A) in your [Supabase SQL Editor](https://supabase.com/dashboard).

**Key environment variables:**
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (keep secret) |
| `ALLOWED_EMAILS` | Yes | Comma-separated emails allowed to log in |
| `AGENT_URL` | No | Agent Server URL (default: `http://localhost:3099`) |
| `OPENCLAW_GATEWAY_TOKEN` | No | Shared secret for Agent Server communication |

### 2. Agent Server

Persistent AI agent that runs on your machine. Talk to it via Telegram, and it runs the real Claude Code CLI with all your tools, skills, and context. Not a chatbot wrapper — it literally spawns the same `claude` process you use in your terminal.

```bash
cd agent-server
cp .env.example .env
# Edit .env with your Telegram bot token
npm install && npm run dev
```

**Key environment variables:**
| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | From [@BotFather](https://t.me/BotFather) |
| `ALLOWED_CHAT_ID` | Yes | Your Telegram chat ID (send `/chatid` to the bot) |
| `GROQ_API_KEY` | No | Voice transcription ([free at Groq](https://console.groq.com)) |
| `ELEVENLABS_API_KEY` | No | Voice replies ([free tier at ElevenLabs](https://elevenlabs.io)) |
| `ELEVENLABS_VOICE_ID` | No | Voice to use for TTS replies |
| `MISSION_CONTROL_URL` | No | Webhook URL for Mission Control integration |
| `MISSION_CONTROL_TOKEN` | No | Must match MC's `OPENCLAW_GATEWAY_TOKEN` |
| `SCHEDULER_TZ` | No | Timezone for cron jobs (default: UTC) |

**Run as a background service** (starts on boot, auto-restarts):

```bash
# macOS
# See docs/SETUP_PROMPT.md Section 8 for launchd plist template

# Linux
# See docs/SETUP_PROMPT.md Section 8 for systemd service template

# Windows
npm install -g pm2 && pm2 start dist/index.js --name agent-server && pm2 save && pm2 startup
```

### 3. Finance OS

Personal finance tracker with transaction management, recurring expense tracking, reports, and an AI CFO agent.

```bash
cd finance-os
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm install && npm run dev
```

Create the database tables by running the SQL from `docs/SETUP_PROMPT.md` (Section 3B) in your Supabase SQL Editor.

**Key environment variables:**
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `OPENROUTER_API_KEY` | No | For AI CFO agent ([openrouter.ai](https://openrouter.ai)) |

## Components at a Glance

| | Mission Control | Agent Server | Finance OS |
|---|---|---|---|
| **What** | Web dashboard | AI agent on your machine | Finance tracker |
| **Stack** | Next.js 16, Supabase, Zustand | Claude Agent SDK, grammY, SQLite | Next.js 16, Supabase |
| **Interface** | Browser / PWA | Telegram / HTTP API | Browser |
| **Database** | Supabase (PostgreSQL) | SQLite (local) | Supabase (PostgreSQL) |
| **Deploy** | Vercel | Your machine | Vercel |
| **Standalone** | Yes | Yes | Yes |

## Customization

**Personalize your AI:** Edit `CLAUDE.md` in the root directory. This is the system prompt for your AI assistant across all components. Includes sections for golden rules, historical errors, and credentials.

**Add cron jobs:**
```bash
cd agent-server
npx tsx src/schedule-cli.ts create "Your daily briefing prompt" "0 9 * * *" YOUR_CHAT_ID
npx tsx src/schedule-cli.ts list
```

**Add Claude Code skills:** Place them in `.claude/skills/` and they're automatically available. Bundled skills include:

| Skill | What it does |
|-------|-------------|
| `skill-creator` | Anthropic's official framework for creating, testing, and iterating on new skills |
| `excalidraw-diagram` | Generate Excalidraw diagrams as JSON and render to PNG |
| `google-workspace` | Gmail + Calendar management via gog CLI |
| `supabase-mission-control` | Direct Supabase database operations for Mission Control |
| `image-generation` | AI image generation with OpenRouter/Gemini, with Draw canvas injection |

**PRP system:** Use `.claude/PRPs/prp-base.md` as a template for Product Requirements Proposals -- structured feature blueprints that define WHAT to build before writing code.

**Development methodology:** See `.claude/prompts/bucle-agentico-blueprint.md` for the Blueprint methodology -- a phase-based approach for complex implementations with just-in-time context mapping.

**Customize finance accounts:** Edit `finance-os/src/features/finances/types/index.ts` (the `CUENTAS` array) and update the seed data in your Supabase `cuentas` table.

## Security

Mission Control includes built-in security layers:

- **Input validation** with Zod schemas on all API routes
- **SSRF protection** on the agent server HTTP bridge
- **Row Level Security (RLS)** on all Supabase tables
- **Email allowlist** for authentication (`ALLOWED_EMAILS`)
- **Gateway token** for agent server communication (`OPENCLAW_GATEWAY_TOKEN`)
- **Ops logging** via the activities table for audit trails

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) + SQLite |
| State | Zustand |
| AI Agent | Claude Agent SDK |
| Bot | grammY (Telegram) |
| Voice | Groq Whisper (STT), ElevenLabs (TTS) |
| Search | FTS5 (full-text search on memories) |

## License

MIT
