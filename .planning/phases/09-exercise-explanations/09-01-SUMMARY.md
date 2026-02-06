---
phase: 09-exercise-explanations
plan: 01
status: complete
duration: ~5 min
files_modified:
  - src/lib/dig-deeper-service.ts
  - src/components/exercises/exercise-explanation.tsx
  - src/components/content/exercise-card.tsx
  - src/components/content/dig-deeper-term.tsx
  - src/components/exercises/waveform-matcher.tsx
  - src/components/exercises/wave-labeler.tsx
  - src/components/exercises/harmonic-finder.tsx
  - src/components/exercises/overtone-calculator.tsx
  - src/components/exercises/octave-matcher.tsx
  - src/components/exercises/frequency-calculator.tsx
---

## Summary

Added AI-generated streaming explanations to all 6 Level 0 interactive exercises and improved the retry flow with full state reset.

## What was built

**ExerciseExplanation component** (`exercise-explanation.tsx`):
- Inline card with streaming AI explanation, rendered below exercise feedback
- Green left border for correct answers, amber for wrong answers
- 3 states: loading (pulsing dots), streaming, complete, error with retry
- Module-level Map cache keyed by exerciseTitle+question+studentAnswer
- Calls existing `/api/dig-deeper` endpoint using constructed `selectedText` (no API changes)
- Duplicated `renderSimpleMarkdown` from dig-deeper-popover (avoid coupling)

**dig-deeper-service.ts extended:**
- Added `ExerciseExplanationRequest` type with exercise context fields
- Added `streamExerciseExplanation()` function with exercise-tuned system prompt
- `max_tokens: 512` (shorter than dig-deeper's 1024 — focused explanations)
- Depth adjustment based on `levelOrder` (same pattern as existing)

**exercise-card.tsx improvements:**
- `retryKey` state with React key prop remounting for full exercise reset
- Reads lesson context from `DigDeeperContext` (exported `useDigDeeperContext`)
- Updated `INTERACTIVE_COMPONENTS` type to include `lessonTitle`, `levelTitle`, `levelOrder`
- "Try Again" increments retryKey → React remounts component with fresh state

**All 6 exercises updated:**
- WaveformMatcher: explanation after each correct/wrong pitch comparison
- WaveLabeler: explanation on wrong label placement
- HarmonicFinder: explanation on correct/wrong fret tap for harmonics
- OvertoneCalculator: explanation on wrong harmonic frequency calculation
- OctaveMatcher: explanation on correct/wrong octave fret finding
- FrequencyCalculator: explanation on wrong equal temperament calculation

## Key decisions

- Reuse existing `/api/dig-deeper` via constructed `selectedText` — zero API changes
- ExerciseCard reads DigDeeperContext via try-catch (graceful fallback outside provider)
- React key prop for retry (remount = fresh state, simplest approach)
- Inline card (not popover) — appears below feedback within exercise flow
- Duplicate renderSimpleMarkdown to avoid cross-component coupling

## Verification

- `npx tsc --noEmit` passes
- `npm run build` succeeds (40 pages generated)
- All 6 exercises import and render ExerciseExplanation
- ExerciseCard reads from DigDeeperContext
- retryKey approach verified in exercise-card.tsx
