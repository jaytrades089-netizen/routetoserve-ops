# RouteToServe Ops

Internal business operations dashboard for RouteToServe LLC.

**Not customer-facing.** Joshua's private command center for tracking the 21-step business formation checklist, ideas pipeline, decisions log, and key metrics — with Claude AI embedded for context-aware help on every section.

---

## Stack

- React 18 + Vite
- Tailwind CSS (warm dark theme)
- Lucide React icons
- localStorage for data persistence (single-user, no backend needed)
- Anthropic API for embedded Claude chat

---

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Claude API

The embedded chat calls the Anthropic API. Base44 may proxy this automatically. If you see an API error on the "Talk to Claude" button, add your key to the request headers in `src/hooks/useClaudeChat.js`:

```js
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_ANTHROPIC_API_KEY',
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
}
```

---

## Build

```bash
npm run build
```

---

## Data backup

Open browser console and run:

```js
JSON.stringify({
  checklist: JSON.parse(localStorage.getItem('rts_checklist')),
  ideas:     JSON.parse(localStorage.getItem('rts_ideas')),
  decisions: JSON.parse(localStorage.getItem('rts_decisions')),
  metrics:   JSON.parse(localStorage.getItem('rts_metrics')),
}, null, 2)
```

---

*RouteToServe LLC — Internal use only*
