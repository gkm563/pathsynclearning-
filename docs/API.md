# API

All routes are Next.js Route Handlers under `src/app/api/`.

Authenticated routes use Clerk session cookies and `requireDbUser()` from `src/lib/db/users.ts`.

Client helper: `src/lib/api.ts` (`apiGet`, `apiSend`).

## Auth / me

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me` | Current DB user |
| `POST` | `/api/me` | Upsert user (optional `{ role }`) |

## Profile & settings

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me/profile` | Profile + coins join |
| `PUT` | `/api/me/profile` | Update profile / additional data |
| `GET` | `/api/me/settings` | Theme, accent, plan, plugin |
| `PUT` | `/api/me/settings` | Update settings (`activePlugin` can clear) |

## Wallet

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me/wallet` | Balance + recent transactions |
| `POST` | `/api/me/wallet` | Server-authored action: `deposit` \| `buy_coins` \| `cash_out` \| `buy_coins_amount` \| `cash_out_amount` |
| `PUT` | `/api/me/wallet` | **Removed (410)** — absolute balance writes are not allowed |

Coin packs and cash-out tiers are defined server-side in `src/lib/wallet/catalog.ts`. Clients cannot set arbitrary balances.

## Onboarding

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me/onboarding` | Stage payloads + career |
| `PUT` | `/api/me/onboarding` | Save stage1–4 / selected career |

## Challenges & memory

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me/challenges` | Challenge progress JSON |
| `PUT` | `/api/me/challenges` | Persist `{ state: [] }` |
| `GET` | `/api/me/memory-lane` | Memory entries |
| `POST` | `/api/me/memory-lane` | Append `{ payload }` |

## Notifications

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me/notifications` | List (seeds defaults if empty) |
| `PATCH` | `/api/me/notifications` | `{ id, read }` or `{ markAllRead: true }` |

## Applications

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me/applications` | Applied event / OG IDs |
| `POST` | `/api/me/applications` | `{ eventId, kind: "event" \| "og" }` |

## Store

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/store/products` | Catalog (+ purchased IDs if signed in) |
| `POST` | `/api/store/products` | Purchase `{ productId }` (deducts coins) |

## AI

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/quote` | Quote for `{ phase }` — prefers Neon `quotes`, then Gemini, then local JSON |
| `POST` | `/api/ai/insights` | Career insights via Gemini (server key) |

## Errors

- `400` — bad request / business rule (insufficient coins, invalid pack)
- `401` — missing / invalid Clerk session (`UNAUTHORIZED`)
- `403` — forbidden
- `404` — resource not found
- `409` — conflict (e.g. already purchased)
- `410` — endpoint removed (legacy wallet PUT)
- `422` — validation failed (Zod)
- `429` — rate limited (reserved)
- `500` — unexpected server / database error (message is generic; details logged server-side)

Validated with Zod schemas in `src/lib/validation/schemas.ts`.

## Example

```ts
import { apiGet, apiSend } from "@/lib/api";

const { profile } = await apiGet("/api/me/profile");
await apiSend("/api/me/wallet", "PUT", { coins: 3000 });
```
