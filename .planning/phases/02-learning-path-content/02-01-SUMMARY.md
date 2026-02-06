---
phase: 02-learning-path-content
plan: 01
subsystem: ui
tags: [mdx, next-mdx-remote, gray-matter, remark-gfm, rehype-slug, server-components]

# Dependency graph
requires:
  - phase: 01-foundation-auth
    provides: Next.js project with Tailwind v4 OKLCH theme, shadcn/ui, route groups, TypeScript types
provides:
  - MDX infrastructure with content.ts utility module
  - Static metadata for all 13 levels
  - Level roadmap page at /levels
  - Level detail page at /levels/[levelId]
  - Lesson page with MDX rendering at /levels/[levelId]/lessons/[lessonId]
  - Reusable content components (LevelCard, LessonCard, ExerciseCard, TheoryTag)
affects: [02-02-songs, 02-03-seed-content, 03-practice-recording]

# Tech tracking
tech-stack:
  added: [next-mdx-remote, gray-matter, remark-gfm, rehype-slug, rehype-autolink-headings]
  patterns: [file-based MDX content with frontmatter, server-only content utilities, exercises in MDX frontmatter]

key-files:
  created:
    - src/lib/content.ts
    - src/app/(public)/levels/[levelId]/page.tsx
    - src/app/(public)/levels/[levelId]/lessons/[lessonId]/page.tsx
    - src/components/content/level-card.tsx
    - src/components/content/lesson-card.tsx
    - src/components/content/mdx-components.tsx
    - src/components/content/exercise-list.tsx
    - src/components/content/exercise-card.tsx
    - src/components/content/theory-tag.tsx
    - content/levels/level-0/lesson-1.mdx
  modified:
    - src/app/(public)/levels/page.tsx
    - package.json

key-decisions:
  - "Use next-mdx-remote/rsc for server-side MDX rendering instead of @next/mdx page-level approach"
  - "Embed all 13 level metadata statically in content.ts rather than fetching from Firestore"
  - "Store exercises inline in MDX frontmatter rather than separate exercises.json files"
  - "Skip next.config.ts MDX plugin since next-mdx-remote handles compilation programmatically"

patterns-established:
  - "File-based MDX content: content/levels/{levelId}/{lessonSlug}.mdx"
  - "Server-only content utilities with typed returns matching src/types/index.ts"
  - "Content components in src/components/content/ directory"

issues-created: []

# Metrics
duration: 4min
completed: 2026-02-06
---

# Phase 2 Plan 1: Level Roadmap & Lesson Pages Summary

**File-based MDX content pipeline with 13-level roadmap, lesson detail pages, and dark-themed MDX rendering using next-mdx-remote/rsc**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-06T03:41:21Z
- **Completed:** 2026-02-06T03:45:36Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments
- MDX infrastructure with content.ts utility providing typed API for levels, lessons, and exercises
- Level roadmap at /levels showing all 13 levels with active/locked state based on content availability
- Level detail page with lesson listing and skill tags
- Lesson page with full MDX rendering through custom dark-themed components (headings, code blocks, tables, blockquotes, lists)
- Exercise list with color-coded type badges and recording indicators

## Task Commits

Each task was committed atomically:

1. **Task 1: Set up MDX infrastructure and content utilities** - `16dba21` (feat)
2. **Task 2: Build level roadmap page and level detail page** - `5f40dc1` (feat)
3. **Task 3: Build lesson page with MDX rendering and exercise list** - `b7e2168` (feat)

## Files Created/Modified
- `src/lib/content.ts` - Server-only content utility with getLevels, getLessons, getLesson, getExercisesForLesson
- `content/levels/level-0/lesson-1.mdx` - Test MDX file with frontmatter, theory content, and exercises
- `src/app/(public)/levels/page.tsx` - Level roadmap page (replaced placeholder)
- `src/app/(public)/levels/[levelId]/page.tsx` - Level detail page with lesson list
- `src/app/(public)/levels/[levelId]/lessons/[lessonId]/page.tsx` - Lesson page with MDX rendering
- `src/components/content/level-card.tsx` - Level card with animated entrance and hover effects
- `src/components/content/lesson-card.tsx` - Lesson card with order number and tags
- `src/components/content/mdx-components.tsx` - Custom MDX component overrides for dark theme
- `src/components/content/exercise-list.tsx` - Exercise section with count badge
- `src/components/content/exercise-card.tsx` - Exercise card with type badges and recording indicators
- `src/components/content/theory-tag.tsx` - Reusable tag pill component
- `package.json` - Added MDX dependencies

## Decisions Made
- Used `next-mdx-remote/rsc` for server component MDX rendering instead of `@next/mdx` page-level approach -- simpler, no next.config.ts changes needed, content read from files at request time
- Embedded all 13 level metadata in content.ts as a static array -- no Firestore dependency for public content structure
- Stored exercises inline in MDX frontmatter yaml arrays instead of separate exercises.json files -- keeps all lesson data co-located in a single file
- Skipped `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react` packages since `next-mdx-remote` handles MDX compilation programmatically

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Skipped @next/mdx config in next.config.ts**
- **Found during:** Task 1 (MDX infrastructure setup)
- **Issue:** Plan specified configuring @next/mdx in next.config.ts, but since we use next-mdx-remote/rsc for rendering, the @next/mdx plugin is unnecessary and would require installing @next/mdx, @mdx-js/loader, @mdx-js/react
- **Fix:** Skipped next.config.ts modification; MDX rendering handled entirely by next-mdx-remote/rsc in server components
- **Files modified:** None (avoided unnecessary change)
- **Verification:** npm run build passes, MDX renders correctly on lesson page

**2. [Rule 2 - Missing Critical] Exercises stored in MDX frontmatter instead of exercises.json**
- **Found during:** Task 1 (content structure design)
- **Issue:** Plan mentioned exercises.json per level directory, but co-locating exercises with lesson content in frontmatter is simpler and avoids file synchronization
- **Fix:** Defined exercises as a yaml array in MDX frontmatter; getExercisesForLesson reads from frontmatter
- **Files modified:** content/levels/level-0/lesson-1.mdx, src/lib/content.ts
- **Verification:** Exercises parse correctly and render in exercise list

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical), 0 deferred
**Impact on plan:** Both changes simplify the architecture without losing functionality. No scope creep.

## Issues Encountered
None

## Next Phase Readiness
- MDX pipeline ready for seed content (Plan 02-03)
- Song/composition pages can reuse TheoryTag, content patterns (Plan 02-02)
- Level roadmap will automatically show new levels as content is added to content/ directory

---
*Phase: 02-learning-path-content*
*Completed: 2026-02-06*
