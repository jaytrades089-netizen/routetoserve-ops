// ⚠️ ESCALATE TO CLAUDE — Do not modify with Gemma4
// Self-identified as HIGH COMPLEXITY during workspace review (April 25, 2026)
// Reasons: strict JSON output constraints (app-issue mode), meta-prompting logic (work-on mode),
// high dependency on correct context objects. Errors here break the embedded Claude chat entirely.

import { useState, useCallback } from 'react'

const PROXY_URL = 'https://autumn-sunset-5ea2.jaytrades089.workers.dev'
const MODEL     = 'claude-sonnet-4-20250514'

function buildSystemPrompt(mode, context) {
  const base = `You are the RouteToServe business advisor embedded in Joshua Todd's operations dashboard. Joshua is a solo founder building RouteToServe LLC — a SaaS platform for process servers in Michigan — and an AI consulting practice. Be direct, practical, and concise. Joshua often processes information while driving so keep answers short and actionable.`

  switch (mode) {
    case 'checklist': {
      const s = context.step
      return `${base}

Joshua is working on: Step ${s.id} — ${s.title}.

FULL STEP DETAIL:
What: ${s.what}
Why: ${s.why}
Cost: ${s.cost}
Time: ${s.time}
${s.link ? `Link: ${s.link}` : ''}
Steps: ${s.steps.join(' → ')}
Done State: ${s.doneState}

Help him complete this specific step. If he asks about something outside it, help him but gently redirect back to completing it.`
    }
    case 'blueprint': {
      const i = context.idea
      return `${base}

Joshua has a new idea he wants to blueprint: "${i.title}" — ${i.description}

Run a structured blueprint process. Ask ONE question at a time to understand:
1. The problem it solves
2. Who would pay for it
3. How it fits with RouteToServe
4. What it would cost to build
5. The risks

Do NOT ask all questions at once. Guide him naturally. At the end, give a clear recommendation: Park it, Plan it, or Build it — with a one-paragraph rationale.`
    }
    case 'decision': {
      const d = context.decision
      return `${base}

Joshua is working through a business decision: "${d.title}"
${d.context ? `Context: ${d.context}` : ''}

Help him think it through before logging it. Ask clarifying questions ONE at a time. Play devil's advocate where useful. When he is ready to decide, help him articulate the rationale so it is worth reading six months from now.`
    }
    case 'app-issue': {
      return `${base}

Joshua is logging a new issue or task for the RouteToServe app (serveroute-v2). He is submitting a raw field report — possibly from his phone while working.

Your job: take his raw input and format it into a clean, structured task card. Reply ONLY with a JSON object in this exact shape — no markdown, no explanation, just the JSON:

{
  "title": "Short title (5 words max)",
  "type": "bug | feature | ux | spec",
  "priority": "high | medium | low",
  "what": "One sentence: what is broken or needed",
  "why": "One sentence: why this matters in the field",
  "file": "File path or component name if known, otherwise empty string",
  "stage": "Stability Sprint"
}

Rules:
- title should be scannable, not a sentence
- type: bug = something broken, feature = new capability, ux = friction/confusion, spec = needs planning before building
- priority: high = blocks field work, medium = degrades experience, low = nice to have
- If file/location is not mentioned, leave it as empty string
- stage is always "Stability Sprint" unless Joshua specifies otherwise`
    }
    case 'work-on': {
      const item = context.item
      return `${base}

Joshua wants to start a Claude Code session to work on this task:

TASK: ${item.title}
WHAT: ${item.what}
WHY: ${item.why}
FILE / LOCATION: ${item.file || 'Not specified'}
PRIORITY: ${item.priority}
STATUS: ${item.status}
${item.blockedBy ? `BLOCKED BY / OPEN DECISIONS: ${item.blockedBy}` : ''}
${item.notes ? `SESSION NOTES: ${item.notes}` : ''}

Generate a ready-to-paste Claude Code session starter prompt. The prompt must:
1. Tell Claude Code to run: cd ~/Desktop/Claude/serveroute-v2 && git pull
2. List the exact files to read first (based on the file/location above — include CLAUDE.md and docs/WORKFLOW.md always)
3. State the specific task clearly
4. Include any open decisions or blockers that need resolving first
5. End with: "Present your plan and wait for approval before editing any files."

Write ONLY the prompt text — no preamble, no explanation. It should be ready to paste directly into Claude Code.`
    }
    default:
      return `${base}

Full context:
- 21-step business checklist (Stage 0 through Stage 4)
- Pricing: $49/month solo, $199/month company license, $24/month internal legacy
- Parked ideas: FleetRoute, Curb Signal, Michigan Outreach Agent, Secretary Agent
- Two-track business: RouteToServe product + AI consulting practice
- Domain: routetoserve.com (Namecheap, purchased April 10 2026)
- State of formation: Michigan

Be his trusted business advisor.`
  }
}

export function useClaudeChat() {
  const [messages, setMessages]   = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState(null)

  const sendMessage = useCallback(async (userText, mode, context) => {
    if (!userText.trim() || isLoading) return

    const userMsg     = { role: 'user', content: userText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      MODEL,
          max_tokens: 1000,
          system:     buildSystemPrompt(mode, context),
          messages:   newMessages,
        }),
      })

      const data = await res.json()

      if (data.error) {
        throw new Error(`Anthropic: ${data.error.message ?? JSON.stringify(data.error)}`)
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      if (!data.content || !data.content[0]) {
        throw new Error(`Unexpected response: ${JSON.stringify(data)}`)
      }

      const assistant = { role: 'assistant', content: data.content[0].text }
      setMessages(prev => [...prev, assistant])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const resetChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, resetChat }
}
