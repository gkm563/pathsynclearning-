# Database

PathEd uses **Neon PostgreSQL** with **Drizzle ORM** (`drizzle-orm` + `@neondatabase/serverless` HTTP driver).

- Connection: `DATABASE_URL` in `.env.local`
- Drizzle schema (source of truth): `src/lib/db/schema.ts`
- SQL bootstrap (extensions / triggers / initial create): `src/lib/db/schema.sql`
- Client: `src/lib/db/client.ts` → `getDb()`
- Auth bridge: `src/lib/db/users.ts` → `requireDbUser()`
- API mappers: `src/lib/db/mappers.ts` (camelCase rows → snake_case JSON)

## Setup commands

```bash
npm run db:setup      # apply schema.sql + seed store products & quotes
npm run db:migrate    # schema.sql only
npm run db:generate   # drizzle-kit generate SQL migrations from schema.ts
npm run db:push       # drizzle-kit push schema.ts to Neon
npm run db:studio     # open Drizzle Studio
```

## Tables

| Table | Purpose |
|-------|---------|
| `users` | Clerk-linked account (`clerk_id`, email, role) |
| `profiles` | Academic identity, CRI, XP, streak, skills, projects |
| `onboarding` | Stage 1–4 JSON payloads + selected career |
| `user_settings` | Theme, accent, plan, active plugin |
| `wallets` | Coins + cash balance |
| `wallet_transactions` | Ledger entries |
| `store_products` | Purchasable catalog |
| `purchases` | User ↔ product ownership |
| `notifications` | In-app notification feed |
| `challenge_progress` | Persisted challenge state JSON |
| `memory_lane_entries` | Challenge completion memories |
| `event_applications` | Event / OG opportunity applications |
| `quotes` | Daily motivation quotes by phase |

Related rows for a new user are created automatically in `ensureRelatedRows()` when `requireDbUser()` runs.

## Seed data

`scripts/db-setup.mjs` seeds:

- Store products from `src/data/store-catalog.ts`
- Quotes from `src/data/quotes_dataset.json` (skipped if already present)

## Roles

`users.role` is constrained to:

- `student`
- `teacher`
- `recruiter`

## Conventions

- Prefer UUID primary keys (`gen_random_uuid()`).
- Use `TIMESTAMPTZ` for timestamps.
- Flexible student payloads (skills, projects, challenge state) use `JSONB`.
- Do not store secrets in the database; keep API keys in env only.

## Local tips

- Re-running `db:setup` is safe for schema (`IF NOT EXISTS`).
- After rotating a Neon password, update `DATABASE_URL` and re-test `npm run db:setup`.
- Inspect tables in the Neon SQL editor or any Postgres client pointed at the pooler URL.
