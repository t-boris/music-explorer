# Music Explorer

A comprehensive music theory learning platform for electric guitar students. Built with Next.js and Firebase, featuring interactive exercises, AI-powered explanations, gamification, and community features.

**Live**: [music-explorer-app.web.app](https://music-explorer-app.web.app)

## Features

### Learning Content
- **13 structured levels** from Physics of Sound to Mastery & Expression
- **MDX-based lessons** with embedded interactive exercises
- **21 exercise types**: waveform matchers, staff readers, interval trainers, rhythm builders, fretboard tools, ear training
- **Knowledge tests** per lesson with multiple-choice questions
- **Song library** with analysis of popular guitar tracks

### AI-Powered Learning
- **Dig Deeper** — select any text in a lesson to get a context-aware AI explanation adjusted to your level
- **Exercise explanations** — encouraging, learning-focused feedback on correct and incorrect answers
- **Note expansion** — AI expands your lesson notes with additional context
- Powered by Google Gemini with streaming responses

### Gamification
- XP rewards for exercises, lessons, tests, sessions, and recordings
- 6 ranks from Beginner to Master
- 15 unlockable badges (milestones, streaks, XP thresholds)
- Daily missions with bonus XP
- Streak tracking for consecutive practice days
- Daily caps to encourage consistent practice over grinding

### Practice & Progress
- Log practice sessions with duration, notes, and linked exercises
- Record audio/video directly from the browser
- 6-axis skill tracking: rhythm, intervals, chords, fretboard, technique, ear
- Progress charts and session history analytics
- Lesson and level completion tracking

### Community
- Connect with friends and teachers via invite codes
- Activity feed showing connected users' progress
- Comment on recordings, test attempts, and exercise completions

### Notes & Glossary
- Highlight lesson text to create notes
- Searchable music theory glossary with 30+ terms
- Notes linked to specific lessons and levels

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, RSC) |
| UI | React 19, TailwindCSS 4, Radix UI, Lucide icons |
| Database | Firebase Firestore |
| Storage | Firebase Storage (recordings) |
| Auth | Firebase Auth via next-firebase-auth-edge |
| AI | Google Generative AI (Gemini) |
| Content | MDX with gray-matter frontmatter |
| Charts | Recharts |
| Hosting | Firebase Hosting + Cloud Functions (SSR) |

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Levels, lessons, glossary, songs (no auth)
│   ├── (auth)/            # Dashboard, practice, progress, community
│   └── api/               # AI explanations, auth endpoints
├── components/
│   ├── exercises/         # 21 interactive exercise components
│   ├── content/           # Lesson/level cards, exercise lists
│   ├── dashboard/         # Dashboard widgets
│   ├── gamification/      # XP HUD, badges, daily missions
│   ├── practice/          # Session management
│   ├── progress/          # Analytics and charts
│   ├── notes/             # Note-taking sidebar
│   ├── recording/         # Audio/video recording
│   └── community/         # Activity feed, comments
├── hooks/                 # React hooks for Firebase data subscriptions
├── lib/                   # Services: exercises, practice, progress, gamification, AI
├── types/                 # TypeScript interfaces
content/
├── levels/                # MDX lesson files organized by level
└── songs/                 # Song analysis MDX files
```

## Getting Started

### Prerequisites
- Node.js 20
- Firebase project with Firestore, Storage, and Authentication enabled
- Google Generative AI API key (for AI features)

### Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Environment Variables

```env
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase (server)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# AI
GENAI_API_KEY=

# Auth
AUTH_COOKIE_SIGNATURE_KEYS=secret1,secret2
```

### Deploy

```bash
npx firebase deploy
```

## Content Authoring

Lessons are MDX files in `content/levels/<level-id>/`. Each file has YAML frontmatter defining metadata and exercises:

```yaml
---
order: 1
title: "What is Sound?"
tags: ["sound", "waves", "vibration"]
exercises:
  - type: waveform-matcher
    id: match-sine
    title: "Match the Sine Wave"
    config:
      targetFrequency: 440
---
```

The body is standard MDX rendered with syntax highlighting and interactive components.

## License

All rights reserved.
