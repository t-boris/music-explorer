# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** A structured, evidence-based learning system where every practice session produces proof of work: recordings, test scores, tempo logs, and skill progression that demonstrate measurable growth over time.
**Current focus:** Phase 6 — Sharing & Community (In progress)

## Current Position

Phase: 6 of 6 (Sharing & Community)
Plan: 1 of 5 in current phase
Status: In progress
Last activity: 2026-02-06 — Completed 06-01-PLAN.md

Progress: ████████████████░░░ 85%

## Performance Metrics

**Velocity:**
- Total plans completed: 16
- Average duration: 4 min
- Total execution time: 68 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 Foundation & Auth | 3/3 | 18 min | 6 min |
| 02 Learning Path & Content | 3/3 | 13 min | 4 min |
| 03 Practice & Recording | 3/3 | 10 min | 3 min |
| 04 Tests, Dashboard & Progress | 3/3 | 9 min | 3 min |
| 05 Bugfixes & Visualizations | 3/3 | 15 min | 5 min |
| 06 Sharing & Community | 1/5 | 3 min | 3 min |

**Recent Trend:**
- Last 5 plans: 05-01 (4 min), 05-02 (4 min), 05-03 (7 min), 06-01 (3 min)
- Trend: Stable

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Dark-first :root with .light override (not .dark override)
- Firebase singleton pattern with getApps().length check
- Server-only guard on Admin SDK file
- OKLCH color tokens: surface-900..600, accent-400..600
- Lazy Firebase client init via getter functions (getFirebaseAuth, getFirebaseDb) to avoid build-time errors
- force-dynamic on auth-gated pages removed in Phase 5 (was unnecessary for "use client" pages)
- next-mdx-remote/rsc for server-side MDX rendering (not @next/mdx page-level)
- All 13 level metadata embedded statically in content.ts (not Firestore)
- Firestore subcollection CRUD service with modular SDK and getFirebaseDb() lazy getter
- Look-ahead scheduler pattern for Web Audio metronome (25ms setInterval + AudioContext.currentTime)
- State machine hook pattern for tempo trainer (setup/training/complete modes)
- MediaRecorder mimeType priority: audio/webm;codecs=opus > audio/webm > audio/mp4 (Safari)
- Firebase Storage upload pattern: blob upload to users/{uid}/recordings/, then getDownloadURL + Firestore doc
- Parallel Firestore fetch pattern for dashboard data aggregation (Promise.all for 4 queries)
- Recharts RadarChart with inline OKLCH color strings (not CSS variables) for dark theme SVG rendering
- Pure question generator functions (no Firebase dependency) for test engine
- Web Audio OscillatorNode + GainNode envelope (10ms attack, 50ms release) for clean ear training tones
- Test state machine hook (loading/in-progress/complete) with auth-aware score saving
- Auth route group pages rely solely on middleware — no client-side redirect guards needed
- Non-null assertion (user!) for middleware-guaranteed user in (auth) route group
- Server layout.tsx per route for metadata on client pages (not shared auth layout)
- Auth pages marked noindex to prevent search engine indexing
- Canvas for waveform visualization (AnalyserNode requires pixel-level drawing), SVG for fretboard (declarative + accessible)
- Shared lazy AudioContext pattern across interactive components
- MDX component registration: import in mdx-components.tsx, use JSX tags in .mdx files
- Top-level connections collection (not user subcollection) for bidirectional queries
- Authenticated-read for all user data; privacy enforced at service/UI layer, not Firestore rules
- Collection group query on inviteLinks for cross-user invite code resolution
- Client-side merge for multi-user activity feed (Firestore lacks cross-collection queries)

### Roadmap Evolution

- Phase 5 added: Bugfixes & Interactive Learning Visualizations — fix auth loop, redirect params, force-dynamic, sign-out, UX gaps; replace static diagrams with live interactive visualizations (waveforms, fretboard, intervals, chords, rhythm)
- Phase 6 added: Sharing & Community — public sharing of progress/recordings, public profiles, community comments, "shared with me" dashboard view

### Deferred Issues

None.

### Blockers/Concerns

- Firebase project not yet configured with real credentials — seed script and deploy commands will fail until .env.local is populated

## Session Continuity

Last session: 2026-02-06
Stopped at: Completed 06-01-PLAN.md (community data foundation)
Resume file: None
