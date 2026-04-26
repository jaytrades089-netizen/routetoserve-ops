# RTS Ops — Workspace Map
**Product:** RouteToServe internal business operations dashboard
**Stack:** React 18 + Vite + Tailwind CSS + Lucide React + localStorage + Anthropic API
**Purpose:** Private command center for Joshua — business formation checklist, ideas pipeline, decisions log, key metrics, embedded Claude chat
**Not customer-facing. Internal use only.**

---

## Session Startup — Run Every Time
```bash
cd ~/Desktop/Claude/rts-ops && npm run dev
```
Open http://localhost:5173

---

## What This App Is

A single-user React dashboard. No backend, no database — data persists in localStorage.
Claude is embedded via Anthropic API for context-aware help on each section.
This is the command center for running RouteToServe LLC as a business.

---

## Folder Structure

```
rts-ops/
├── CLAUDE.md              ← You are here (always loaded)
├── README.md              ← Setup and data backup instructions
└── src/
    ├── App.jsx            ← Root component, routing
    ├── main.jsx           ← Entry point
    ├── index.css          ← Global styles
    ├── pages/             ← One file per screen/section
    ├── components/        ← Shared UI components
    ├── hooks/             ← All hooks live here only
    ├── api/               ← API calls (Anthropic, any future integrations)
    ├── data/              ← Static data, seed content
    ├── lib/               ← Utility libraries
    └── utils/             ← Helper functions
```

---

## Quick Navigation

| Want to... | Read first | Skip |
|---|---|---|
| Fix a UI bug | `App.jsx` + affected page file | `node_modules`, configs |
| Add a new section/screen | `src/pages/` + `App.jsx` routing | Unrelated pages |
| Modify the embedded Claude chat | `src/hooks/useClaudeChat.js` | Everything else |
| Add a new hook | `src/hooks/` only | Anywhere else |
| Check localStorage data structure | `README.md` data backup section | — |

---

## Tech Notes

- **Data persistence:** localStorage only — no backend, no Supabase
- **Claude API:** Calls Anthropic directly from browser — API key in `src/hooks/useClaudeChat.js`
- **Styling:** Tailwind CSS, warm dark theme
- **Icons:** Lucide React
- **No routing library** — App.jsx manages section switching with state

---

## Hard Rules

- Read the file before editing — never write from memory
- Return complete files only — no snippets, no partial edits
- Only modify files explicitly requested — no drive-by changes
- localStorage keys: `rts_checklist`, `rts_ideas`, `rts_decisions`, `rts_metrics` — never rename these
- No backend, no external database — localStorage is the intentional design
- Any new modal with input gets: `onInteractOutside={(e) => e.preventDefault()}` and `onEscapeKeyDown={(e) => e.preventDefault()}`
- Any button firing a write operation gets a `disabled` state guard

---

## Local Model + Cline Workflow (Gemma4:26b)

This workspace is designed to be worked on via Cline in VS Code using Gemma4:26b locally.
No Claude usage is required for routine dashboard work.

**Model:** `gemma4:26b` via Ollama (runs automatically on Mac boot — no manual launch needed)
**Tool:** Cline extension in VS Code
**GitHub remote:** `https://github.com/jaytrades089-netizen/routetoserve-ops.git`

### Standard Task Prompt
Use this pattern for any change in this workspace:

```
Read CLAUDE.md to orient yourself. Then read src/[filename].jsx.

Make this change: [describe what you want in plain language]

When complete, tell me:
- What file(s) you changed
- What specifically changed
- Wait for me to say "push it" before running any git commands
```

### Push Prompt (after you review and approve)
Once you've reviewed the changes and are ready to push:

```
Push it. Use this commit message: "[describe the change]"
```

Cline will then run:
```bash
git add -A
git commit -m "[your message]"
git push origin main
```

### When to Escalate to Claude
- Multi-file changes involving App.jsx routing + multiple pages simultaneously
- Anything touching the Anthropic API integration in `src/hooks/useClaudeChat.js`
- New features that require architectural decisions
- Any time Gemma4 expresses uncertainty — trust that signal

---

## ⚠️ Flagged File — Do Not Edit with Gemma4

`src/hooks/useClaudeChat.js` is flagged HIGH COMPLEXITY. Gemma4 self-identified this file as a problem area during workspace review (April 25, 2026).

**Reasons:** Strict JSON output constraints in `app-issue` mode, meta-prompting logic in `work-on` mode, high dependency on correct context objects being passed in. Errors here break the embedded Claude chat entirely.

**Rule:** Do not modify this file under any circumstances. If a task touches `useClaudeChat.js`, stop immediately and escalate to Claude.

---

## Current State
- App is parked — business formation takes priority
- Core dashboard sections exist: checklist, ideas, decisions, metrics
- Embedded Claude chat is functional
- Resume when business formation milestone is complete

---

*RTS Ops v1.1 — April 2026 | Internal use only*
