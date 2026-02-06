# Music Explorer

## What This Is

A web-based learning companion for electric guitar that structures music education as a leveled journey (0-12). Each level combines theory, practice on real compositions/riffs, exercises (including ear training), and self-assessment — all backed by recordings, tests, and metrics. It turns practice sessions into a system with feedback loops and provable progress.

## Core Value

A structured, evidence-based learning system where every practice session produces proof of work: recordings, test scores, tempo logs, and skill progression that demonstrate measurable growth over time.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Level/lesson roadmap (levels 0-5 with full content: physics, notation, intervals, scales, chords, functional harmony)
- [ ] Lesson page: theory (Markdown), practice (exercises/compositions), checklist
- [ ] Song/composition pages: tonality, intervals, chords, rhythm patterns, techniques, derived exercises
- [ ] Practice journal (sessions with date, duration, what was practiced, notes)
- [ ] Audio recording in browser (10-60 sec via mic/interface), attach to lesson/exercise/composition/journal entry
- [ ] Recording comparison over time (version 1 vs version 2)
- [ ] Theory tests: intervals, fretboard notes, scale/chord construction
- [ ] Ear training: interval recognition, chord type identification (major/minor/dim/aug)
- [ ] Test results: score, error breakdown, recommendation to revisit specific exercises
- [ ] Built-in metronome
- [ ] Tempo training: start BPM, target BPM, progression rules, BPM logging per attempt
- [ ] Dashboard: today's plan, quick record, streak, progress
- [ ] Progress tracking: level completion %, skill radar (rhythm, intervals, chords, fretboard, technique, ear), session history
- [ ] Authentication and per-user data isolation

### Out of Scope

- AI audio analysis (pitch detection, rhythm analysis, recording scoring) — V3, too complex for MVP
- Tab import/playback and tablature rendering — V2, requires significant MIDI/rendering work
- Spaced repetition algorithm — V3, need usage data first to design properly
- Community/sharing/leaderboards — V3, personal tool first
- Mobile-native app — web-first, PWA later
- Offline support — not critical for v1

## Context

**Learning curriculum:**
13 levels designed with a mathematical-structural approach to music theory:
- Level 0: Physics of sound (frequency, harmonics, logarithmic hearing)
- Level 1: Notation system (staff, clefs, rhythm, meter)
- Level 2: Intervals (semitones, consonance/dissonance, frequency ratios)
- Level 3: Scales (chromatic, major, natural/harmonic/melodic minor, key signatures)
- Level 4: Chords (triads, sevenths, inversions, chord functions)
- Level 5: Functional harmony (tonic/subdominant/dominant, cadences, circle of fifths, progressions)
- Levels 6-12: Modes, advanced rhythm, advanced harmony, counterpoint, form, composition, math+music (future)

MVP builds out levels 0-5 with full content. Levels 6-12 exist as roadmap structure only.

**Compositions as theory containers:**
Each song/riff is tagged with the theory it demonstrates (key, intervals, chords, rhythm, technique). Exercises are derived from riffs (e.g., same motif in other keys). This bridges abstract theory to real playing.

**Target audience:**
Primarily personal use (the developer learning guitar), possibly shared with friends. Design for single-user first but with Firebase Auth enabling multi-user naturally.

**Content approach:**
Own exercises and riffs, public domain material, external links. No embedding of copyrighted tabs.

## Constraints

- **Tech stack**: Next.js (React) + Full Firebase (Firestore + Auth + Storage) — chosen for speed to ship
- **Content**: Markdown-based theory (MDX) — must be easy to author and update
- **Audio**: Browser Recorder API — start simple, no advanced analysis
- **Data model**: Firestore (NoSQL) — design document structure to support: User, Level, Lesson, Song/Composition, Exercise, PracticeSession, Recording, Test, TestAttempt, Skill, Progress
- **Privacy**: Recordings private by default, secure storage URLs
- **Design**: Slick, modern UI with a music aesthetic — dark theme, subtle musical visual cues (waveforms, fretboard motifs, rhythm-inspired spacing), polished animations. Not a generic SaaS look. Should feel like a premium music tool.
- **a11y**: Basic accessibility (keyboard navigation, contrast)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full Firebase (Firestore + Auth + Storage) | All-in-one platform, fastest to ship, generous free tier | — Pending |
| Next.js with MDX for theory content | React ecosystem, static content + dynamic app, good DX | — Pending |
| Levels 0-5 for MVP content | Covers fundamentals through functional harmony — enough to analyze songs | — Pending |
| NoSQL (Firestore) for relational-ish data | Simpler infra vs Postgres, but requires careful document design for nested entities | — Pending |
| Browser Recorder API for audio | Simplest path, cross-browser support improving, avoids native dependencies | — Pending |
| Premium visual design | Dark theme, music-inspired aesthetics, polished feel — not a generic CRUD app | — Pending |

---
*Last updated: 2026-02-05 after design constraint added*
