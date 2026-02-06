# Roadmap: Music Explorer

## Overview

From empty directory to a working music learning companion in 4 phases. Start with project foundation and auth, then build the content/learning structure, add practice tools with audio recording, and finish with tests, dashboard, and progress tracking. Each phase delivers a usable increment.

## Domain Expertise

None

## Phases

- [x] **Phase 1: Foundation & Auth** — Next.js project, Firebase integration, auth, data model, base layout
- [x] **Phase 2: Learning Path & Content** — Level/lesson roadmap, lesson pages with MDX theory, song/composition pages
- [ ] **Phase 3: Practice & Recording** — Practice journal, browser audio recording, metronome, tempo training
- [ ] **Phase 4: Tests, Dashboard & Progress** — Theory tests, ear training, test results, dashboard, progress tracking

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
- [ ] 03-02: Audio recording (MediaRecorder API, Firebase Storage upload, playback, attach to entities, version comparison)
- [x] 03-03: Metronome and tempo training (Web Audio API metronome, BPM progression rules, attempt logging)

### Phase 4: Tests, Dashboard & Progress
**Goal**: Theory tests and ear training with scoring. Dashboard with today's plan, quick record, streak. Progress tracking with level completion % and skill radar.
**Depends on**: Phase 3
**Research**: Likely (Web Audio API for generating interval/chord audio for ear training)
**Research topics**: Web Audio API tone generation (sine waves for intervals, chord stacking), randomized test generation, scoring algorithms
**Plans**: 3 plans

Plans:
- [ ] 04-01: Theory tests (intervals, fretboard notes, scale/chord construction) with scoring and error breakdown
- [ ] 04-02: Ear training (audio generation for intervals and chord types, recognition quizzes, recommendations)
- [ ] 04-03: Dashboard (today's plan, quick record, streak) and progress tracking (level %, skill radar, session history)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 3/3 | Complete | 2026-02-06 |
| 2. Learning Path & Content | 3/3 | Complete | 2026-02-06 |
| 3. Practice & Recording | 2/3 | In progress | - |
| 4. Tests, Dashboard & Progress | 0/3 | Not started | - |
