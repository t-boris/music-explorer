# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** A structured, evidence-based learning system where every practice session produces proof of work: recordings, test scores, tempo logs, and skill progression that demonstrate measurable growth over time.
**Current focus:** Phase 4 — Tests, Dashboard & Progress

## Current Position

Phase: 4 of 4 (Tests, Dashboard & Progress)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-02-06 — Completed 04-02-PLAN.md

Progress: ███████████░ 91%

## Performance Metrics

**Velocity:**
- Total plans completed: 11
- Average duration: 4 min
- Total execution time: 46 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 Foundation & Auth | 3/3 | 18 min | 6 min |
| 02 Learning Path & Content | 3/3 | 13 min | 4 min |
| 03 Practice & Recording | 3/3 | 10 min | 3 min |
| 04 Tests, Dashboard & Progress | 2/3 | 5 min | 2 min |

**Recent Trend:**
- Last 5 plans: 03-03 (3 min), 03-02 (4 min), 04-01 (3 min), 04-02 (2 min)
- Trend: Stable

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Dark-first :root with .light override (not .dark override)
- Firebase singleton pattern with getApps().length check
- Server-only guard on Admin SDK file
- OKLCH color tokens: surface-900..600, accent-400..600
- FIREBASE_SERVICE_ACCOUNT_KEY env var for seed script (avoids gcloud GOOGLE_APPLICATION_CREDENTIALS conflict)
- Fixed document IDs for idempotent Firestore seeding
- Manual Firebase config files (no firebase init, no real project yet)
- Lazy Firebase client init via getter functions (getFirebaseAuth, getFirebaseDb) to avoid build-time errors
- force-dynamic on auth-gated pages to prevent static prerendering
- Mobile sign-in uses signInWithRedirect fallback (popup blocked on mobile browsers)
- next-mdx-remote/rsc for server-side MDX rendering (not @next/mdx page-level)
- All 13 level metadata embedded statically in content.ts (not Firestore)
- Exercises stored in MDX frontmatter yaml arrays (not separate exercises.json)
- Song filtering uses client component wrapping server-fetched data (no URL state)
- Content type expansion pattern: MDX directory + content.ts functions + card + filter + pages
- Server component wrapper in /practice/new to bridge content.ts (server-only) to client form
- Firestore subcollection CRUD service with modular SDK and getFirebaseDb() lazy getter
- Real-time onSnapshot hook pattern for live practice session list
- Look-ahead scheduler pattern for Web Audio metronome (25ms setInterval + AudioContext.currentTime)
- State machine hook pattern for tempo trainer (setup/training/complete modes)
- Native HTML range input with Tailwind styling for BPM slider (no extra UI library dep)
- MediaRecorder mimeType priority: audio/webm;codecs=opus > audio/webm > audio/mp4 (Safari)
- Firebase Storage upload pattern: blob upload to users/{uid}/recordings/, then getDownloadURL + Firestore doc
- Parallel Firestore fetch pattern for dashboard data aggregation (Promise.all for 4 queries)
- Dashboard widget pattern: typed props, dark surface-800 cards, consistent heading with Lucide icon
- Quick record on dashboard uses contextType="free" with empty levelId
- Recharts RadarChart with inline OKLCH color strings (not CSS variables) for dark theme SVG rendering
- Static level metadata duplicated in client components (content.ts is server-only)
- Relative date grouping pattern for session history timeline (This Week, Last Week, This Month)

### Deferred Issues

None yet.

### Blockers/Concerns

- Firebase project not yet configured with real credentials — seed script and deploy commands will fail until .env.local is populated

## Session Continuity

Last session: 2026-02-06
Stopped at: Completed 04-02-PLAN.md — Progress page with Recharts RadarChart skill radar, level progress bar (0-12), and weekly-grouped session history timeline.
Resume file: None
