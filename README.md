# PathEd

Career readiness platform that bridges academic learning and industry skills for engineering students.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Clerk Auth · Neon PostgreSQL

## Features

- Custom Clerk sign-in / sign-up flows (`/sign-in`, `/sign-up`)
- Student dashboard with CRI, XP, coins, streaks, and AI guidance
- Nested AI roadmap (Ollama), IST study calendar, node assessments, Memory Lane, challenges, store & wallet
- Neon-backed profiles, wallets, purchases, notifications, and quotes

## Quick start

```bash
npm install
cp .env.example .env.local   # Clerk, DATABASE_URL, GROQ_API_KEY, Ollama keys
npm run db:setup             # drizzle-kit push + seed store/quotes
npm run dev                  # http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:setup` | Sync schema deltas (ORM) + seed catalog |
| `npm run db:push` | Create/sync full schema from `schema.ts` |
| `npm run db:seed` | Seed store/quotes via Drizzle ORM |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Sync schema deltas via Drizzle ORM |
| `npm run db:migrate:roadmap-study-youtube` | Study calendar + YouTube cache tables |
| `npm run db:studio` | Open Drizzle Studio |

## Project layout

```
src/
  app/           # Next.js App Router pages & API routes
  views/         # Feature screens (client UI)
  components/    # Shared UI (layout, dashboard shell)
  lib/           # API helpers, DB client (Drizzle), auth helpers
  data/          # Seed catalogs (store, quotes JSON)
  middleware.ts  # Clerk middleware
scripts/         # Drizzle seed script
drizzle/         # Drizzle migrations
```

## Security notes

- Never commit `.env.local` or Neon/Clerk secrets.
- Rotate any credentials that were shared in chat or screenshots.
- `GROQ_API_KEY`, `OLLAMA_*`, `YOUTUBE_API_KEY`, and `DATABASE_URL` are server-only (no `NEXT_PUBLIC_` prefix).

## Docs

| Doc | What it covers |
| --- | --- |
| [docs/PLATFORM.md](docs/PLATFORM.md) | Hosts, roles, API ownership |
| [docs/STACK.md](docs/STACK.md) | Tech stack and where to host (Vercel vs VPS) |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Student roadmap, generate, calendar, assessments |
| [docs/CRI.md](docs/CRI.md) | Career Readiness Index |
| [docs/ADMIN.md](docs/ADMIN.md) | Staff admin (spec only) |

## License

Private project — all rights reserved.
