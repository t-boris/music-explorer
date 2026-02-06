# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** A structured, evidence-based learning system where every practice session produces proof of work: recordings, test scores, tempo logs, and skill progression that demonstrate measurable growth over time.
**Current focus:** Phase 9 — Exercise Explanations & Retry

## Current Position

Phase: 9 of 9 (Exercise Explanations & Retry)
Plan: 0 of 1 in current phase
Status: Phase planned, executing
Last activity: 2026-02-06 — Planning and executing Phase 9

Progress: █████████████████████████░ 96% (25/26 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 25
- Average duration: 4 min
- Total execution time: 90 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 Foundation & Auth | 3/3 | 18 min | 6 min |
| 02 Learning Path & Content | 3/3 | 13 min | 4 min |
| 03 Practice & Recording | 3/3 | 10 min | 3 min |
| 04 Tests, Dashboard & Progress | 3/3 | 9 min | 3 min |
| 05 Bugfixes & Visualizations | 3/3 | 15 min | 5 min |
| 06 Sharing & Community | 5/5 | 12 min | 2 min |
| 07 Interactive Exercises | 3/3 | ~9 min | ~3 min |
| 08 Dig Deeper | 2/2 | 7 min | 4 min |

**Recent Trend:**
- Last 5 plans: 07-02 (~3 min), 07-03 (~3 min), 08-01 (3 min), 08-02 (4 min)
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
- Redirect to /share after invite acceptance (connection context visible there)
- useRef guard to prevent duplicate invite processing on React strict mode re-renders
- Top-level comments collection (not user subcollection) since comments come from different users
- Optimistic UI pattern with rollback on error for responsive comment interaction
- Comment input hidden for own items (users don't comment on their own dashboard items)
- Community link in authLinks only (Share accessible via Community page, not top nav)
- Horizontal scroll on mobile, grid on desktop for people list
- Connection verification at service layer before shared dashboard data fetch
- Accordion pattern for comment sections to avoid loading all comments at once
- Activity logging params optional with defaults to avoid breaking existing callers
- Non-critical activity logging wrapped in try/catch to never break primary operations
- Amber/orange left border accent for MusicStory cards to distinguish from blue interactive components
- MusicStory MDX component: reusable card with title, era badge, connection footer for music history
- Pure question generator for knowledge checks (no Firebase dependency, same pattern as test-questions.ts)
- 80% pass threshold (4/5) for knowledge checks; no Firestore persistence (lightweight inline quiz)
- Curriculum-scoped question filtering: lessonOrder <= currentLessonOrder (never leak future material)
- Interactive exercise component pattern: onComplete/completed prop interface for uniform ExerciseCard integration
- ExerciseCard inline expand/collapse for interactive components (not modal/separate page)
- Component map pattern: INTERACTIVE_COMPONENTS record maps string keys to React components
- Backward compatibility: exercises without interactiveComponent keep checkbox behavior
- Anthropic SDK (@anthropic-ai/sdk) for AI-powered "Dig Deeper" explanations
- Streaming API route pattern: ReadableStream from Anthropic SDK stream events
- In-memory rate limiting (20 req/min/IP) for public AI endpoint
- DigDeeperContext provider for passing lesson metadata to MDX components
- Client wrapper component pattern for mixing server-rendered MDX with client interactivity
- Module-level Map cache for API response deduplication in DigDeeperPopover
- Text selection threshold of 10 chars with requestAnimationFrame for reliable selection detection
- data-no-dig-deeper attribute on interactive components to prevent selection triggers

### Roadmap Evolution

- Phase 5 added: Bugfixes & Interactive Learning Visualizations — fix auth loop, redirect params, force-dynamic, sign-out, UX gaps; replace static diagrams with live interactive visualizations (waveforms, fretboard, intervals, chords, rhythm)
- Phase 6 added: Sharing & Community — public sharing of progress/recordings, public profiles, community comments, "shared with me" dashboard view
- Phase 7 added: Interactive Exercises, Knowledge Checks & Music Stories — replace checkbox exercises with interactive tasks, add per-lesson knowledge checks covering only passed material, enrich each lesson with real music history stories
- Phase 8 added: Dig Deeper — contextual deep-dive explanations: key concept terms get "Dig Deeper" buttons with popup detail, plus text selection triggers an explain-this popover for any passage
- Phase 9 added: Exercise Explanations & Retry — AI-generated explanations for exercise answers using existing /api/dig-deeper endpoint, improved retry with full state reset

### Deferred Issues

None.

### Blockers/Concerns

- Firebase project not yet configured with real credentials — seed script and deploy commands will fail until .env.local is populated

## Session Continuity

Last session: 2026-02-06
Stopped at: Added Phase 9 (Exercise Explanations & Retry) — needs planning
Resume file: None
