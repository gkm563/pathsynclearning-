# PathEd

Career readiness platform that bridges academic learning and industry skills for engineering students.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Clerk Auth · Neon PostgreSQL

## Features

- Custom Clerk sign-in / sign-up flows (`/sign-in`, `/sign-up`)
- Multi-stage student onboarding
- Student dashboard with CRI, XP, coins, streaks, and AI guidance
- Challenges, Memory Lane, roadmap, store & wallet
- Neon-backed profiles, wallets, purchases, notifications, and quotes

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Clerk + DATABASE_URL + GEMINI_API_KEY
npm run db:setup             # migrate schema + seed store/quotes
npm run dev                  # http://localhost:3000
```

See **[docs/SETUP.md](docs/SETUP.md)** for full environment setup.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:setup` | Apply schema + seed catalog data |
| `npm run db:migrate` | Apply schema only |

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/SETUP.md](docs/SETUP.md) | Install, env vars, Clerk, Neon |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | App structure and data flow |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema and seed notes |
| [docs/API.md](docs/API.md) | REST API routes |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Conventions for changes |

## Project layout

```
src/
  app/           # Next.js App Router pages & API routes
  views/         # Feature screens (client UI)
  components/    # Shared UI (layout, dashboard shell)
  lib/           # API helpers, DB client, auth helpers
  data/          # Seed catalogs (store, quotes JSON)
  middleware.ts  # Clerk middleware
scripts/         # db:setup / db:migrate
docs/            # Project documentation
```

## Security notes

- Never commit `.env.local` or Neon/Clerk secrets.
- Rotate any credentials that were shared in chat or screenshots.
- `GEMINI_API_KEY` and `DATABASE_URL` are server-only (no `NEXT_PUBLIC_` prefix).

## License

Private project — all rights reserved.