---
phase: 01-foundation-auth
plan: "03"
subsystem: database
tags: [firestore, firebase, security-rules, storage-rules, seed-data, firebase-admin]

# Dependency graph
requires:
  - phase: 01-foundation-auth
    provides: Firebase SDKs, TypeScript types, environment config
provides:
  - Firestore security rules (public read, owner-only user data)
  - Storage security rules (audio-only, size-limited, user-isolated)
  - Firestore composite indexes for common queries
  - Firebase project config files (firebase.json, .firebaserc)
  - Seed script with foundational data (skills, levels, lessons, exercises)
  - npm seed command
affects: [02-learning-content, 03-practice-recording, 04-tests-dashboard]

# Tech tracking
tech-stack:
  added: [tsx, dotenv]
  patterns: [idempotent-seeding, batch-writes, fixed-document-ids]

key-files:
  created:
    - firebase.json
    - .firebaserc
    - firestore.rules
    - firestore.indexes.json
    - storage.rules
    - scripts/seed.ts
    - scripts/tsconfig.json
  modified:
    - package.json
    - .env.example

key-decisions:
  - "Used FIREBASE_SERVICE_ACCOUNT_KEY instead of GOOGLE_APPLICATION_CREDENTIALS for seed script credential loading to avoid conflict with gcloud CLI default credentials"
  - "Created Firebase config files manually instead of firebase init (no real project configured yet)"
  - "Used fixed document IDs for idempotent seeding (re-run updates rather than duplicates)"

patterns-established:
  - "Idempotent seed: fixed doc IDs with batch.set() — safe to re-run"
  - "Seed script uses firebase-admin directly (not app SDK) for server-side data operations"

issues-created: []

# Metrics
duration: 5min
completed: 2026-02-06
---

# Phase 1 Plan 3: Firestore Schema & Seed Data Summary

**Firestore/Storage security rules, composite indexes, and idempotent seed script with 6 skills, 13 levels (0-12), 3 level-0 lessons, and 6 exercises**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-06T03:20:39Z
- **Completed:** 2026-02-06T03:25:06Z
- **Tasks:** 7/8 (Task 8 skipped: seed run requires Firebase credentials)
- **Files modified:** 9

## Accomplishments
- Firestore security rules with public/private split matching the data model
- Storage rules enforcing audio-only uploads, 50MB limit, user isolation
- Composite indexes for recordings, practiceSessions, testAttempts queries
- Complete seed script with 6 skills, 13 levels, 3 lessons, 6 exercises
- Seed data matches TypeScript types defined in src/types/index.ts
- npm seed command ready (`npm run seed`)

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Firebase project locally** - `7778804` (chore)
2. **Task 2: Firestore security rules** - `9af0716` (feat)
3. **Task 3: Storage security rules** - `6d70ea3` (feat)
4. **Task 4: Firestore composite indexes** - `bfcc139` (feat)
5. **Tasks 5-6: Seed script with data content** - `cad1e5b` (feat)
6. **Task 7: Seed script runner** - `fddef87` (chore)
7. **Task 8: Run seed and verify** - skipped (no Firebase project credentials)

## Files Created/Modified
- `firebase.json` - Firebase project config (Firestore rules/indexes + Storage rules paths)
- `.firebaserc` - Firebase project association (empty default)
- `firestore.rules` - Security rules: public read for content, owner-only for user data
- `firestore.indexes.json` - Composite indexes for recordings, practice sessions, test attempts
- `storage.rules` - Audio-only uploads, 50MB max, user-isolated paths
- `scripts/seed.ts` - Idempotent Firestore seed with skills, levels, lessons, exercises
- `scripts/tsconfig.json` - TypeScript config for scripts directory
- `package.json` - Added seed script, tsx and dotenv devDependencies
- `.env.example` - Added FIREBASE_SERVICE_ACCOUNT_KEY documentation

## Decisions Made
- Used `FIREBASE_SERVICE_ACCOUNT_KEY` env var instead of `GOOGLE_APPLICATION_CREDENTIALS` for the seed script, because the latter is commonly set by gcloud CLI to application default credentials which are not service account keys
- Created Firebase config files manually (firebase.json, .firebaserc) rather than running `firebase init`, since no real Firebase project is configured yet
- Used fixed document IDs (e.g., "level0", "rhythm", "lesson-0-1") for idempotent seeding

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Changed credential env var name for seed script**
- **Found during:** Tasks 5-6 (seed script creation)
- **Issue:** `GOOGLE_APPLICATION_CREDENTIALS` is set by gcloud CLI to application default credentials, which causes firebase-admin `cert()` to fail with "invalid credential" instead of our clean error message
- **Fix:** Used `FIREBASE_SERVICE_ACCOUNT_KEY` as the env var name for explicit service account key file path
- **Files modified:** scripts/seed.ts, .env.example
- **Verification:** `npm run seed` shows clean error message when no credentials configured
- **Committed in:** cad1e5b

---

**Total deviations:** 1 auto-fixed (blocking), 0 deferred
**Impact on plan:** Env var rename necessary to avoid conflict with gcloud CLI. No scope creep.

## Issues Encountered
- Task 8 (run seed and verify) could not be executed because no Firebase project credentials are configured in .env.local. The seed script compiles, runs, and produces a clear error message. Actual seeding will work once credentials are provided.

## Next Phase Readiness
- Firestore rules, Storage rules, indexes, and seed script are all ready
- Once Firebase project is configured with credentials, `npm run seed` will populate the database
- Phase 1 complete after this plan (all 3 plans done)
- Ready for Phase 2: Learning Path & Content

---
*Phase: 01-foundation-auth*
*Completed: 2026-02-06*
