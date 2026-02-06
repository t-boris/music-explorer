# Roadmap: Music Explorer

## Overview

From empty directory to a working music learning companion in 4 phases. Start with project foundation and auth, then build the content/learning structure, add practice tools with audio recording, and finish with tests, dashboard, and progress tracking. Each phase delivers a usable increment.

## Domain Expertise

None

## Phases

- [x] **Phase 1: Foundation & Auth** — Next.js project, Firebase integration, auth, data model, base layout
- [x] **Phase 2: Learning Path & Content** — Level/lesson roadmap, lesson pages with MDX theory, song/composition pages
- [x] **Phase 3: Practice & Recording** — Practice journal, browser audio recording, metronome, tempo training
- [x] **Phase 4: Tests, Dashboard & Progress** — Theory tests, ear training, test results, dashboard, progress tracking
- [x] **Phase 5: Bugfixes & Interactive Learning Visualizations** — Fix auth/routing/UX bugs, replace static diagrams with live interactive visualizations
- [x] **Phase 6: Sharing & Community** — Public sharing of progress/recordings, public profiles, community comments, "shared with me" dashboard view

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: Working Next.js app with Firebase Auth, Firestore schema, Storage config, base layout with navigation. User can sign up, log in, and see the app shell.
**Depends on**: Nothing (first phase)
**Research**: Likely (Firebase + Next.js integration patterns, Firestore document design for nested music entities)
**Research topics**: Next.js 14+ App Router + Firebase SDK setup, Firestore collection structure for Level/Lesson/Song/Exercise/PracticeSession/Recording/Test/TestAttempt/Skill/Progress, Firebase Auth with Next.js, Firebase Storage security rules
**Plans**: 3 plans

Plans:
- [x] 01-01: Next.js project setup, Firebase config, environment, base layout with navigation
- [x] 01-02: Firebase Auth integration (sign up, login, protected routes)
- [x] 01-03: Firestore schema design and seed data structure (levels, lessons, exercises)

### Phase 2: Learning Path & Content
**Goal**: Browsable learning roadmap with levels 0-5. Each level has lesson pages with MDX theory, exercises, and completion checklists. Song/composition pages show tagged theory elements.
**Depends on**: Phase 1
**Research**: Unlikely (MDX rendering in Next.js, standard CRUD UI patterns)
**Plans**: 3 plans

Plans:
- [x] 02-01: Level roadmap UI and lesson page structure (MDX theory rendering, exercise lists, checklists)
- [x] 02-02: Song/composition pages (theory tags, derived exercises, user notes/tempo)
- [x] 02-03: Seed content for levels 0-2 (physics of sound, notation, intervals) with exercises

### Phase 3: Practice & Recording
**Goal**: Users can log practice sessions, record audio in the browser, attach recordings to lessons/exercises/compositions, compare recordings over time. Built-in metronome with tempo training and BPM logging.
**Depends on**: Phase 2
**Research**: Likely (Browser MediaRecorder API, Web Audio API for metronome synthesis)
**Research topics**: MediaRecorder API cross-browser support, audio format choices (webm/opus vs wav), Firebase Storage upload for audio blobs, Web Audio API oscillator for metronome click, scheduling accurate timing
**Plans**: 3 plans

Plans:
- [x] 03-01: Practice journal (create/view sessions with date, duration, notes, linked exercises)
- [x] 03-02: Audio recording (MediaRecorder API, Firebase Storage upload, playback, attach to entities, version comparison)
- [x] 03-03: Metronome and tempo training (Web Audio API metronome, BPM progression rules, attempt logging)

### Phase 4: Tests, Dashboard & Progress
**Goal**: Theory tests and ear training with scoring. Dashboard with today's plan, quick record, streak. Progress tracking with level completion % and skill radar.
**Depends on**: Phase 3
**Research**: Likely (Web Audio API for generating interval/chord audio for ear training)
**Research topics**: Web Audio API tone generation (sine waves for intervals, chord stacking), randomized test generation, scoring algorithms
**Plans**: 3 plans

Plans:
- [x] 04-01: Dashboard (today's plan, quick record, streak, progress overview) with Firestore data aggregation
- [x] 04-02: Progress page with skill radar, level tracking, and session history
- [x] 04-03: Theory tests, ear training with Web Audio, test results with scoring and progress updates

### Phase 5: Bugfixes & Interactive Learning Visualizations
**Goal**: Fix all auth/routing/UX bugs preventing dashboard/practice/progress from working. Replace static lesson diagrams and schemes with live, interactive visualizations (waveforms, fretboard explorers, interval/chord interactors, animated notation).
**Depends on**: Phase 4
**Research**: Likely (interactive visualization libraries for music education — D3, canvas-based waveforms, Web Audio API visualization)
**Research topics**: React-based interactive graph/chart libraries, Web Audio API AnalyserNode for live waveforms, SVG/canvas fretboard rendering, interactive music notation libraries
**Plans**: 3 plans

Plans:
- [x] 05-01: Auth & routing bugfixes (remove force-dynamic, redundant guards, fix login loop, fix test page link)
- [x] 05-02: UX polish & metadata (Coming Soon levels, nav loading flash, page metadata)
- [x] 05-03: Interactive learning visualizations (WaveformVisualizer, FrequencyExplorer, IntervalPlayer, FretboardDiagram, RhythmVisualizer, MDX integration)

**Details:**

**Bugs to fix (no new content):**
- Auth: login page redirect loop (useEffect infinite retry when /api/login fails)
- Auth: `?redirect=` parameter ignored after login (users always land on /dashboard)
- Auth: sign-out doesn't redirect to home
- Performance: remove `force-dynamic` from client-side auth pages (unnecessary Cloud Function invocations)
- UX: redundant auth guard in practice page
- UX: levels 3-12 show empty pages (mark "Coming Soon" or hide)
- UX: nav loading flash when auth resolves
- UX: no page metadata on auth pages

**Interactive visualizations (replace static content):**
- Live waveform/frequency display for physics of sound lessons (Web Audio API AnalyserNode)
- Interactive interval explorer (click to hear, visualize on staff and fretboard)
- Interactive chord/voicing builder (drag notes, hear result)
- Animated fretboard diagrams (highlight scales, show positions)
- Interactive rhythm patterns (tap along, visualize subdivisions)
- Live graph widgets embeddable in MDX lessons via custom components

### Phase 6: Sharing & Community
**Goal**: Users can share their progress, recordings, test scores, and dashboard with anyone via public links. Other users can view shared profiles and leave comments on recordings and achievements. Dashboard supports "my dashboard" vs "shared with me" views.
**Depends on**: Phase 5
**Research**: Likely (Firestore security rules for public read access, sharing URL patterns, comment moderation)
**Research topics**: Firestore rules for public/shared subcollections, shareable link generation (slug vs UUID), comment data model and moderation, notification patterns for new comments
**Plans**: 5 plans

Plans:
- [x] 06-01: Foundation — types, connection service, activity service, Firestore rules (Wave 1)
- [x] 06-02: Sharing flow — invite generation, invite acceptance, share settings (Wave 2)
- [x] 06-03: Community page — people list, activity feed, navigation link (Wave 2)
- [x] 06-04: Comments system — comment service, hook, UI components (Wave 2)
- [x] 06-05: Shared dashboard — read-only dashboard view, comment integration, activity logging (Wave 3)

**Details:**

**Sharing & public profiles:**
- Public shareable profile page showing progress summary, skill radar, streak
- Shareable links for individual recordings, test results, practice sessions
- Privacy controls: choose what to share (all, selected, nothing)
- Public dashboard view (read-only version of user's dashboard)

**Community & comments:**
- Comment system on shared recordings and achievements
- "Shared with me" section on dashboard (dropdown or tab)
- View other users' shared dashboards
- Comment notifications (in-app)

**Dashboard dual-view:**
- Default: user's own dashboard (current behavior)
- "Shared with me" view: feed of shared items from others
- Toggle/dropdown to switch between views

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 3/3 | Complete | 2026-02-06 |
| 2. Learning Path & Content | 3/3 | Complete | 2026-02-06 |
| 3. Practice & Recording | 3/3 | Complete | 2026-02-06 |
| 4. Tests, Dashboard & Progress | 3/3 | Complete | 2026-02-06 |
| 5. Bugfixes & Interactive Visualizations | 3/3 | Complete | 2026-02-06 |
| 6. Sharing & Community | 5/5 | Complete | 2026-02-06 |
