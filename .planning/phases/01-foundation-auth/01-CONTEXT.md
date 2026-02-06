# Phase 1: Foundation & Auth - Context

**Gathered:** 2026-02-05
**Status:** Ready for research

<vision>
## How This Should Work

Opening the app should feel like walking into a studio — dark, immersive, purposeful. Not a generic SaaS dashboard, but a music tool. Think Guitar Pro / Fender Play aesthetic: dark grays, warm tones, fretboard-inspired visuals.

Navigation is top nav + cards. Clean top bar with sections (Lessons, Practice, Tests, Progress), main content area uses card-based layouts. Feels modern and spatial, not cramped.

Auth is fast and invisible — Google sign-in, one click, straight into the app. Auth is a door, not a wall. But critically: **learning content (theory, lessons, exercises) is public and accessible without login.** Auth is only required for personal features:
- Recording and tracking your progress
- Sharing progress with others
- Viewing others' progress

Someone should be able to browse the level roadmap, read theory, and see exercises without creating an account. The moment they want to *track* something, they sign in.

</vision>

<essential>
## What Must Be Nailed

- **Dark studio aesthetic from day one** — if the shell looks cheap, everything built on top feels cheap. Guitar Pro / Fender Play inspired: dark backgrounds, warm accent tones, fretboard motifs
- **Solid Firestore data model** — levels, lessons, exercises, recordings all need to relate cleanly in NoSQL. Getting this wrong means painful refactors later
- **Speed to build on** — components, patterns, Firebase wired up right so phases 2-4 can move fast
- **Public content / private tracking split** — learning content is open, auth gates personal features only

</essential>

<specifics>
## Specific Ideas

- Reference: Guitar Pro / Fender Play look and feel — dark grays, warm tones, guitar-specific visual language
- Top navigation bar with section routing (Lessons, Practice, Tests, Progress)
- Card-based content layouts in the main area
- Google sign-in for minimal friction
- Public routes for browsable learning content (no auth required)
- Protected routes only for: progress tracking, recordings, sharing, viewing others

</specifics>

<notes>
## Additional Context

The user emphasized that ALL aspects of the foundation matter equally — aesthetic, data model, and scaffolding quality. This isn't a "wire it up and make it pretty later" phase. The visual identity needs to be established from the first commit.

The public/private split is a significant architectural decision: the app needs both public and authenticated routes, with Firebase Auth gating personal features while keeping the learning path open. This affects routing structure, data fetching patterns, and component design.

</notes>

---

*Phase: 01-foundation-auth*
*Context gathered: 2026-02-05*
