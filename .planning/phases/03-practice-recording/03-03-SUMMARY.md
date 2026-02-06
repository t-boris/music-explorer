---
phase: 03-practice-recording
plan: 03
subsystem: ui, audio
tags: [web-audio-api, metronome, tempo-training, firestore, motion]

# Dependency graph
requires:
  - phase: 03-01
    provides: Practice page layout with session list, Firestore CRUD patterns
provides:
  - Web Audio API metronome with look-ahead scheduler
  - Tempo training state machine with progressive BPM
  - Tempo attempt logging to Firestore
affects: [04-tests-dashboard-progress]

# Tech tracking
tech-stack:
  added: []
  patterns: [look-ahead-scheduler, state-machine-hook, firestore-subcollection-service]

key-files:
  created:
    - src/hooks/use-metronome.ts
    - src/hooks/use-tempo-trainer.ts
    - src/components/practice/metronome.tsx
    - src/components/practice/tempo-trainer.tsx
    - src/lib/tempo-service.ts
  modified:
    - src/types/index.ts
    - src/app/(auth)/practice/page.tsx

key-decisions:
  - "Look-ahead scheduler pattern (25ms setInterval + AudioContext.currentTime scheduling) for sample-accurate metronome timing"
  - "Native HTML range input styled with Tailwind rather than adding shadcn/ui Slider component"
  - "Tempo trainer as collapsible section to keep practice page uncluttered"

patterns-established:
  - "Look-ahead scheduler: setInterval polls at 25ms, schedules OscillatorNode events ahead using AudioContext.currentTime"
  - "State machine hook: useTempoTrainer with mode transitions (setup -> training -> complete)"

issues-created: []

# Metrics
duration: 3min
completed: 2026-02-06
---

# Phase 3 Plan 03: Metronome & Tempo Training Summary

**Precise Web Audio API metronome with look-ahead scheduling, tempo training with progressive BPM targets, and Firestore attempt logging**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-06T04:04:39Z
- **Completed:** 2026-02-06T04:08:07Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Sample-accurate metronome using Web Audio API look-ahead scheduler pattern (25ms polling + AudioContext.currentTime scheduling)
- Tap tempo calculation from last 4 intervals, time signature support (2/4 through 7/8)
- Tempo training state machine: setup (start/target/step BPM) -> training (play at progressive BPMs) -> complete (log attempt)
- Firestore logging of tempo attempts to `users/{id}/tempoAttempts` subcollection
- Practice page now shows session list alongside metronome and collapsible tempo trainer in responsive grid layout

## Task Commits

Each task was committed atomically:

1. **Task 1: Build Web Audio API metronome hook and component** - `1dd18d2` (feat)
2. **Task 2: Build tempo training mode with BPM logging** - `0564f35` (feat)

## Files Created/Modified
- `src/hooks/use-metronome.ts` - Web Audio API metronome hook with look-ahead scheduler, tap tempo, BPM/time signature control
- `src/hooks/use-tempo-trainer.ts` - Tempo training state machine hook (setup/training/complete modes)
- `src/components/practice/metronome.tsx` - Metronome UI with BPM display, slider, beat indicator, tap button, time signature selector
- `src/components/practice/tempo-trainer.tsx` - Tempo trainer UI with progress bar, advance/limit buttons, attempt logging
- `src/lib/tempo-service.ts` - Firestore service for logging and querying tempo attempts
- `src/types/index.ts` - Added TempoAttempt interface
- `src/app/(auth)/practice/page.tsx` - Integrated metronome and tempo trainer in sidebar grid layout

## Decisions Made
- Used look-ahead scheduler pattern (not raw setInterval) for timing precision -- setInterval has ~10ms jitter, AudioContext clock is sample-accurate
- Used native HTML range input with Tailwind styling for BPM slider rather than adding a shadcn/ui Slider dependency
- Made tempo trainer collapsible to keep the practice page focused on the session list by default

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Metronome and tempo training complete
- Phase 3 has 1 remaining plan: 03-02 (audio recording)
- Ready for 03-02 execution

---
*Phase: 03-practice-recording*
*Completed: 2026-02-06*
