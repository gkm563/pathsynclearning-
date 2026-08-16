# Setup

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+
- A [Clerk](https://clerk.com) application
- A [Neon](https://neon.tech) PostgreSQL database
- Optional: Google Gemini API key for AI insights/quotes

## Install

```bash
npm install
```

If Tailwind build fails on Windows with a missing `lightningcss` native binary:

```bash
npm install lightningcss --no-audit --no-fund
```

## Environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env.local
```

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk Frontend API key |
| `CLERK_SECRET_KEY` | Yes | Clerk Backend API key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Recommended | `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Recommended | `/register` |
| `DATABASE_URL` | Yes | Neon connection string (`sslmode=require`) |
| `GEMINI_API_KEY` | Optional | Used by `/api/ai/*` routes |

Pull Clerk keys with the CLI (if installed):

```bash
clerk env pull
```

## Database

Apply the production schema and seed store products + quotes:

```bash
npm run db:setup
```

Schema-only:

```bash
npm run db:migrate
```

SQL source of truth: `src/lib/db/schema.sql`.

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production:

```bash
npm run build
npm start
```

## Auth URLs

| Path | Purpose |
|------|---------|
| `/login` | Custom student/teacher/recruiter sign-in (Clerk behind the UI) |
| `/register` | Custom sign-up + email verification |
| `/sso-callback` | OAuth redirect completion |
| `/dashboard` | Student home (requires signed-in session for DB sync) |

## Verify

```bash
npm run typecheck
npm run lint
npm run db:setup
```

Then sign in once and confirm `/api/me` creates a user row in Neon.
