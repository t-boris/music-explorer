---
phase: 06-sharing-and-community
plan: 01
subsystem: community
tags: [firestore, security-rules, connection-model, activity-feed, invite-links]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Firebase config, Firestore service patterns, auth middleware
  - phase: 04-tests-dashboard-progress
    provides: Dashboard data model, user document structure
provides:
  - Connection, ActivityEvent, Comment, InviteLink TypeScript types
  - connection-service.ts with invite link CRUD and connection management
  - activity-service.ts with event logging and feed aggregation
  - Firestore security rules enabling cross-user reads for authenticated users
  - Collection group indexes for inviteLinks and connections queries
affects: [06-02, 06-03, 06-04, 06-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Collection group query pattern for cross-user invite resolution
    - Parallel fetch + client-side merge for multi-user activity feed
    - Authenticated-read/owner-write security boundary (privacy at service layer)

key-files:
  created:
    - src/lib/connection-service.ts
    - src/lib/activity-service.ts
  modified:
    - src/types/index.ts
    - firestore.rules
    - firestore.indexes.json

key-decisions:
  - "Top-level connections collection (not user subcollection) for bidirectional queries"
  - "Authenticated-read for all user data; privacy enforced at service/UI layer, not rules"
  - "Collection group query on inviteLinks for invite code resolution across users"
  - "Client-side merge for activity feed (Firestore lacks cross-collection queries)"

patterns-established:
  - "Collection group query pattern for cross-user data resolution"
  - "Parallel fetch + sort + slice for multi-user feed aggregation"

issues-created: []

# Metrics
duration: 3min
completed: 2026-02-06
---

# Phase 6 Plan 1: Community Data Foundation Summary

**Connection model, activity event service, and cross-user Firestore security rules enabling shared dashboards and community features**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-06T12:12:05Z
- **Completed:** 2026-02-06T12:15:29Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Four community types (Connection, ActivityEvent, Comment, InviteLink) added to shared type system
- Connection service with full invite link lifecycle: create, resolve via collection group query, deduplicate, and manage connections
- Activity service with event logging and multi-user feed aggregation via parallel fetch
- Firestore security rules updated: authenticated users can read any user data (enables shared dashboards), writes remain owner-only
- Collection group indexes for inviteLinks and composite indexes for connections queries

## Task Commits

Each task was committed atomically:

1. **Task 1: Add connection, activity, comment, and invite types** - `a4ec66f` (feat)
2. **Task 2: Create connection-service.ts and activity-service.ts** - `b9bd0a9` (feat)
3. **Task 3: Update Firestore security rules and indexes** - `7dd25d9` (feat)

## Files Created/Modified
- `src/types/index.ts` - Added Connection, ActivityEvent, Comment, InviteLink interfaces
- `src/lib/connection-service.ts` - Invite link CRUD, invite acceptance, connection queries, removal
- `src/lib/activity-service.ts` - Activity event logging, per-user query, multi-user feed aggregation
- `firestore.rules` - Authenticated read for user data, connections rules, collection group rules
- `firestore.indexes.json` - Indexes for inviteLinks (collection group), connections (toUserId, fromUserId)

## Decisions Made
- Top-level `connections` collection (not user subcollection) because both users need to query it
- Authenticated-read for all user data with privacy enforced at service/UI layer, not database rules. This is acceptable because data (practice sessions, scores) is non-sensitive and all users are known (invite-only connections)
- Collection group query on `inviteLinks` for invite code resolution across users
- Client-side merge for activity feed since Firestore does not support cross-collection queries

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness
- All types, services, and rules form a complete foundation for Plans 02-05
- Plan 06-02 (Sharing flow) can proceed with invite generation and acceptance UI
- Plan 06-03 (Community page) can proceed with connection queries and activity feed
- Plan 06-04 (Comments) can use the Comment type
- Plan 06-05 (Shared dashboard) can leverage cross-user read rules

---
*Phase: 06-sharing-and-community*
*Completed: 2026-02-06*
