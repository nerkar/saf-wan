# Authentication & sessions (Developer 1)

This document is the **integration contract** for anyone touching auth, artisan-only routes, or data scoped to the logged-in user.

## Stack

- **Auth.js v5** (`next-auth` beta) — [Auth.js docs](https://authjs.dev)
- **Entry point:** [`auth.ts`](../auth.ts) — exports `handlers`, `auth`, `signIn`, `signOut`
- **Route:** `GET/POST /api/auth/*` — [`app/api/auth/[...nextauth]/route.ts`](../app/api/auth/[...nextauth]/route.ts)
- **Adapter:** `@auth/prisma-adapter` — persists OAuth `Account` rows; sessions use **JWT** (`session: { strategy: "jwt" }`)

## Environment variables

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Same random string; required for signing JWT/cookies |
| `NEXTAUTH_URL` / `AUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) — must match browser + OAuth redirect URIs |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (optional; hide “Continue with Google” if unset) |
| `DATABASE_URL` | PostgreSQL for Prisma + Auth adapter tables |

## Session shape

After sign-in, the JWT/session callback sets **`session.user.id`** to the Prisma **`User.id`** (string, cuid).

### Server Components & Server Actions

```ts
import { auth } from "@/auth";

const session = await auth();
const userId = session?.user?.id; // string | undefined
```

### Preferred helpers (avoid duplicating redirect logic)

```ts
import { requireUserId, getOptionalUserId } from "@/lib/session";

// Must be logged in → redirects to /login if not
const userId = await requireUserId();

// Optional auth
const id = await getOptionalUserId();
```

### Client Components

- Use `signIn` / `signOut` from `next-auth/react` (see [`components/login-form.tsx`](../components/login-form.tsx)).
- Do **not** read secrets on the client. `session` via `useSession()` if needed (optional; we use server `auth()` where possible).

## Protected routes

- **`/artisan/*`** is protected by [`app/artisan/layout.tsx`](../app/artisan/layout.tsx) using `requireUserId()` — unauthenticated users are redirected to `/login`.
- There is **no** `middleware.ts` for auth yet; protection is layout-based. Add middleware later if you need edge-level redirects.

## Database models (auth-related)

| Model | Role |
|-------|------|
| `User` | Core user; `email`, optional `password` (bcrypt) for credentials |
| `Account` | OAuth links (Google) |
| `Session` | Present for Prisma adapter compatibility; JWT strategy is primary for session |
| `ArtisanProfile` | 1:1 with `User`; `verificationStatus`, `externalPortalId` |

**Foreign key for products:** `Product.artisanId` → `User.id` (see Prisma schema).

## Government verification stub

- **Only** call [`verifyArtisanWithGovernment`](../lib/government/index.ts) from agreed flows — do not duplicate stub logic.
- **Credentials registration** ([`app/register/actions.ts`](../app/register/actions.ts)): creates user + profile, calls stub, persists `verificationStatus` / `externalPortalId`.
- **Every sign-in** ([`auth.ts`](../auth.ts) `events.signIn`): ensures `ArtisanProfile` exists, re-runs stub, updates profile (keeps OAuth and credentials aligned until real API is gated).

## Integration checklist for Dev 2 / 3 / 4

1. **Scope by artisan:** `where: { artisanId: userId }` with `userId` from `requireUserId()` or `session.user.id`.
2. **Do not** trust `userId` from client input — always take it from the session server-side.
3. **Public verification** stays on `getProductForVerification` in [`lib/product-verification.ts`](../lib/product-verification.ts) — no session required for buyers.

## Files owned / touched by Dev 1 (reference)

| File | Purpose |
|------|---------|
| `auth.ts` | Auth.js configuration, providers, callbacks, `signIn` event + gov stub |
| `lib/session.ts` | `requireUserId`, `getOptionalUserId` |
| `app/api/auth/[...nextauth]/route.ts` | Auth HTTP handlers |
| `app/login/*`, `app/register/*` | Login / register UI + register server action |
| `app/artisan/layout.tsx` | Auth gate for artisan area |
| `types/next-auth.d.ts` | `session.user.id` typing |
| `prisma/schema.prisma` | `User`, `Account`, `Session`, `ArtisanProfile` |

## Changing this contract

Coordinate with the team before changing `session.user.id` semantics, JWT vs database session, or `ArtisanProfile` shape — it affects products, verification pages, and the gov integration.
