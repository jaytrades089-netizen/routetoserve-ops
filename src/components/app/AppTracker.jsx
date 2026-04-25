import { useState, useCallback, useRef } from 'react'
import { ChevronRight, ChevronDown, Plus, X, Lightbulb, Smartphone, AlertTriangle, FileCode, Lock, Terminal, Bug, Sparkles, Copy, Check, Camera, ImagePlus, Trash2 } from 'lucide-react'
import {
  SPRINT_STAGES,
  PRIORITY_STYLE,
  STATUS_STYLE,
  STATUS_LABEL,
  STATUS_OPTIONS,
} from '../../data/appData'
import { useClaudeChat } from '../../hooks/useClaudeChat'

const PROXY_URL = 'https://autumn-sunset-5ea2.jaytrades089.workers.dev'

// ── Priority badge ─────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  return (
    <span className={`text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded border ${PRIORITY_STYLE[priority] ?? PRIORITY_STYLE.medium}`}>
      {priority}
    </span>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded border ${STATUS_STYLE[status] ?? STATUS_STYLE.todo}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

// ── Convert File to base64 data URL ───────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result) // full data URL: "data:image/jpeg;base64,..."
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Strip the data URL prefix to get raw base64 + media_type
function parseDataUrl(dataUrl) {
  const [header, data] = dataUrl.split(',')
  const mediaType = header.replace('data:', '').replace(';base64', '')
  return { mediaType, data }
}

// ── Work On modal ──────────────────────────────────────────────────────────
function WorkOnModal({ item, onClose }) {
  const { messages, isLoading, error, sendMessage, resetChat } = useClaudeChat()
  const [copied, setCopied]   = useState(false)
  const [started, setStarted] = useState(false)

  const prompt = messages.find(m => m.role === 'assistant')?.content ?? ''

  const handleGenerate = useCallback(() => {
    setStarted(true)
    sendMessage(
      `Generate the Claude Code session starter prompt for this task.`,
      'work-on',
      { item }
    )
  }, [item, sendMessage])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [prompt])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-surface border border-border rounded-card w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-accent" />
            <span className="text-sm font-semibold text-text">Work on: {item.title}</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text"><X size={15} /></button>
        </div>

        <div className="p-5 space-y-4">
          {!started && !isLoading && !prompt && (
            <div className="text-center py-4">
              <p className="text-sm text-muted mb-4">Generate a ready-to-paste Claude Code session prompt for this task.</p>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 mx-auto text-sm px-4 py-2 bg-accent hover:bg-accent-dim text-white rounded-btn transition-colors"
              >
                <Sparkles size={14} />
                Generate Prompt
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-6">
              <div className="text-sm text-muted">Generating session prompt...</div>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-btn px-3 py-2">
              {error}
            </div>
          )}

          {prompt && (
            <>
              <div className="bg-elevated border border-border rounded-btn p-3 font-mono text-xs text-text leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                {prompt}
              </div>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2 bg-accent hover:bg-accent-dim text-white rounded-btn transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <p className="text-[11px] text-muted text-center">Paste this into Claude Code to start the session.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Single sprint item row ─────────────────────────────────────────────────
function SprintItemRow({ item, onStatusChange, onNotesChange }) {
  const [expanded, setExpanded]     = useState(false)
  const [showWorkOn, setShowWorkOn] = useState(false)

  const isBlocked   = item.status === 'blocked'
  const needsSpec   = item.status === 'needs-spec'
  const showCallout = (isBlocked || needsSpec) && item.blockedBy

  return (
    <>
      {showWorkOn && (
        <WorkOnModal item={item} onClose={() => setShowWorkOn(false)} />
      )}
      <div className={`rounded-btn border transition-colors ${
        item.status === 'done'
          ? 'border-border bg-surface opacity-50'
          : isBlocked
            ? 'border-red-500/30 bg-surface'
            : needsSpec
              ? 'border-warning/30 bg-surface'
              : 'border-border bg-surface hover:bg-elevated'
      }`}>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
          onClick={() => setExpanded(p => !p)}
        >
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className={`text-sm font-medium truncate ${item.status === 'done' ? 'text-muted line-through' : 'text-text'}`}>
              {item.title}
            </span>
            <PriorityBadge priority={item.priority} />
          </div>
          <StatusBadge status={item.status} />
          {expanded
            ? <ChevronDown size={14} className="text-muted shrink-0" />
            : <ChevronRight size={14} className="text-muted shrink-0" />
          }
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[9px] text-muted uppercase tracking-widest mb-1.5">What</div>
                <div className="text-xs text-text leading-relaxed">{item.what}</div>
              </div>
              <div>
                <div className="text-[9px] text-muted uppercase tracking-widest mb-1.5">Why</div>
                <div className="text-xs text-text leading-relaxed">{item.why}</div>
              </div>
            </div>

            {item.file && (
              <div className="flex gap-2 bg-elevated border border-border rounded-btn px-3 py-2.5">
                <FileCode size={13} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <div className="text-[9px] text-muted uppercase tracking-widest mb-0.5">File / Location</div>
                  <div className="text-xs text-text leading-relaxed font-mono">{item.file}</div>
                </div>
              </div>
            )}

            {showCallout && (
              <div className={`flex gap-2 rounded-btn px-3 py-2.5 border ${
                isBlocked ? 'bg-red-500/10 border-red-500/20' : 'bg-warning/10 border-warning/20'
              }`}>
                <AlertTriangle size={13} className={`shrink-0 mt-0.5 ${isBlocked ? 'text-red-400' : 'text-warning'}`} />
                <div>
                  <div className={`text-[9px] uppercase tracking-widest mb-0.5 font-semibold ${isBlocked ? 'text-red-400' : 'text-warning'}`}>
                    {isBlocked ? 'Blocked By' : 'Needs Spec — Open Decisions'}
                  </div>
                  <div className="text-xs text-text leading-relaxed">{item.blockedBy}</div>
                </div>
              </div>
            )}

            {item.notes && (
              <div className="flex gap-2 bg-highest border border-border rounded-btn px-3 py-2.5">
                <Lock size={13} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <div className="text-[9px] text-muted uppercase tracking-widest mb-0.5">Spec Notes</div>
                  <div className="text-xs text-text leading-relaxed">{item.notes}</div>
                </div>
              </div>
            )}

            <div>
              <div className="text-[9px] text-muted uppercase tracking-widest mb-2">Status</div>
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onStatusChange(item.id, opt.value)}
                    className={`text-xs px-3 py-1.5 rounded-btn border transition-colors ${
                      item.status === opt.value
                        ? 'bg-accent border-accent text-white'
                        : 'bg-elevated border-border text-muted hover:text-text hover:border-accent/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[9px] text-muted uppercase tracking-widest mb-2">Session Notes</div>
              <textarea
                value={item.notes}
                onChange={e => onNotesChange(item.id, e.target.value)}
                placeholder="Add notes from this session..."
                rows={2}
                className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted resize-none focus:outline-none focus:border-accent/60 transition-colors"
              />
            </div>

            <button
              onClick={() => setShowWorkOn(true)}
              className="flex items-center gap-2 text-sm px-4 py-2 bg-elevated hover:bg-highest border border-border hover:border-accent/40 text-text rounded-btn transition-colors"
            >
              <Terminal size={14} className="text-accent" />
              Work on this in Claude Code
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ── App ideas panel ────────────────────────────────────────────────────────
const IDEA_STATUS_STYLE = {
  parked: 'bg-warning/10 text-warning border-warning/20',
  active: 'bg-accent/10 text-accent border-accent/20',
  done:   'bg-success/10 text-success border-success/20',
}

function AppIdeasPanel({ ideas, onAddIdea, standalone = false }) {
  const [open, setOpen]     = useState(false)
  const [title, setTitle]   = useState('')
  const [desc, setDesc]     = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => { setTitle(''); setDesc(''); setOpen(false) }

  const handleAdd = async () => {
    if (!title.trim() || saving) return
    setSaving(true)
    try { onAddIdea(title.trim(), desc.trim()) } finally { setSaving(false) }
    reset()
  }

  return (
    <div className={`bg-surface border border-border rounded-card p-5 ${standalone ? 'max-w-lg' : ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={16} className="text-muted" />
        <h2 className="text-text font-semibold">App Ideas</h2>
      </div>

      <div className="space-y-2 mb-4">
        {ideas.map(idea => (
          <div key={idea.id} className="bg-elevated border border-border rounded-btn px-3 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-text truncate">{idea.title}</span>
              <span className={`text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded border ${IDEA_STATUS_STYLE[idea.status] ?? IDEA_STATUS_STYLE.parked}`}>
                {idea.status}
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">{idea.description}</p>
          </div>
        ))}
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-sm text-accent border border-accent/30 hover:border-accent/60 hover:bg-accent/5 rounded-btn py-2 transition-colors"
        >
          <Plus size={14} />
          Log App Idea
        </button>
      ) : (
        <div className="border border-border rounded-btn p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text">New App Idea</span>
            <button onClick={reset} className="text-muted hover:text-text"><X size={14} /></button>
          </div>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Idea name"
            className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/60"
          />
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="What is it? (one sentence)"
            rows={2}
            className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted resize-none focus:outline-none focus:border-accent/60"
          />
          <button
            onClick={handleAdd}
            disabled={!title.trim() || saving}
            className="w-full text-xs px-3 py-2 bg-accent hover:bg-accent-dim text-white rounded-btn transition-colors disabled:opacity-40"
          >
            Log It
          </button>
        </div>
      )}
    </div>
  )
}

// ── Log Issue panel ────────────────────────────────────────────────────────
const ISSUE_TYPE_OPTIONS = [
  { value: 'bug',     label: 'Bug',     icon: Bug       },
  { value: 'feature', label: 'Feature', icon: Sparkles  },
  { value: 'ux',      label: 'UX',      icon: Lightbulb },
  { value: 'spec',    label: 'Spec',    icon: FileCode  },
]

const ISSUE_TYPE_STYLE = {
  bug:     'bg-red-500/10 text-red-400 border-red-500/20',
  feature: 'bg-accent/10 text-accent border-accent/20',
  ux:      'bg-warning/10 text-warning border-warning/20',
  spec:    'bg-muted/10 text-muted border-border',
}

const PRIORITY_BADGE_STYLE = {
  high:   'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  low:    'bg-success/10 text-success border-success/20',
}

function LogIssuePanel({ onAddIssue }) {
  const [open, setOpen]           = useState(false)
  const [type, setType]           = useState('bug')
  const [description, setDesc]    = useState('')
  const [images, setImages]       = useState([]) // [{ dataUrl, mediaType, data, name }]
  const [pending, setPending]     = useState(false)
  const [error, setError]         = useState(null)

  const fileInputRef   = useRef(null)
  const cameraInputRef = useRef(null)

  const reset = () => {
    setType('bug')
    setDesc('')
    setImages([])
    setOpen(false)
    setError(null)
  }

  const handleFiles = async (files) => {
    const accepted = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!accepted.length) return
    // Cap at 3 images total
    const remaining = 3 - images.length
    const toAdd = accepted.slice(0, remaining)
    const converted = await Promise.all(toAdd.map(async (file) => {
      const dataUrl = await fileToBase64(file)
      const { mediaType, data } = parseDataUrl(dataUrl)
      return { dataUrl, mediaType, data, name: file.name }
    }))
    setImages(prev => [...prev, ...converted])
  }

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSendAndCapture = async () => {
    if (!description.trim() || pending) return
    setPending(true)
    setError(null)
    try {
      const systemPrompt = `You are formatting a field issue report for the RouteToServe app (serveroute-v2).

Take the raw input (text and any screenshots provided) and reply ONLY with a JSON object — no markdown, no explanation, just raw JSON:

{
  "title": "Short title (5 words max)",
  "type": "bug | feature | ux | spec",
  "priority": "high | medium | low",
  "what": "One sentence: what is broken or needed",
  "why": "One sentence: why this matters in the field",
  "file": "File path or component name if known, otherwise empty string",
  "screenshotDescription": "Brief description of what the screenshots show, or empty string if none"
}

Rules:
- title: scannable, not a sentence
- type: bug = broken, feature = new capability, ux = friction/confusion, spec = needs planning
- priority: high = blocks field work, medium = degrades experience, low = nice to have
- file: empty string if not mentioned
- If screenshots are provided, describe what they show in screenshotDescription to help developers understand the visual context`

      // Build message content — text first, then images
      const userContent = [
        { type: 'text', text: `Type: ${type}\n\n${description}` },
        ...images.map(img => ({
          type: 'image',
          source: { type: 'base64', media_type: img.mediaType, data: img.data },
        })),
      ]

      const res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userContent }],
        }),
      })

      const responseData = await res.json()
      if (responseData.error) throw new Error(responseData.error.message ?? 'API error')

      const raw    = responseData.content?.[0]?.text ?? ''
      const clean  = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      // Store thumbnail data URLs (not full base64 blobs) for display
      onAddIssue({
        ...parsed,
        screenshots: images.map(img => img.dataUrl),
      })
      reset()
    } catch (e) {
      console.error('Log issue failed:', e)
      setError('Something went wrong. Try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bug size={16} className="text-muted" />
        <h2 className="text-text font-semibold">Log Issue</h2>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-sm text-accent border border-accent/30 hover:border-accent/60 hover:bg-accent/5 rounded-btn py-2 transition-colors"
        >
          <Plus size={14} />
          Log New Issue
        </button>
      ) : (
        <div className="border border-border rounded-btn p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text">New Issue</span>
            <button onClick={reset} className="text-muted hover:text-text"><X size={14} /></button>
          </div>

          {/* Type selector */}
          <div>
            <div className="text-[9px] text-muted uppercase tracking-widest mb-2">Type</div>
            <div className="flex gap-2 flex-wrap">
              {ISSUE_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-btn border transition-colors ${
                    type === opt.value
                      ? ISSUE_TYPE_STYLE[opt.value]
                      : 'bg-elevated border-border text-muted hover:text-text'
                  }`}
                >
                  <opt.icon size={11} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <textarea
            autoFocus
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="Describe what happened or what's needed. Be as rough as you want — Claude will format it."
            rows={4}
            className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted resize-none focus:outline-none focus:border-accent/60 transition-colors"
          />

          {/* Screenshot attachments */}
          <div>
            <div className="text-[9px] text-muted uppercase tracking-widest mb-2">
              Screenshots <span className="normal-case">(optional, up to 3)</span>
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.dataUrl}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded-btn border border-border"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={9} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add image buttons — only show if under limit */}
            {images.length < 3 && (
              <div className="flex gap-2">
                {/* Upload from library */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-elevated border border-border hover:border-accent/40 text-muted hover:text-text rounded-btn transition-colors"
                >
                  <ImagePlus size={12} />
                  Upload
                </button>

                {/* Camera capture — on mobile this opens camera directly */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-elevated border border-border hover:border-accent/40 text-muted hover:text-text rounded-btn transition-colors"
                >
                  <Camera size={12} />
                  Camera
                </button>

                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-btn px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleSendAndCapture}
            disabled={!description.trim() || pending}
            className="w-full text-xs px-3 py-2 bg-accent hover:bg-accent-dim text-white rounded-btn transition-colors disabled:opacity-40"
          >
            {pending ? 'Sending to Claude...' : 'Send to Claude →'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Logged issue card ──────────────────────────────────────────────────────
function LoggedIssueCard({ issue, onUpdateStatus, onRemove }) {
  const [expanded, setExpanded]         = useState(false)
  const [lightboxSrc, setLightboxSrc]   = useState(null)

  return (
    <>
      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img src={lightboxSrc} alt="Screenshot" className="max-w-full max-h-full rounded-btn" />
        </div>
      )}

      <div className={`rounded-btn border transition-colors ${
        issue.status === 'done'
          ? 'border-border bg-surface opacity-50'
          : 'border-border bg-surface hover:bg-elevated'
      }`}>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
          onClick={() => setExpanded(p => !p)}
        >
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className={`text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded border ${ISSUE_TYPE_STYLE[issue.type] ?? ''}`}>
              {issue.type}
            </span>
            <span className="text-sm font-medium text-text truncate">{issue.title}</span>
            <span className={`text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded border ${PRIORITY_BADGE_STYLE[issue.priority] ?? ''}`}>
              {issue.priority}
            </span>
          </div>
          {expanded
            ? <ChevronDown size={14} className="text-muted shrink-0" />
            : <ChevronRight size={14} className="text-muted shrink-0" />
          }
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-border pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] text-muted uppercase tracking-widest mb-1">What</div>
                <div className="text-xs text-text leading-relaxed">{issue.what}</div>
              </div>
              <div>
                <div className="text-[9px] text-muted uppercase tracking-widest mb-1">Why</div>
                <div className="text-xs text-text leading-relaxed">{issue.why}</div>
              </div>
            </div>

            {issue.file && (
              <div className="flex gap-2 bg-elevated border border-border rounded-btn px-3 py-2">
                <FileCode size={12} className="text-muted shrink-0 mt-0.5" />
                <div className="text-xs text-text font-mono">{issue.file}</div>
              </div>
            )}

            {issue.screenshotDescription && (
              <div>
                <div className="text-[9px] text-muted uppercase tracking-widest mb-1">Screenshot Context</div>
                <div className="text-xs text-text leading-relaxed">{issue.screenshotDescription}</div>
              </div>
            )}

            {/* Screenshot thumbnails */}
            {issue.screenshots?.length > 0 && (
              <div>
                <div className="text-[9px] text-muted uppercase tracking-widest mb-2">Screenshots</div>
                <div className="flex gap-2 flex-wrap">
                  {issue.screenshots.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightboxSrc(src)}
                      className="w-16 h-16 rounded-btn border border-border overflow-hidden hover:border-accent/40 transition-colors"
                    >
                      <img src={src} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['todo', 'in-progress', 'done'].map(s => (
                  <button
                    key={s}
                    onClick={() => onUpdateStatus(issue.id, s)}
                    className={`text-xs px-2.5 py-1 rounded-btn border transition-colors ${
                      issue.status === s
                        ? 'bg-accent border-accent text-white'
                        : 'bg-elevated border-border text-muted hover:text-text'
                    }`}
                  >
                    {s === 'todo' ? 'To Do' : s === 'in-progress' ? 'In Progress' : 'Done'}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onRemove(issue.id)}
                className="flex items-center gap-1 text-[10px] text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={10} />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ── Stage section ──────────────────────────────────────────────────────────
function StageSection({ stage, items, sprintItems }) {
  if (!items.length) return (
    <div className="text-sm text-muted text-center py-8">No items in this stage yet.</div>
  )
  return (
    <div className="space-y-2">
      {items.map(item => (
        <SprintItemRow
          key={item.id}
          item={item}
          onStatusChange={sprintItems.updateStatus}
          onNotesChange={sprintItems.updateNotes}
        />
      ))}
    </div>
  )
}

// ── Main AppTracker ────────────────────────────────────────────────────────
export default function AppTracker({ sprintItems, appIdeas, loggedIssues, stageFilter = null }) {
  const doneCount  = sprintItems.items.filter(i => i.status === 'done').length
  const totalCount = sprintItems.items.length
  const nextItem   = sprintItems.items.find(i => i.status !== 'done' && i.stage === 'Stability Sprint')

  if (stageFilter === 'ideas-only') {
    return (
      <div className="space-y-5">
        <AppIdeasPanel ideas={appIdeas.ideas} onAddIdea={appIdeas.addIdea} standalone />
      </div>
    )
  }

  if (stageFilter) {
    const stageItems = sprintItems.items.filter(i => i.stage === stageFilter)
    return (
      <div className="space-y-5">
        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-text font-semibold mb-1">{stageFilter}</h2>
          <p className="text-xs text-muted mb-4">
            {stageItems.filter(i => i.status === 'done').length}/{stageItems.length} done
          </p>
          <StageSection stage={stageFilter} items={stageItems} sprintItems={sprintItems} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface border border-border rounded-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <Smartphone size={18} className="text-accent" />
          <div>
            <h1 className="text-text font-semibold">RouteToServe App</h1>
            <p className="text-[11px] text-muted">serveroute-v2 · Base44 · GitHub</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-lg font-bold text-text">{doneCount}/{totalCount}</div>
            <div className="text-[10px] text-muted uppercase tracking-widest">Items Done</div>
          </div>
        </div>
        {nextItem && (
          <div className="bg-elevated border border-accent/20 rounded-btn px-3 py-2">
            <div className="text-[9px] text-muted uppercase tracking-widest mb-0.5">Next Up — Stability Sprint</div>
            <div className="text-sm text-text font-medium">{nextItem.title}</div>
            <div className="text-xs text-muted mt-0.5">{nextItem.what.split('.')[0]}.</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <div className="space-y-5">
          <div className="bg-surface border border-border rounded-card p-5 h-fit">
            <h2 className="text-text font-semibold mb-4">All Work</h2>
            <div className="space-y-6">
              {SPRINT_STAGES.map(stage => {
                const stageItems = sprintItems.items.filter(i => i.stage === stage)
                if (!stageItems.length) return null
                return (
                  <div key={stage}>
                    <div className="text-[9px] text-muted uppercase tracking-widest mb-2 px-1">{stage}</div>
                    <div className="space-y-2">
                      {stageItems.map(item => (
                        <SprintItemRow
                          key={item.id}
                          item={item}
                          onStatusChange={sprintItems.updateStatus}
                          onNotesChange={sprintItems.updateNotes}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {loggedIssues && loggedIssues.issues.length > 0 && (
            <div className="bg-surface border border-border rounded-card p-5">
              <h2 className="text-text font-semibold mb-4">Field Reports</h2>
              <div className="space-y-2">
                {loggedIssues.issues.map(issue => (
                  <LoggedIssueCard
                    key={issue.id}
                    issue={issue}
                    onUpdateStatus={loggedIssues.updateIssueStatus}
                    onRemove={loggedIssues.removeIssue}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <AppIdeasPanel ideas={appIdeas.ideas} onAddIdea={appIdeas.addIdea} />
          {loggedIssues && (
            <LogIssuePanel onAddIssue={loggedIssues.addIssue} />
          )}
        </div>
      </div>
    </div>
  )
}
