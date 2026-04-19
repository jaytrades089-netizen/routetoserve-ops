import { useState, useCallback } from 'react'

const CLAUDE_API = 'https://api.anthropic.com/v1/messages'
const MODEL      = 'claude-sonnet-4-20250514'

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
  const [messages, setMessages]     = useState([])
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState(null)

  const sendMessage = useCallback(async (userText, mode, context) => {
    if (!userText.trim() || isLoading) return

    const userMsg = { role: 'user', content: userText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(CLAUDE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      MODEL,
          max_tokens: 1000,
          system:     buildSystemPrompt(mode, context),
          messages:   newMessages,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message ?? `API error ${res.status}`)
      }

      const data      = await res.json()
      const assistant = { role: 'assistant', content: data.content[0]?.text ?? '...' }
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
