# Architecture

## Overview

PathEd is a **Next.js App Router** application. All URLs are defined in `src/lib/routes.ts` (single source of truth). Feature UI lives under `src/views/` and is mounted by thin `page.tsx` wrappers via `createClientPage`.

```
Browser
  │
  ├─ Route groups (URLs omit the group name)
  │     (marketing)  → public site
  │     (auth)       → sign-in / sign-up / SSO / continue
  │     (app)        → onboarding + (portal) student product
  │
  ├─ Clerk (sessions, OAuth)
  │
  └─ API routes (src/app/api/**)
        ├─ requireDbUser()  ← Clerk → Neon users row
        └─ Drizzle ORM → Neon HTTP
```

## URL map (canonical)

```
/                         Marketing home
/platform … /pricing …    Marketing pages
/sign-in                  Custom sign-in (Clerk)
/sign-up                  Custom sign-up (Clerk)
/sso-callback             OAuth handshake
/auth/continue            Post-auth router

/onboarding/stage{1-4}    Onboarding

/dashboard                Student portal
/challenges
/roadmap
/memory-lane
/progress
/tech-news
/store
/store/wallet
/mentorship
/events
/hack-squad
/alumni-network
/project-collab
/og-opportunities
/notifications
/settings
/profile
/placement-inbox
/placement-insights
/records-certs
/live-class
/student-community

/api/me/*  /api/store/*  /api/ai/*
```

Rules:

- kebab-case segments
- Never hardcode paths in UI — use `routes.*`, `hrefForNavId()`, or `pathForNavId()`
- Legacy `/login`, `/register`, `/technews`, `/hacksquad`, `/platform/*` redirect permanently

## Layers

| Layer | Path | Responsibility |
|-------|------|----------------|
| Route registry | `src/lib/routes.ts` | Canonical paths, middleware matchers, redirects, nav map |
| Routes | `src/app/` | App Router groups, layouts, API handlers |
| Views | `src/views/` | Screen-level UI |
| Components | `src/components/` | Shared shells + `ui/primitives` |
| Validation | `src/lib/validation/` | Zod schemas |
| API helpers | `src/lib/api/` | Errors, JSON parse |
| Wallet | `src/lib/wallet/` | Server-authoritative economy |
| Lib | `src/lib/` | DB, auth-routing, env, logger |
| Data | `src/data/` | Seed catalogs |
| Middleware | `src/middleware.ts` | Public-first Clerk protection |

## Auth flow

1. Custom UI on `/sign-in` or `/sign-up`.
2. Clerk `useSignIn` / `useSignUp` completes the session.
3. Middleware sends signed-in users on auth pages to `/auth/continue`.
4. `resolvePostAuthPath()` upserts via `POST /api/me` and routes to onboarding or `/dashboard`.
5. `(app)/(portal)/layout` requires completed onboarding; `(app)/onboarding/layout` ejects completed users.
6. Protected data loads through `/api/me/*` with Clerk session cookies.

OAuth returns through `/sso-callback`.

## Navigation

`DashboardLayout` navigates via `hrefForNavId(tabId)` from `src/lib/routes.ts`. Sidebar/header tab ids map through `APP_NAV_BY_ID`.

## Styling

- Global tokens: `src/app/globals.css`
- Prefer existing CSS variables when editing platform screens.
