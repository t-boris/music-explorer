# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** A structured, evidence-based learning system where every practice session produces proof of work: recordings, test scores, tempo logs, and skill progression that demonstrate measurable growth over time.
**Current focus:** Complete — all 4 phases finished

## Current Position

Phase: 4 of 4 (Tests, Dashboard & Progress)
Plan: 3 of 3 in current phase
Status: Complete
Last activity: 2026-02-06 — Completed 04-03-PLAN.md

Progress: ████████████ 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 4 min
- Total execution time: 50 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 Foundation & Auth | 3/3 | 18 min | 6 min |
| 02 Learning Path & Content | 3/3 | 13 min | 4 min |
| 03 Practice & Recording | 3/3 | 10 min | 3 min |
| 04 Tests, Dashboard & Progress | 3/3 | 9 min | 3 min |

**Recent Trend:**
- Last 5 plans: 03-02 (4 min), 04-01 (3 min), 04-02 (2 min), 04-03 (4 min)
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
- force-dynamic on auth-gated pages to prevent static prerendering
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

### Deferred Issues

None.

### Blockers/Concerns

- Firebase project not yet configured with real credentials — seed script and deploy commands will fail until .env.local is populated

## Session Continuity

Last session: 2026-02-06
Stopped at: Project complete — all 12 plans across 4 phases executed. Full learn-practice-assess loop closed.
Resume file: None
