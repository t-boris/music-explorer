---
phase: 01-foundation-auth
plan: 02
subsystem: auth
tags: [firebase-auth, next-firebase-auth-edge, google-sign-in, middleware, cookies]

requires:
  - phase: 01-foundation-auth/01
    provides: Next.js project with Firebase SDKs, Tailwind theme, shadcn/ui, route groups

provides:
  - Firebase Auth with Google sign-in (popup + mobile redirect)
  - Middleware-based route protection via next-firebase-auth-edge
  - Auth context provider and useAuth hook
  - Login/logout API routes for cookie management
  - User document creation in Firestore on first sign-in
  - User menu dropdown with avatar and sign-out

affects: [02-learning-path, 03-practice, 04-dashboard]

tech-stack:
  added: [next-firebase-auth-edge, "@types/cookie"]
  patterns: [lazy Firebase init, force-dynamic for auth pages, auth middleware with public/private path split]

key-files:
  created:
    - src/middleware.ts
    - src/lib/auth-config.ts
    - src/lib/user-service.ts
    - src/app/api/login/route.ts
    - src/app/api/logout/route.ts
    - src/components/providers/auth-provider.tsx
    - src/components/auth/sign-in-button.tsx
    - src/components/auth/user-menu.tsx
    - src/hooks/use-auth.ts
  modified:
    - src/app/layout.tsx
    - src/app/login/page.tsx
    - src/components/layout/top-nav.tsx
    - src/lib/firebase.ts
    - src/app/(auth)/dashboard/page.tsx
    - src/app/(auth)/practice/page.tsx
    - src/app/(auth)/progress/page.tsx
    - .env.example

key-decisions:
  - "Lazy Firebase client init via getter functions to avoid build-time errors with empty env vars"
  - "force-dynamic on auth-gated pages to prevent static prerendering"
  - "Sign-in button detects mobile via UA and falls back to signInWithRedirect"

patterns-established:
  - "getFirebaseAuth()/getFirebaseDb() lazy getters instead of module-level auth/db exports"
  - "Auth-gated pages use force-dynamic export"
  - "Auth cookie managed via /api/login and /api/logout routes"

issues-created: []

duration: 9min
completed: 2026-02-06
---

# Phase 1 Plan 2: Firebase Auth Integration Summary

**Google sign-in with next-firebase-auth-edge middleware, auth context, login page, user menu, and Firestore user document creation**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-06T03:21:05Z
- **Completed:** 2026-02-06T03:30:04Z
- **Tasks:** 11/11
- **Files modified:** 17

## Accomplishments

- Full Google sign-in flow with popup (desktop) and redirect (mobile) fallback
- Middleware-based route protection: public paths accessible without auth, protected paths redirect to /login
- Auth context provider with useAuth hook for client components
- Login page with Music Explorer branding, Google sign-in button, and "continue browsing" option
- User menu dropdown showing avatar, name/email, dashboard/settings links, and sign-out
- Top nav conditionally shows auth-gated links only when authenticated
- User document auto-created in Firestore on first sign-in with initial fields
- Auth cookie managed via /api/login and /api/logout endpoints

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure next-firebase-auth-edge** - `ad8b449` (feat)
2. **Task 2: Create auth middleware** - `b4e8d21` (feat)
3. **Task 3: Create auth API routes** - `597b73f` (feat)
4. **Task 4: Create auth context provider** - `1d825cb` (feat)
5. **Task 6: Create sign-in button** - `2481f3b` (feat)
6. **Task 5: Build login page** - `5e25c2b` (feat)
7. **Task 7: Create user menu** - `3a6897e` (feat)
8. **Task 8: Update top nav** - `b890a73` (feat)
9. **Task 9: Create user document on first sign-in** - `2b3f0ea` (feat)
10. **Task 10: Protect auth-gated pages** - `6548a77` (feat)

_Task 11 (sign-out flow) was implemented across Tasks 4, 7, and 3 - no separate commit needed._

## Files Created/Modified

- `src/lib/auth-config.ts` - Shared auth config (cookie, service account, API key)
- `src/middleware.ts` - Auth middleware with public/private path split
- `src/app/api/login/route.ts` - Sets auth cookies from Bearer token
- `src/app/api/logout/route.ts` - Clears auth cookies
- `src/components/providers/auth-provider.tsx` - React context for auth state
- `src/hooks/use-auth.ts` - useAuth hook consuming auth context
- `src/components/auth/sign-in-button.tsx` - Google sign-in with popup/redirect
- `src/components/auth/user-menu.tsx` - Avatar dropdown with sign-out
- `src/lib/user-service.ts` - Firestore user document creation
- `src/app/login/page.tsx` - Login page with branding and sign-in
- `src/components/layout/top-nav.tsx` - Updated with auth-aware nav
- `src/app/layout.tsx` - Added AuthProvider wrapper
- `src/lib/firebase.ts` - Lazy Firebase init via getter functions
- `src/app/(auth)/dashboard/page.tsx` - Added force-dynamic
- `src/app/(auth)/practice/page.tsx` - Added force-dynamic
- `src/app/(auth)/progress/page.tsx` - Added force-dynamic
- `.env.example` - Added AUTH_COOKIE_NAME and AUTH_COOKIE_SIGNATURE_KEYS

## Decisions Made

- **Lazy Firebase init:** Changed from module-level `export const auth = getAuth(app)` to getter functions `getFirebaseAuth()` to prevent build-time errors when env vars are empty during static page generation
- **force-dynamic for auth pages:** Auth-gated pages cannot be statically prerendered since they depend on auth state; marked with `export const dynamic = "force-dynamic"`
- **Task order adjustment:** Created sign-in button (Task 6) before login page (Task 5) since login page depends on sign-in button import
- **Mobile sign-in fallback:** Detects mobile UA and uses `signInWithRedirect` instead of `signInWithPopup` to avoid popup blocking on mobile browsers

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed @types/cookie for TypeScript types**
- **Found during:** Task 1 (Configure auth-config)
- **Issue:** `import type { CookieSerializeOptions } from "cookie"` had no type declarations
- **Fix:** `npm install -D @types/cookie`
- **Files modified:** package.json, package-lock.json
- **Verification:** TypeScript compiles cleanly
- **Committed in:** b4e8d21 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed Firebase client init causing build failures**
- **Found during:** Task 10 (Protect auth-gated pages)
- **Issue:** Module-level `getAuth(app)` throws `auth/invalid-api-key` during `next build` static generation when env vars are empty
- **Fix:** Changed to lazy getter pattern `getFirebaseAuth()` and added `force-dynamic` to auth-gated pages
- **Files modified:** src/lib/firebase.ts, auth-provider.tsx, sign-in-button.tsx, user-service.ts, dashboard/page.tsx, practice/page.tsx, progress/page.tsx
- **Verification:** `npm run build` passes, all pages correctly classified as static or dynamic
- **Committed in:** 6548a77 (Task 10 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug), 0 deferred
**Impact on plan:** Both fixes were necessary for correct build and type-checking. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviations above.

## Next Phase Readiness

- Auth foundation complete: sign-in, sign-out, route protection, user document
- Ready for 01-03-PLAN.md (Firestore schema and seed data)
- All auth patterns established for use in future phases

---
*Phase: 01-foundation-auth*
*Completed: 2026-02-06*
