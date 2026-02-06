# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** A structured, evidence-based learning system where every practice session produces proof of work: recordings, test scores, tempo logs, and skill progression that demonstrate measurable growth over time.
**Current focus:** Phase 3 — Practice & Recording

## Current Position

Phase: 3 of 4 (Practice & Recording)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-06 — Completed 03-01-PLAN.md

Progress: ███████░░░░░ 58%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 5 min
- Total execution time: 34 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 Foundation & Auth | 3/3 | 18 min | 6 min |
| 02 Learning Path & Content | 3/3 | 13 min | 4 min |
| 03 Practice & Recording | 1/3 | 3 min | 3 min |

**Recent Trend:**
- Last 5 plans: 02-01 (4 min), 02-02 (3 min), 02-03 (6 min), 03-01 (3 min)
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

### Deferred Issues

None yet.

### Blockers/Concerns

- Firebase project not yet configured with real credentials — seed script and deploy commands will fail until .env.local is populated

## Session Continuity

Last session: 2026-02-06
Stopped at: Completed 03-01-PLAN.md — Practice journal with Firestore CRUD, real-time session list, create form, detail view.
Resume file: None
