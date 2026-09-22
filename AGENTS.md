# Agent notes

PathED is **one product family**, not one mixed dashboard for every login.

**Read first:** [docs/PLATFORM.md](docs/PLATFORM.md) — hosts, customer roles (`student` \| `teacher` \| `recruiter`), API ownership, monorepo target, Flutter rules.

**Student roadmap:** [docs/ROADMAP.md](docs/ROADMAP.md) — nested graph, Ollama generate, study calendar, assessments.

**Stack and hosting:** [docs/STACK.md](docs/STACK.md) — Next/Clerk/Neon/LLM, Vercel limits, VPS options.

**Staff admin:** [docs/ADMIN.md](docs/ADMIN.md) — separate app and host. Specified only; not in code.

Hard rules:

- Teacher / Educator / Mentor = **one** login role: `teacher`. Do not add extra `AppRole` values unless the platform doc is updated.
- `admin` is **not** a public signup role. Do not add it to `AUTH_ROLES` or `AppRole` until implementing ADMIN.md.
- Teacher and recruiter are not staff admin. Do not put teacher, recruiter, or admin UI under `/dashboard`.
- Student chrome has one owner: `src/app/(app)/(portal)/layout.tsx` → `PortalShell`. Admin will use `AdminShell` in `apps/admin` only.
- `/api/me` is student-only. Other roles get their own API prefixes (`/api/teacher`, `/api/admin` on the admin origin).
- The repo is still a **single Next app**; behave as if platforms were already separate.

Student portal shell details: `.cursor/rules/portal-shell-ownership.mdc`.
