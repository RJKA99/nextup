# Todo Scheduler

A task manager that doesn't just list what you have to do — it tells you what to do **next**, and lets AI agents schedule work on your behalf while you rate how well they estimated it.

**🔗 Live demo: [todo-scheduler-kappa.vercel.app](https://todo-scheduler-kappa.vercel.app)**

Click **"✨ Try the demo, no account needed"** on the login page — it instantly logs you into a fresh account pre-loaded with sample tasks (no signup, no email, nothing to remember). You'll see the priority engine, an agent-created task with a badge, and a completed task with feedback already given, all in one view.

## What it does

- **English by default, Finnish on toggle** — an `EN`/`FI` switch (top of every page) swaps all UI chrome instantly and persists the choice in `localStorage`. The demo seeds its sample tasks in whichever language is active when you click it.
- **Priority scoring** — every task has an estimated duration, a relevance rating (1–5), and an optional deadline. A scoring function combines deadline urgency with relevance to rank tasks and surface a single "do this next" recommendation, instead of leaving you to stare at a flat list. A "Why?" toggle on every task shows the breakdown (relevance component + urgency component = score) rather than a bare, unexplained number.
- **Subtasks** — any task (manually or via an agent) can be split into subtasks via `parentTaskId`, so a big vague task becomes several small, well-estimated ones instead of one uncertain guess.
- **AI agent integration (MCP)** — agents (Claude Desktop, Claude Code, or anything MCP-compatible) create and update tasks on your behalf, authenticated with a per-user API key. Two transports are available: a stdio server for local agent clients, and a remote Streamable HTTP endpoint (`/api/mcp`) for hosted/remote agents — both expose the same tools.
- **Feedback loop for agents** — when an agent-created task is completed, the app asks you to rate how accurate its time/relevance estimate was. Low ratings (≤3) require a short comment explaining why, so agents pull back richer signal than a bare number — enough to actually reason about what kinds of work they systematically under- or over-estimate.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Express + TypeScript, deployed as a single Vercel Function |
| Database | MongoDB Atlas (Mongoose) |
| Auth | Custom JWT in an httpOnly cookie (not localStorage — see [Security notes](#security-notes)) |
| Agent integration | `@modelcontextprotocol/sdk`, stdio (local) + Streamable HTTP (remote) transports |
| Hosting | Vercel |

## Repository layout

```
todo-scheduler/
├── api/            Vercel Function entrypoint (wraps the Express app)
├── server/         Express + TypeScript backend
│   ├── services/   Task business logic, shared by REST routes and the embedded MCP server
│   ├── mcp/        Embedded MCP server (used by the /api/mcp Streamable HTTP route)
│   └── routes/     REST routes + /api/mcp
├── client/         React + TypeScript + Tailwind frontend
├── mcp-server/     Standalone stdio MCP server for local agent clients (Claude Desktop, etc.)
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
| `/api/mcp` | POST | cookie or API key | Remote MCP endpoint (Streamable HTTP, stateless) |

Web sessions authenticate via an httpOnly cookie; agents authenticate via a `tsk_...` bearer token in the `Authorization` header. Both paths converge on the same `req.userId`, so task logic doesn't need to know which one it's talking to.

## Using the MCP server

Both transports expose the same five tools: `list_tasks`, `get_next_task`, `create_task` (with optional `parentTaskId` for subtasks), `update_task_status`, and `get_estimate_feedback`.

**Option A — local (stdio)**, for Claude Desktop or Claude Code running on your machine:

1. Log in, go to **API-avaimet** (API keys), and generate a key.
2. Build the MCP server: `npm run build -w mcp-server`.
3. Point your MCP client at it:

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

**Option B — remote (Streamable HTTP)**, for hosted agents or any MCP client that speaks HTTP directly, with no local process to run:

```json
{
  "mcpServers": {
    "todo-scheduler": {
      "url": "https://todo-scheduler-kappa.vercel.app/api/mcp",
      "headers": { "Authorization": "Bearer tsk_..." }
    }
  }
}
```

This endpoint runs statelessly inside the same Vercel Function as the REST API (`server/src/routes/mcp.ts`) — each request builds a fresh `McpServer` bound to the caller's `userId` and calls the task service directly, with no HTTP round-trip back to itself.

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
- The remote MCP endpoint authenticates with a static API key (bearer token), not OAuth — fine for a single user connecting their own agent, but not a multi-tenant "connect your account" flow.
- No automated tests yet.
