# Todo Scheduler

A task manager that doesn't just list what you have to do — it tells you what to do **next**, and lets AI agents schedule work on your behalf while you rate how well they estimated it.

**🔗 Live demo: [todo-scheduler-kappa.vercel.app](https://todo-scheduler-kappa.vercel.app)**

Click **"✨ Kokeile demoa ilman tunnuksia"** on the login page — it instantly logs you into a fresh account pre-loaded with sample tasks (no signup, no email, nothing to remember). You'll see the priority engine, an agent-created task with a badge, and a completed task with feedback already given, all in one view.

## What it does

- **Priority scoring** — every task has an estimated duration, a relevance rating (1–5), and an optional deadline. A scoring function combines deadline urgency with relevance to rank tasks and surface a single "do this next" recommendation, instead of leaving you to stare at a flat list.
- **AI agent integration (MCP)** — a standalone [Model Context Protocol](https://modelcontextprotocol.io) server lets agents (Claude Desktop, Claude Code, or anything MCP-compatible) create and update tasks on your behalf, authenticated with a per-user API key you generate from the app.
- **Feedback loop for agents** — when an agent-created task is completed, the app asks you to rate how accurate its time/relevance estimate was. Low ratings (≤3) require a short comment explaining why, so agents pull back richer signal than a bare number — enough to actually reason about what kinds of work they systematically under- or over-estimate.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Express + TypeScript, deployed as a single Vercel Function |
| Database | MongoDB Atlas (Mongoose) |
| Auth | Custom JWT in an httpOnly cookie (not localStorage — see [Security notes](#security-notes)) |
| Agent integration | `@modelcontextprotocol/sdk`, stdio transport |
| Hosting | Vercel |

## Repository layout

```
todo-scheduler/
├── api/            Vercel Function entrypoint (wraps the Express app)
├── server/         Express + TypeScript backend (routes, models, priority logic)
├── client/         React + TypeScript + Tailwind frontend
├── mcp-server/     Standalone MCP server for AI agents
└── vercel.ts       Routing/build config for Vercel
```

## How the priority score works

```
score = 0.5 × (relevance / 5) + 0.5 × urgency
```

`urgency` saturates to `1` once a deadline has passed, decays linearly as the deadline moves further than 14 days out, and defaults to a low constant (`0.15`) for tasks with no deadline at all — so undated tasks don't dominate but also don't get lost. See `server/src/utils/priority.ts`.

## API overview

| Route | Method | Auth | What it does |
|---|---|---|---|
| `/api/auth/register`, `/login` | POST | — | Create an account / sign in, sets the session cookie |
| `/api/auth/demo` | POST | — | Spins up a throwaway demo account pre-loaded with sample tasks |
| `/api/auth/logout` | POST | cookie | Clears the session |
| `/api/tasks` | GET / POST | cookie or API key | List (ranked) / create tasks |
| `/api/tasks/next` | GET | cookie or API key | The single best task to do next |
| `/api/tasks/feedback` | GET | cookie or API key | Agent-created tasks with the user's accuracy rating |
| `/api/tasks/:id` | PATCH / DELETE | cookie or API key | Update (status, feedback, etc.) / delete a task |
| `/api/api-keys` | GET / POST | cookie | List / generate agent API keys |
| `/api/api-keys/:id` | DELETE | cookie | Revoke a key |

Web sessions authenticate via an httpOnly cookie; agents authenticate via a `tsk_...` bearer token in the `Authorization` header. Both paths converge on the same `req.userId`, so task logic doesn't need to know which one it's talking to.

## Using the MCP server

1. Log in, go to **API-avaimet** (API keys), and generate a key.
2. Build the MCP server: `npm run build -w mcp-server`.
3. Point your MCP client at it, e.g. in Claude Desktop's config:

```json
{
  "mcpServers": {
    "todo-scheduler": {
      "command": "node",
      "args": ["/absolute/path/to/todo-scheduler/mcp-server/dist/index.js"],
      "env": {
        "TODO_SCHEDULER_API_URL": "https://todo-scheduler-kappa.vercel.app",
        "TODO_SCHEDULER_API_KEY": "tsk_..."
      }
    }
  }
}
```

The server exposes `list_tasks`, `get_next_task`, `create_task`, `update_task_status`, and `get_estimate_feedback`.

## Security notes

The JWT lives in an httpOnly, `sameSite=lax` cookie rather than `localStorage` — client-side JS never sees it, which closes the usual XSS-token-theft vector. Agent API keys are a separate mechanism (bearer header), since that flow never touches a browser.

## Local development

Requires Node 20+, a MongoDB connection string, and the [Vercel CLI](https://vercel.com/docs/cli) if you want to pull env vars.

```bash
npm install
vercel link          # first time only
vercel env pull .env.local
npm run dev           # runs client (Vite) + server (tsx watch) together
```

The client dev server proxies `/api/*` to the local Express server, so both run under the same origin during development.

## Known limitations

- Demo accounts (`/api/auth/demo`) aren't automatically purged — fine for a portfolio demo, would need a cleanup job for real multi-tenant use.
- No password reset flow.
- MCP transport is stdio-only (local agent clients); no remote/HTTP MCP transport yet.
