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
    what: 'ScanCamera.jsx line 349 — silent catch block freezes the stream after the first scan on Android Chrome/Firefox. The error is swallowed so the camera appears active but no further scans register.',
    why: 'Workers on Android cannot scan more than one document per session without force-closing the app. Field-blocking bug.',
    file: 'src/components/ScanCamera.jsx — line 349',
    blockedBy: null,
    priority: 'high',
    status: 'todo',
    notes: '',
  },
  {
    id: 're-optimization-bug',
    stage: 'Stability Sprint',
    title: 'Re-Optimization Bug',
    what: 'When a route is re-optimized, the system reads the stored order_index from the database instead of rebuilding order fresh in memory. This mirrors the combo route pattern — the fix is to build the optimized order array from scratch on every optimization call and never trust cached order_index.',
    why: 'Re-running optimization on an already-optimized route produces incorrect stop ordering. Workers end up driving out of sequence.',
    file: 'Mirror pattern from combo route logic in WorkerRouteDetail.jsx',
    blockedBy: null,
    priority: 'high',
    status: 'todo',
    notes: '',
  },
  {
    id: 'derived-state-audit',
    stage: 'Stability Sprint',
    title: 'Derived State Audit',
    what: 'Grep all .update() calls across the codebase that write computed values back to the database. Known offenders: order_index, combo_total_miles, combo_total_drive_time_minutes, run_count. These should all be calculated at read time, never stored.',
    why: 'Computed values stored in the database drift from reality when the underlying data changes. Causes silent bugs that are hard to trace in the field.',
    file: 'Global grep across src/ — pattern: .update({ order_index | combo_total | run_count })',
    blockedBy: null,
    priority: 'medium',
    status: 'todo',
    notes: '',
  },

  // ── Pinned Features ───────────────────────────────────────────────────────
  {
    id: 'scheduled-serve',
    stage: 'Pinned Features',
    title: 'Scheduled Serve',
    what: 'A 3-dot menu option on the address card that lets a boss or worker flag an address for a serve attempt at a specific date and time. GPS point-to-point mileage is captured when the worker taps Navigate — this feeds into payroll separately from route miles.',
    why: 'Legal attempt windows require advance scheduling for some serve types. Currently there is no way to pre-schedule an address for a specific time without it being part of an active route.',
    file: 'New feature — no file yet. Will touch AddressCard, 3-dot menu, and a new ScheduledServeModal.',
    blockedBy: 'Needs spec session before any build. Open decisions: (1) Boss-only or worker-initiated? (2) Standalone address or must be attached to a route? (3) What constitutes a completed attempt vs a full serve in this flow?',
    priority: 'high',
    status: 'needs-spec',
    notes: '',
  },
  {
    id: 'payroll-mileage',
    stage: 'Pinned Features',
    title: 'Payroll Mileage',
    what: 'When MapQuest optimizes a route, store route_miles on the Route record. Each time a worker starts the route, increment run_count. Payroll calculation = route_miles × run_count. Scheduled serves add a separate scheduled_miles field on the address record that accumulates independently.',
    why: 'Mileage reimbursement for workers is currently 100% manual. This automates the most common calculation and feeds directly into the WorkerPayout screen.',
    file: 'Will touch Route record schema, MapQuest optimization call, WorkerRouteDetail.jsx, WorkerPayout logic.',
    blockedBy: 'Depends on Scheduled Serve spec being finalized first — the scheduled_miles piece cannot be designed until the scheduled serve flow is defined.',
    priority: 'high',
    status: 'needs-spec',
    notes: '',
  },
  {
    id: 'restricted-service-windows',
    stage: 'Pinned Features',
    title: 'Restricted Service Windows',
    what: 'Address-level day and time restrictions that define when a serve attempt is legally valid (e.g., no Sundays, only between 8am–9pm, specific court-mandated windows). These restrictions are set during scan-in and surface as warnings to workers when they are routing or attempting a serve outside the window.',
    why: 'Attempting service outside a court-mandated window can invalidate the attempt entirely — the timestamp and photo are useless. This is a legal compliance requirement, not a convenience feature.',
    file: 'Will touch ScanCamera flow (new restriction fields), Address record schema, and routing display logic.',
    blockedBy: 'Architecture decision needed: do restrictions live directly on the Address record, or as a separate related entity? Needs spec session.',
    priority: 'medium',
    status: 'needs-spec',
    notes: '',
  },

  // ── On The Horizon ────────────────────────────────────────────────────────
  {
    id: 'platform-migration',
    stage: 'On The Horizon',
    title: 'Full Platform Migration',
    what: 'Move off Base44 entirely to a production-grade native stack: React Native/Expo (worker mobile app) + Next.js (boss web app) + Supabase (database) + PowerSync (offline-first sync) + EAS Build (native app distribution) + Stripe (payments) + Claude Code (development workflow). 10-week daily build roadmap already exists.',
    why: 'Base44 is a prototyping platform. It has credit costs, deployment constraints, serverless-only limitations, and no native device access. The platform migration is required before scaling to external paying customers.',
    file: 'New repo: github.com/jaytrades089-netizen/routetoserve-v1 (not yet created)',
    blockedBy: 'Hard blocked on stability sprint completion. Android camera, re-optimization bug, and derived state audit must all be done and stable before migration starts.',
    priority: 'high',
    status: 'blocked',
    notes: '',
  },
  {
    id: 'ui-rebrand',
    stage: 'On The Horizon',
    title: 'Neon UI Rebrand',
    what: 'Full visual rebrand to an electric purple and gold glassmorphism theme. New colors: background #0A0B1F to #1A1C2E gradient, primary accent #A020FF (electric purple), secondary accent #FFCC00 (bright gold), glassmorphic cards with neon glow borders, faint geometric grid on background, system font replacing Manrope. Design was validated in Grok on April 23 2026.',
    why: 'High-contrast neon on near-black performs significantly better in direct sunlight — the primary field condition for workers. The current soft plum palette washes out on phone screens outdoors.',
    file: 'Will touch index.css (CSS variables), Layout.jsx, all card components, Nav bar, filter row, badges. Component-by-component — not all at once.',
    blockedBy: 'No hard blocker, but should not start until Dawn demo is complete. Visual changes this close to a demo carry regression risk.',
    priority: 'medium',
    status: 'todo',
    notes: 'Build order when ready: (1) background gradient + grid, (2) card base colors, (3) nav bar, (4) filter row, (5) badges and buttons, (6) glow and polish pass.',
  },
  {
    id: 'marketing-website',
    stage: 'On The Horizon',
    title: 'Marketing Website',
    what: 'routetoserve.com full product marketing page. Hero with tagline and app mockup, feature sections, real field screenshots, demo video, testimonials (Dawn anchor), pricing tiers, FAQ, download CTA. Week 11 of the platform build roadmap.',
    why: 'External distribution and paying customers require a public-facing site. The website itself is proof of concept for what Joshua + AI can build together.',
    file: 'New Next.js project — same codebase that eventually becomes the Boss web app.',
    blockedBy: 'Depends on platform migration. ToS and Privacy Policy (Step 8 in business checklist) must be live before site launches.',
    priority: 'medium',
    status: 'todo',
    notes: 'Pricing locked: $49/mo solo external servers, $24/mo per worker for company accounts.',
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
