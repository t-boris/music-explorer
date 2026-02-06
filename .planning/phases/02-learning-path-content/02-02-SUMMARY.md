---
phase: 02-learning-path-content
plan: 02
subsystem: ui
tags: [mdx, next-mdx-remote, songs, filtering, theory-tags]

# Dependency graph
requires:
  - phase: 02-01
    provides: MDX infrastructure, content.ts utilities, TheoryTag component, mdxComponents
provides:
  - Song content structure (MDX files in content/songs/)
  - Song data utilities (getSongs, getSong, getSongsByTag, getSongsByLevel, getAllSongTags)
  - Song list page with tag/difficulty filtering
  - Song detail page with MDX rendering and linked levels
affects: [02-03, 03-practice-recording]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Client component wrapper for server-fetched data filtering (SongFilter)
    - Reuse of MDX rendering pipeline across content types (lessons and songs)

key-files:
  created:
    - content/songs/smoke-on-the-water.mdx
    - content/songs/come-as-you-are.mdx
    - content/songs/seven-nation-army.mdx
    - src/components/content/song-card.tsx
    - src/components/content/song-filter.tsx
    - src/app/(public)/songs/[songId]/page.tsx
  modified:
    - src/lib/content.ts
    - src/app/(public)/songs/page.tsx

key-decisions:
  - "Song filtering uses client component wrapping server-fetched data (no URL state)"
  - "DifficultyDots visual indicator (filled/empty circles) instead of numeric display"
  - "Level badges on song cards use accent color tint to distinguish from theory tags"

patterns-established:
  - "Content type expansion: add MDX directory + content.ts functions + card + filter + pages"
  - "Client-side filtering pattern: server component fetches all data, passes to client filter component"

issues-created: []

# Metrics
duration: 3min
completed: 2026-02-06
---

# Phase 2 Plan 02: Song/Composition Pages Summary

**Song browsing with MDX content, theory tag filtering, and difficulty indicators for 3 sample compositions**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-06T03:47:39Z
- **Completed:** 2026-02-06T03:50:42Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created 3 song MDX files with real musical analysis (Smoke on the Water, Come As You Are, Seven Nation Army)
- Song data utilities in content.ts: getSongs, getSong, getSongsByTag, getSongsByLevel, getAllSongTags
- Song list page at /songs with client-side filtering by theory tag and difficulty
- Song detail page at /songs/[songId] with MDX rendering, breadcrumbs, linked levels, and related exercises placeholder

## Task Commits

Each task was committed atomically:

1. **Task 1: Create song content structure and data utilities** - `90c713f` (feat)
2. **Task 2: Build song list and song detail pages** - `caedc7c` (feat)

## Files Created/Modified
- `content/songs/smoke-on-the-water.mdx` - Song MDX with interval analysis and practice approach
- `content/songs/come-as-you-are.mdx` - Song MDX with chromatic movement analysis
- `content/songs/seven-nation-army.mdx` - Song MDX with rhythmic and interval breakdown
- `src/lib/content.ts` - Added Song type import, SONGS_DIR, and 5 song utility functions
- `src/components/content/song-card.tsx` - Card component with difficulty dots, theory tags, level badges
- `src/components/content/song-filter.tsx` - Client component for filtering by tag and difficulty
- `src/app/(public)/songs/page.tsx` - Song list page with server data + client filter
- `src/app/(public)/songs/[songId]/page.tsx` - Song detail with MDX, breadcrumbs, linked levels

## Decisions Made
- Song filtering uses a client component that receives all data from the server component, rather than URL-based search params. This keeps the implementation simple for the current 3-song dataset.
- Difficulty is displayed as filled/empty dots (accent colored) rather than numbers or stars, matching the minimal dark theme aesthetic.
- Level badges on song cards use a distinct accent tint (bg-accent-500/10 text-accent-400) to visually separate them from gray theory tag pills.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Song infrastructure complete, ready for 02-03 (seed content for levels 0-2)
- Song filtering pattern established for reuse with exercises
- MDX rendering pipeline proven across two content types (lessons and songs)

---
*Phase: 02-learning-path-content*
*Completed: 2026-02-06*
