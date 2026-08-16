# Architecture

## Overview

PathEd is a **Next.js App Router** application. Routes live under `src/app/`. Feature UI is implemented as client components under `src/views/` and mounted via thin `page.tsx` wrappers (often `dynamic(..., { ssr: false })` where `localStorage` / browser APIs are used).

```
Browser
  │
  ├─ pages (src/app/**/page.tsx)
  │     └─ views (src/views/**)  ← UI / interactions
  │
  ├─ Clerk (sessions, OAuth)
  │
  └─ API routes (src/app/api/**)
        ├─ requireDbUser()  ← Clerk → Neon users row
        └─ @neondatabase/serverless
```

## Layers

| Layer | Path | Responsibility |
|-------|------|----------------|
| Routes | `src/app/` | URL mapping, layouts, metadata, API handlers |
| Views | `src/views/` | Screen-level UI (dashboard, onboarding, store, marketing) |
| Components | `src/components/` | Shared shells (Header, DashboardLayout, modals) |
| Lib | `src/lib/` | `api.ts` client helpers, DB client, user upsert |
| Data | `src/data/` | Seed catalogs (`store-catalog.ts`, `quotes_dataset.json`) |
| Middleware | `src/middleware.ts` | Clerk middleware for session cookies |

## Auth flow

1. User uses custom UI on `/login` or `/register`.
2. Clerk `useSignIn` / `useSignUp` completes the session.
3. Client calls `POST /api/me` to upsert the Neon `users` row (+ related profile/wallet/settings rows).
4. Protected data is loaded through `/api/me/*` with Clerk session cookies (`credentials: "include"`).

OAuth returns through `/sso-callback`.

## Student dashboard data

`StudentProvider` (`src/components/dashboard/StudentContext.tsx`) loads:

- `GET /api/me/profile`
- `GET /api/me/onboarding`
- `GET /api/me/settings`
- `GET /api/me/challenges`

and exposes name, CRI, XP, coins, streak, career goal, and daily challenges to the dashboard header, sidebar, and home widgets.

## Styling

- Global tokens and Tailwind entry: `src/app/globals.css`
- Brand CSS variables (`--bg-main`, `--text-main`, etc.)
- Many screens still use inline styles from the original design system; prefer existing patterns when editing.

## Migration note

The app was migrated from Vite + React Router. Legacy `src/pages/**/*.jsx` and one-time migration scripts were removed. Active screens live only under `src/views/` + `src/app/`.
