# Contributing

## Scope

- Prefer editing existing screens in `src/views/` and shared pieces in `src/components/`.
- Add new App Router routes under `src/app/` as thin wrappers.
- Persist user data through `/api/me/*` and Neon — avoid new hardcoded demo identities.

## Code style

- Match local patterns (inline styles + CSS variables are common on platform screens).
- Keep TypeScript pragmatic (`strict` is relaxed for the migrated UI).
- Do not introduce secrets into client bundles (`NEXT_PUBLIC_*` only for publishable Clerk keys).
- Avoid drive-by refactors unrelated to the task.

## Database changes

1. Update `src/lib/db/schema.sql`.
2. Run `npm run db:migrate` (or `db:setup` if seeding changes).
3. Document fields in `docs/DATABASE.md` and any new routes in `docs/API.md`.

## Auth UI

Login / register branding and layout should stay custom. Wire Clerk hooks behind the existing screens; do not replace them with default Clerk modals unless explicitly requested.

## Checks before PR

```bash
npm run typecheck
npm run lint
npm run build
```

Manual smoke:

1. Sign up / sign in
2. Confirm `/dashboard` shows the signed-in name (not demo data)
3. Store purchase updates wallet coins
4. Onboarding stage save appears in Neon `onboarding`

## Do not commit

- `.env.local`
- Neon / Clerk secrets
- `.clerk/`
- `node_modules/`, `.next/`
