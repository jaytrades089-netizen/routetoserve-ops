// App tracker data — RTS field app (serveroute-v2 / Base44)
// This file is the source of truth for the ServeRoute App tab.
// Claude updates this file when new work is completed or ideas are captured.

export const SPRINT_STAGES = [
  'Stability Sprint',
  'Pinned Features',
  'On The Horizon',
]

export const DEFAULT_SPRINT_ITEMS = [
  // ── Stability Sprint ──────────────────────────────────────────────────────
  {
    id: 'android-camera',
    stage: 'Stability Sprint',
    title: 'Android Camera Fix',
    what: 'ScanCamera.jsx line 349 silent catch freezes stream after first scan on Android Chrome/Firefox.',
    why: 'Workers on Android cannot scan more than one document without restarting the app.',
    priority: 'high',
    status: 'todo',
    notes: '',
  },
  {
    id: 're-optimization-bug',
    stage: 'Stability Sprint',
    title: 'Re-Optimization Bug',
    what: 'Mirror combo route pattern — build fresh in memory, never read stored order_index.',
    why: 'Re-running route optimization produces incorrect ordering when cached order_index is stale.',
    priority: 'high',
    status: 'todo',
    notes: '',
  },
  {
    id: 'derived-state-audit',
    stage: 'Stability Sprint',
    title: 'Derived State Audit',
    what: 'Grep .update calls writing computed fields. Known bad: order_index, combo_total_miles, combo_total_drive_time_minutes, run_count.',
    why: 'Computed values stored back to the database cause drift and silent bugs over time.',
    priority: 'medium',
    status: 'todo',
    notes: '',
  },

  // ── Pinned Features ───────────────────────────────────────────────────────
  {
    id: 'scheduled-serve',
    stage: 'Pinned Features',
    title: 'Scheduled Serve',
    what: '3-dot menu on address card. Boss or worker initiates a serve scheduled for a specific date/time.',
    why: 'Needed for legal attempt windows and advance planning. GPS mileage captured on Navigate tap feeds payroll separately from route miles.',
    priority: 'high',
    status: 'needs-spec',
    notes: 'Needs spec session before building. Open decisions: boss-or-worker initiation, standalone vs route-attached, serve/attempt flow definition.',
  },
  {
    id: 'payroll-mileage',
    stage: 'Pinned Features',
    title: 'Payroll Mileage',
    what: 'Store route_miles on Route when MapQuest optimizes. Increment run_count each time worker starts route. Payroll = route_miles x run_count. Scheduled serves add separate scheduled_miles.',
    why: 'Workers need accurate mileage reimbursement. Currently manual.',
    priority: 'high',
    status: 'needs-spec',
    notes: 'Needs spec session. Depends on Scheduled Serve spec for the scheduled_miles piece.',
  },
  {
    id: 'restricted-service-windows',
    stage: 'Pinned Features',
    title: 'Restricted Service Windows',
    what: 'Address-level day/time restrictions (e.g., no Sundays, legal attempt windows). New scan-in flow with restriction fields. Surfaces to workers during routing.',
    why: 'Legal compliance — some addresses have court-mandated service windows.',
    priority: 'medium',
    status: 'needs-spec',
    notes: 'Architecture TBD: Address record or separate entity. Needs spec session.',
  },

  // ── On The Horizon ────────────────────────────────────────────────────────
  {
    id: 'platform-migration',
    stage: 'On The Horizon',
    title: 'Full Platform Migration',
    what: 'React Native/Expo + Next.js + Supabase + PowerSync + EAS Build + Stripe + Claude Code.',
    why: 'Off Base44 to a production-grade native stack. 10-week daily build roadmap exists.',
    priority: 'high',
    status: 'blocked',
    notes: 'Blocked on stability sprint completion. Do not start until Android camera, re-optimization, and derived state audit are done.',
  },
  {
    id: 'ui-rebrand',
    stage: 'On The Horizon',
    title: 'Neon UI Rebrand',
    what: 'Full visual rebrand to electric purple/gold glassmorphism theme. Background #0A0B1F to #1A1C2E, primary accent #A020FF, secondary accent #FFCC00, glassmorphic cards with neon glow borders, geometric grid background, system font.',
    why: 'High-contrast neon on near-black improves daylight visibility in the field. Design validated with Grok on April 23 2026.',
    priority: 'medium',
    status: 'todo',
    notes: 'Go component by component. Order: background gradient, cards, nav bar, filter row, badges, polish and glow. Keep the geometric grid pattern from the Grok design.',
  },
  {
    id: 'marketing-website',
    stage: 'On The Horizon',
    title: 'Marketing Website',
    what: 'routetoserve.com full product page. Week 11 of build roadmap.',
    why: 'External distribution requires a public-facing site with pricing, demo, and download CTA.',
    priority: 'medium',
    status: 'todo',
    notes: 'Pricing locked: $49/mo solo, $24/mo per worker for company accounts. Depends on platform migration.',
  },
]

export const DEFAULT_APP_IDEAS = [
  {
    id: 'app-idea-dawn-demo',
    title: 'Dawn Demo Prep',
    description: 'Capture the specific features to highlight for Dawn\'s demo. Approximately 3 weeks out as of April 23 2026.',
    status: 'active',
    notes: '',
    createdAt: new Date().toISOString(),
  },
]

export const PRIORITY_STYLE = {
  high:   'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  low:    'bg-elevated text-muted border-border',
}

export const STATUS_STYLE = {
  'todo':         'bg-elevated text-muted border-border',
  'in-progress':  'bg-accent/10 text-accent border-accent/20',
  'done':         'bg-success/10 text-success border-success/20',
  'blocked':      'bg-red-500/10 text-red-400 border-red-500/20',
  'needs-spec':   'bg-warning/10 text-warning border-warning/20',
}

export const STATUS_LABEL = {
  'todo':         'To Do',
  'in-progress':  'In Progress',
  'done':         'Done',
  'blocked':      'Blocked',
  'needs-spec':   'Needs Spec',
}

export const STATUS_OPTIONS = [
  { value: 'todo',         label: 'To Do' },
  { value: 'in-progress',  label: 'In Progress' },
  { value: 'needs-spec',   label: 'Needs Spec' },
  { value: 'blocked',      label: 'Blocked' },
  { value: 'done',         label: 'Done' },
]
