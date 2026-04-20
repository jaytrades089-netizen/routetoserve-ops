import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, Bot } from 'lucide-react'
import { useClaudeChat } from '../../hooks/useClaudeChat'

function modeLabel(mode, context) {
  switch (mode) {
    case 'checklist': return `Step ${context.step?.id} — ${context.step?.title}`
    case 'blueprint': return `Blueprint: ${context.idea?.title}`
    case 'decision':  return `Decision: ${context.decision?.title}`
    default:          return 'RTS Ops Assistant'
  }
}

function modeIntro(mode, context) {
  switch (mode) {
    case 'checklist': return `I have everything about Step ${context.step?.id} loaded. What do you need help with?`
    case 'blueprint': return `Let's blueprint "${context.idea?.title}". To start — what problem does this solve that isn't already being solved?`
    case 'decision':  return `Let's think through "${context.decision?.title}" before you log it. What's the core tension you're trying to resolve?`
    default:          return `RouteToServe Ops Assistant ready. What do you need?`
  }
}

export default function ClaudePanel({ mode, context, onClose }) {
  const { messages, isLoading, error, sendMessage, resetChat } = useClaudeChat()
  const [input, setInput] = useState('')
  const bottomRef         = useRef(null)
  const inputRef          = useRef(null)

  useEffect(() => {
    resetChat()
  }, [mode, context?.step?.id, context?.idea?.id, context?.decision?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    await sendMessage(text, mode, context)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={16} className="text-accent shrink-0" />
          <span className="text-text text-sm font-medium truncate">
            {modeLabel(mode, context)}
          </span>
        </div>
        <button onClick={onClose} className="text-muted hover:text-text transition-colors shrink-0 ml-2">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Intro message */}
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
            <Bot size={12} className="text-accent" />
          </div>
          <div className="bg-elevated rounded-card px-3 py-2.5 text-sm text-text max-w-[85%]">
            {modeIntro(mode, context)}
          </div>
        </div>

        {/* Conversation */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={12} className="text-accent" />
              </div>
            )}
            <div className={`rounded-card px-3 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap
              ${msg.role === 'user'
                ? 'bg-accent text-white ml-auto'
                : 'bg-elevated text-text'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Loader2 size={12} className="text-accent animate-spin" />
            </div>
            <div className="bg-elevated rounded-card px-3 py-2.5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-btn px-3 py-2">
            Error: {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted resize-none focus:outline-none focus:border-accent/60 transition-colors"
            style={{ minHeight: '38px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-accent hover:bg-accent-dim rounded-btn text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
