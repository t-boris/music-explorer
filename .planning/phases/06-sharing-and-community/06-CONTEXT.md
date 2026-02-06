# Phase 6: Sharing & Community - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<vision>
## How This Should Work

The core use case is student-teacher: a student shares their entire dashboard with their teacher so the teacher can track progress, listen to recordings, and leave feedback. But it also works for friends — share your progress with friends who can cheer you on and comment.

**Sharing flow:** A user generates an invite link or code. They send it to their teacher or friend (via any channel — message, email, etc.). The recipient clicks the link and gains access to the sharer's dashboard. Once connected, the sharer appears in the recipient's community tab.

**Community tab:** A dedicated tab in the app navigation. At the top: a list of connected people (those who shared with you) showing avatar, name, streak, level, last active. Below: an activity feed showing recent achievements from all connected people — "Boris completed Lesson 3", "Anna recorded Greensleeves". Click on a person to jump into their full dashboard (read-only view).

**Commenting:** When viewing someone's shared dashboard, you can comment on any visible item — recordings, test results, exercise completions, practice sessions. Comments are attached to specific items, not a general chat. Think: "nice tone here", "work on timing", "great streak!".

**Viewing someone's dashboard:** It's the same dashboard layout the user sees for themselves, but read-only. The viewer can see progress summary, skill radar, recordings, test scores, practice history — everything on the dashboard. They can leave comments on individual items.

**Auth boundary:** Lesson/theory content remains fully public (no login needed). But all community features — viewing shared dashboards, the community tab, commenting, activity feed — require authentication.

</vision>

<essential>
## What Must Be Nailed

- **Sharing flow must be simple and instant** — generate link, send it, recipient clicks and gets access. No friction.
- **Community tab must feel alive** — people list + activity feed showing real progress from connected users. Click a person, land on their dashboard.
- **Commenting must be contextual** — comments are attached to specific achievements (recordings, tests, exercises, sessions), not a generic chat. This is the teacher-student feedback core.

</essential>

<specifics>
## Specific Ideas

- Invite-based connection model (link/code), not search-based discovery
- Sharing granularity is at the whole dashboard level, not individual items
- Community tab in main navigation with people grid at top, activity feed below
- Dashboard dual-view: your own dashboard (default) vs viewing someone else's (read-only)
- All community/social features require authentication; lesson content stays public

</specifics>

<notes>
## Additional Context

The primary mental model is student-teacher, but the same system works peer-to-peer for friends. The teacher doesn't have a special role — they're just someone who was given access to see the student's dashboard and can leave comments.

The user sees this as three equally important pillars: sharing flow, community tab, and commenting. None takes priority over the others.

</notes>

---

*Phase: 06-sharing-and-community*
*Context gathered: 2026-02-06*
