# Phase 1: Foundation & Auth - Research

**Researched:** 2026-02-05
**Domain:** Next.js App Router + Firebase + Premium dark UI
**Confidence:** HIGH

<research_summary>
## Summary

Researched the full stack for a Next.js App Router project with Firebase (Auth, Firestore, Storage) and a premium dark-themed UI. The standard approach uses Next.js 16 with Firebase client SDK for browser operations, `firebase-admin` for server-side, and `next-firebase-auth-edge` for middleware-based auth that works in Edge Runtime.

For the UI layer: Tailwind CSS v4 (OKLCH colors) + shadcn/ui (copy-paste components) + Motion (animations) + Lucide (icons). Dark-first theme using CSS variables with warm amber accents on dark grays for the Guitar Pro / Fender Play aesthetic.

For Firestore: hybrid collection structure with public content as hierarchical subcollections (levels > lessons > exercises) and private user data as subcollections under users. Two-tier progress model with an embedded summary map for dashboard reads and detailed subcollection for drill-down.

**Primary recommendation:** Use `next-firebase-auth-edge` for auth middleware with public/private route split. Design Firestore schema with aggressive denormalization for read performance. Establish the dark OKLCH color palette in the very first commit.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.1 | React framework (App Router) | Latest stable, RSC by default |
| firebase | ^12.9 | Client-side Firebase SDK | Modular, tree-shakable |
| firebase-admin | ^13.6 | Server-side Firebase SDK | Node.js only, for Server Components/Actions |
| next-firebase-auth-edge | ^1.11 | Auth middleware for Edge + Node | Only solution for Firebase Auth in Next.js middleware |
| tailwindcss | ^4.0 | Utility-first CSS (OKLCH colors) | CSS-first config, wide gamut colors |
| motion | ^12.0 | Animations (formerly Framer Motion) | Dominant React animation library, 30k+ stars |
| next-themes | ^0.4 | Theme management | Dark mode toggle with zero flash |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-firebase-hooks | ^5.1 | Auth/Firestore hooks | Saves boilerplate for real-time subscriptions |
| lucide-react | ^0.563 | Icons | Default for shadcn/ui, 1500+ icons incl. music |
| recharts | ^2.15 | Standard charts | Progress over time, practice minutes |
| @nivo/radar | ^0.88 | Radar/spider charts | Skill radar visualization |
| server-only | ^0.0.1 | Build guard | Prevents client import of server modules |

### UI Component System
| Component | Source | Notes |
|-----------|--------|-------|
| shadcn/ui | `npx shadcn@latest init` | Copy-paste components on Radix UI + Tailwind |
| Radix UI | Comes with shadcn/ui | Accessible primitive components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-firebase-auth-edge | NextAuth + Firebase adapter | NextAuth adds complexity; auth-edge is purpose-built |
| shadcn/ui | HeroUI (NextUI) | HeroUI has better out-of-box polish but less customization control |
| react-firebase-hooks | Custom hooks | react-firebase-hooks saves boilerplate, well-maintained |
| reactfire | — | Semi-abandoned (~2 years without update), avoid |

**Installation:**
```bash
npx create-next-app@latest music-explorer --typescript --tailwind --eslint --app --src-dir
npm install firebase next-firebase-auth-edge next-themes motion lucide-react react-firebase-hooks server-only
npm install -D firebase-admin
npx shadcn@latest init
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                       # Next.js App Router
│   ├── (public)/              # Public routes (no auth required)
│   │   ├── levels/            # Level roadmap, lesson pages
│   │   └── songs/             # Song/composition pages
│   ├── (auth)/                # Auth-gated routes
│   │   ├── dashboard/         # Personal dashboard
│   │   ├── practice/          # Practice journal
│   │   └── progress/          # Progress tracking
│   ├── login/                 # Login page
│   ├── api/
│   │   ├── login/             # Auth cookie endpoint (next-firebase-auth-edge)
│   │   └── logout/            # Auth cookie clear
│   ├── layout.tsx             # Root layout (ThemeProvider, fonts)
│   └── globals.css            # Tailwind + OKLCH theme tokens
├── components/
│   ├── ui/                    # shadcn/ui components (auto-generated)
│   ├── layout/                # Nav, Sidebar, Footer
│   └── music/                 # Music-specific (fretboard, metronome)
├── lib/
│   ├── firebase.ts            # Client SDK init (singleton)
│   ├── firebase-admin.ts      # Admin SDK init (server-only)
│   └── auth-config.ts         # Shared auth middleware config
├── hooks/                     # Custom React hooks
└── types/                     # TypeScript types
```

### Pattern 1: Public/Private Route Split
**What:** Use Next.js route groups `(public)` and `(auth)` with middleware-based auth
**When to use:** When content must be browsable without login but some features require auth

The middleware handles the split:
```typescript
// middleware.ts
handleInvalidToken: async (reason) => {
  return redirectToLogin(request, {
    path: "/login",
    publicPaths: [
      "/", "/levels", "/levels/(.*)", "/songs", "/songs/(.*)",
      "/login", "/register",
    ],
  });
},
```

### Pattern 2: Firebase SDK Split (Client vs Admin)
**What:** Separate Firebase client SDK (`firebase`) from admin SDK (`firebase-admin`)
**When to use:** Always — client SDK for browser, admin for server

| Context | SDK | Why |
|---------|-----|-----|
| Real-time listeners | Client (`firebase`) | `onSnapshot` needs browser |
| SSR data fetching | Admin (`firebase-admin`) | Secure, no client bundle |
| Server Actions | Admin (`firebase-admin`) | Runs on server |
| Middleware | `next-firebase-auth-edge` | `firebase-admin` can't run in Edge |

### Pattern 3: Hybrid Data Fetching (SSR + Real-time)
**What:** Fetch initial data server-side, then hydrate client-side for real-time updates
**When to use:** Pages that need both fast initial load and live updates

```typescript
// Server Component (page.tsx)
const initialData = await adminDb.collection("...").get();
return <ClientList initialData={initialData} />;

// Client Component
"use client";
function ClientList({ initialData }) {
  const [data, setData] = useState(initialData);
  useEffect(() => {
    const unsub = onSnapshot(query, (snap) => setData(snap.docs));
    return unsub;
  }, []);
}
```

### Anti-Patterns to Avoid
- **Importing `firebase` (client SDK) in Server Components:** Causes hydration errors. Use `firebase-admin` server-side.
- **Importing `firebase-admin` in middleware:** Crashes on Edge Runtime (needs Node.js `crypto`). Use `next-firebase-auth-edge`.
- **`"use server"` on admin SDK init file:** Server Actions expect only async function exports. Keep admin init in a plain utility file.
- **Skip singleton pattern:** Without `getApps().length` check, hot reload creates duplicate Firebase apps.
</architecture_patterns>

<firestore_schema>
## Firestore Data Model

### Complete Collection Map

```
ROOT
├── levels/{levelId}                              # PUBLIC - 13 docs (0-12)
│   └── lessons/{lessonId}                        # PUBLIC - ~5-10 per level
│       ├── exercises/{exerciseId}                 # PUBLIC - ~3-8 per lesson
│       └── tests/{testId}                         # PUBLIC - ~1-2 per lesson
│
├── songs/{songId}                                 # PUBLIC - top-level, cross-level
│
├── users/{userId}                                 # PRIVATE - one per user
│   ├── .progressSummary (embedded map)            # Denormalized skill scores
│   ├── recordings/{recordingId}                   # PRIVATE - audio metadata
│   ├── testAttempts/{attemptId}                   # PRIVATE - quiz results
│   ├── practiceSessions/{sessionId}               # PRIVATE - daily logs
│   └── progress/{skillType_levelId}               # PRIVATE - detailed per-skill
│
└── skills/{skillId}                               # PUBLIC - reference data (6 docs)
```

### Key Document Structures

**Level:**
```typescript
{
  order: 0,           // 0-12
  title: "Physics of Sound",
  description: "...",
  skillFocus: ["intervals", "ear"]
}
```

**Lesson (subcollection of Level):**
```typescript
{
  order: 1,
  title: "Frequency and Pitch",
  theoryContent: { /* MDX reference or inline */ },
  tags: ["physics", "frequency"],
  levelId: "level0",        // denormalized
  levelTitle: "Physics of Sound"  // denormalized
}
```

**User:**
```typescript
{
  displayName: "Boris",
  email: "...",
  currentLevel: 2,
  progressSummary: {          // denormalized for dashboard
    rhythm: { score: 72, lastUpdated: timestamp },
    intervals: { score: 58, lastUpdated: timestamp },
    chords: { score: 85, lastUpdated: timestamp },
    fretboard: { score: 40, lastUpdated: timestamp },
    technique: { score: 66, lastUpdated: timestamp },
    ear: { score: 51, lastUpdated: timestamp }
  },
  streakDays: 14,
  totalPracticeMinutes: 2400
}
```

**Recording (subcollection of User):**
```typescript
{
  storageUrl: "gs://bucket/users/{uid}/recordings/{id}.webm",
  downloadUrl: "https://...",   // stored at upload time
  duration: 30,                 // seconds
  createdAt: timestamp,
  contextType: "exercise",      // "exercise" | "lesson" | "composition" | "free"
  contextId: "exerciseId123",
  contextTitle: "Pentatonic Scale Exercise 3",  // denormalized
  levelId: "level3",           // denormalized for filtering
  sessionId: "session456"      // optional link to practice session
}
```

### Denormalization Strategy

**Duplicate (read-heavy, write-rare):**
- Level title/order → every lesson doc
- Lesson title, levelId → every exercise, test doc
- Context title, levelId → every recording doc
- Per-skill aggregate scores → `users/{uid}.progressSummary` map

**Don't duplicate:**
- Full lesson content (too large, changes over time)
- Question details into test attempts (store errors + references only)
- User profile into recordings (user doc always loaded)

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public content
    match /levels/{levelId} {
      allow read: if true;
      allow write: if false;
      match /lessons/{lessonId} {
        allow read: if true;
        allow write: if false;
        match /exercises/{exerciseId} { allow read: if true; allow write: if false; }
        match /tests/{testId} { allow read: if true; allow write: if false; }
      }
    }
    match /songs/{songId} { allow read: if true; allow write: if false; }
    match /skills/{skillId} { allow read: if true; allow write: if false; }

    // User private data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{subcollection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Collection group query rules
    match /{path=**}/exercises/{exerciseId} { allow read: if true; }
  }
}
```

### Storage Rules (audio isolation)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/recordings/{allPaths=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId
                         && request.resource.contentType.matches('audio/.*')
                         && request.resource.size < 50 * 1024 * 1024;
    }
  }
}
```
</firestore_schema>

<design_system>
## Design System

### Color Palette (OKLCH)

```css
@theme {
  --color-surface-900: oklch(15% 0.01 250);    /* near-black bg */
  --color-surface-800: oklch(20% 0.01 250);    /* card bg */
  --color-surface-700: oklch(25% 0.015 250);   /* elevated card */
  --color-surface-600: oklch(30% 0.015 250);   /* hover state */

  --color-accent-400: oklch(75% 0.15 65);      /* warm amber */
  --color-accent-500: oklch(70% 0.18 55);      /* deeper amber */
  --color-accent-600: oklch(60% 0.20 45);      /* burnt orange */

  --color-text-primary: oklch(95% 0.01 250);   /* near-white */
  --color-text-secondary: oklch(70% 0.02 250); /* muted */
  --color-text-muted: oklch(50% 0.02 250);     /* subtle */
}
```

### Typography

| Role | Font | Source | Notes |
|------|------|--------|-------|
| Headings | Space Grotesk | Google Fonts (next/font) | Studio/technical feel, geometric |
| Body | Inter | Google Fonts (next/font) | Screen-optimized, industry standard |
| Mono (tabs, BPM) | JetBrains Mono | Google Fonts (next/font) | For technical musical data |

### Implementation

```tsx
// app/layout.tsx
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

const heading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning
      className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Music-Specific Components

| Need | Solution |
|------|----------|
| Guitar fretboard | `react-fretboard` or custom SVG |
| Chord diagrams | `react-chords` (SVG chord generator) |
| Music icons (beyond Lucide) | Custom SVG in `/components/icons/` |
| Skill radar | `@nivo/radar` with custom dark theme |
| Progress charts | Recharts (shadcn/ui has built-in wrapper) |
</design_system>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth middleware for Edge | Custom JWT handling | `next-firebase-auth-edge` | JWT verification, cookie management, token refresh — complex edge cases |
| Auth state management | Custom context/cookies | `next-firebase-auth-edge` + `react-firebase-hooks` | Handles token refresh, session persistence, SSR/CSR sync |
| Dark theme toggle | Manual localStorage + class toggle | `next-themes` | Handles SSR flash, system preference, cookie persistence |
| Component primitives | Custom accessible dropdowns/modals | Radix UI (via shadcn/ui) | Accessibility, focus management, keyboard navigation |
| Firestore security rules | — | Use the templates above | Missing rules = data breach |
| Firebase singleton init | — | Use `getApps().length` check | Hot reload creates duplicate apps without this |
| Real-time subscription hooks | Manual useEffect+onSnapshot | `react-firebase-hooks` | Handles loading states, error states, cleanup |

**Key insight:** Firebase + Next.js App Router integration has many subtle gotchas (Edge Runtime, SSR, singleton init). `next-firebase-auth-edge` solves the hardest problems. Don't try to wire auth manually — you'll hit the Edge Runtime wall and the cookie management complexity.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: signInWithPopup Fails on Mobile (Vercel)
**What goes wrong:** Google sign-in popup silently fails on mobile browsers when app is deployed on Vercel (not Firebase Hosting)
**Why it happens:** Chrome M115+ blocks third-party storage access; Firebase popup relies on cross-origin cookies
**How to avoid:** Use `signInWithRedirect` as fallback on mobile, or configure `authDomain` to point to your actual domain and proxy `/__/auth/handler`
**Warning signs:** Sign-in works on desktop but not mobile

### Pitfall 2: firebase-admin in Edge Runtime
**What goes wrong:** Middleware crashes with "crypto is not defined"
**Why it happens:** `firebase-admin` depends on Node.js `crypto` module, unavailable in Edge Runtime
**How to avoid:** Never import `firebase-admin` in `middleware.ts`. Use `next-firebase-auth-edge` exclusively for middleware auth.
**Warning signs:** Build error or runtime crash in middleware

### Pitfall 3: Client SDK in Server Components
**What goes wrong:** Hydration mismatch errors, "window is not defined"
**Why it happens:** `firebase` client SDK expects browser environment (DOM, window)
**How to avoid:** Only import `firebase` in `"use client"` files. Use `firebase-admin` in Server Components.
**Warning signs:** Hydration errors, SSR crashes

### Pitfall 4: Firestore Denormalization Staleness
**What goes wrong:** Denormalized fields (e.g., lesson title in recordings) become outdated when source changes
**Why it happens:** NoSQL denormalization requires manual propagation
**How to avoid:** Use Cloud Functions with Firestore triggers for propagation. Since public content changes rarely, this is low-cost.
**Warning signs:** Displaying old titles or metadata

### Pitfall 5: Missing Firestore Composite Indexes
**What goes wrong:** Queries with multiple `where` clauses or `where` + `orderBy` fail with "index required" error
**Why it happens:** Firestore requires composite indexes for multi-field queries
**How to avoid:** Firestore auto-suggests index creation URL in error messages. Click the link to create in Firebase Console. Plan indexes during schema design.
**Warning signs:** Runtime query errors with index creation URLs

### Pitfall 6: Theme Flash on Load
**What goes wrong:** White flash before dark theme applies
**Why it happens:** Theme class applied after hydration
**How to avoid:** Use `next-themes` with `suppressHydrationWarning` on `<html>` tag. It injects a script that sets the theme class before paint.
**Warning signs:** Brief white flash on page load
</common_pitfalls>

<code_examples>
## Code Examples

### Firebase Client Init (Singleton)
```typescript
// src/lib/firebase.ts
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Firebase Admin Init (Server-Only)
```typescript
// src/lib/firebase-admin.ts
import "server-only";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  : getApps()[0];

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
```

### Google Sign-In (Client Component)
```typescript
"use client";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function SignInButton() {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    await fetch("/api/login", {
      method: "GET",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    window.location.reload();
  };
  return <button onClick={handleSignIn}>Sign in with Google</button>;
}
```

### Real-Time Firestore Hook Pattern
```typescript
"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useUserRecordings(userId: string) {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, `users/${userId}/recordings`),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRecordings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  return { recordings, loading };
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 config file | Tailwind v4 CSS-first `@theme` | 2025 | OKLCH colors, no config file needed |
| `framer-motion` package | `motion` package (import from `motion/react`) | Feb 2025 | Same library, rebranded. Use new import. |
| `next-firebase-auth` (Pages Router) | `next-firebase-auth-edge` (App Router) | 2023+ | Edge Runtime support, App Router compatible |
| Manual dark mode class toggle | `next-themes` | Stable | SSR-safe, system preference detection |
| reactfire (Firebase team) | react-firebase-hooks (community) | 2024+ | reactfire appears abandoned (~2y no updates) |
| signInWithPopup everywhere | signInWithPopup (desktop) + signInWithRedirect (mobile) | Dec 2024 | Mobile browser restrictions on non-Firebase-Hosting deployments |

**New tools/patterns to consider:**
- **shadcn/ui ecosystem**: 60+ community themes, 11+ extension libraries (Tailark, Bklit UI)
- **lucide-animated**: 350+ animated icons with Motion integration
- **Tailwind v4 OKLCH**: Wide gamut colors impossible in sRGB — more vivid accents

**Deprecated/outdated:**
- `reactfire` — semi-abandoned, avoid
- `next-firebase-auth` — Pages Router only, use auth-edge instead
- Tailwind v3 `tailwind.config.js` — v4 uses CSS-first configuration
- `framer-motion` import path — use `motion/react` instead
</sota_updates>

<open_questions>
## Open Questions

1. **MDX rendering approach**
   - What we know: Next.js has built-in MDX support via `@next/mdx` and `next-mdx-remote`
   - What's unclear: Whether theory content should be static MDX files (build-time) or Firestore-stored markdown (runtime)
   - Recommendation: Start with static MDX files in the repo for levels 0-5. Easier to author, version-controlled, zero latency. Can migrate to Firestore-stored content later if needed.

2. **Cloud Functions for aggregation**
   - What we know: Firestore write-time aggregation via Cloud Functions is the standard pattern for progress rollups
   - What's unclear: Whether to set up Cloud Functions in Phase 1 or defer to Phase 4 (when progress tracking is built)
   - Recommendation: Defer Cloud Functions to Phase 4. In Phase 1, just design the schema to support them. Client-side aggregation is fine for MVP with single-user usage.

3. **Deployment target**
   - What we know: Firebase App Hosting has better Firebase integration; Vercel has better DX for Next.js
   - What's unclear: Which to deploy to (affects mobile auth pattern)
   - Recommendation: Start with Vercel (better Next.js DX). Implement signInWithRedirect fallback for mobile from the start.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- Firebase official documentation — Auth, Firestore, Storage setup and security rules
- next-firebase-auth-edge docs (https://next-firebase-auth-edge-docs.vercel.app) — middleware, getTokens, server components
- next-firebase-auth-edge GitHub (https://github.com/awinogrodzki/next-firebase-auth-edge) — v1.11.1, supports Next.js 15+, React 19
- Tailwind CSS v4 docs (https://tailwindcss.com) — OKLCH, @theme, CSS-first config
- shadcn/ui docs (https://ui.shadcn.com) — theming, dark mode, component catalog
- Motion docs (https://motion.dev) — React integration, App Router compatibility
- npm registry — verified current package versions (Feb 2026)

### Secondary (MEDIUM confidence)
- Fireship.io — Firestore data modeling patterns, denormalization strategies
- Firebase blog — collection group queries, aggregation patterns
- Dev.to tutorials — Next.js + Firebase Auth integration patterns
- LogRocket blog — React chart library comparison 2025

### Tertiary (LOW confidence - needs validation)
- Medium articles on mobile auth issues (Dec 2024) — confirmed by Firebase docs but exact workarounds may have evolved
- Community shadcn/ui theme galleries — ecosystem size claims
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Next.js 16 App Router + Firebase JS SDK 12.9
- Ecosystem: next-firebase-auth-edge, react-firebase-hooks, shadcn/ui, Tailwind v4, Motion
- Patterns: Public/private route split, client/admin SDK separation, hybrid data fetching
- Data model: Firestore collection hierarchy, denormalization, security rules
- Design: OKLCH dark palette, typography, component library

**Confidence breakdown:**
- Standard stack: HIGH — verified versions, well-documented integrations
- Architecture: HIGH — consistent across multiple authoritative sources
- Data model: HIGH — follows Firebase official data modeling guidance
- Design system: HIGH — verified library compatibility and versions
- Pitfalls: HIGH — documented in official docs and community reports
- Code examples: MEDIUM-HIGH — based on documented patterns, some details may need adjustment for latest versions

**Research date:** 2026-02-05
**Valid until:** 2026-03-07 (30 days — ecosystem stable, no major releases expected)
</metadata>

---

*Phase: 01-foundation-auth*
*Research completed: 2026-02-05*
*Ready for planning: yes*
