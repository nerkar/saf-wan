# Implementation plan — handicraft verification portal

This document is the **in-repo** copy of the team plan. Use it for day-to-day work, PR scope, and integration. Update it only when the team agrees (e.g. after sprint review).

## How to use this plan

0. **Machine setup (Windows):** [DEV_ENVIRONMENT.md](DEV_ENVIRONMENT.md) — Git Bash, clone, Node, `.env`, database, run the app.
1. **Phase 0** is done once: Next.js, Prisma, Postgres, `.env.example`, branch naming, schema owner (Developer 4).
2. After Phase 0, four workstreams run in parallel where possible; respect **merge order** and **integration contracts** below.
3. Before merging features that touch the database, sync with the **Prisma migration owner** to avoid migration conflicts.
4. **Definition of done** for the prototype: artisan can register (email/password or Google), create a product with media, download a QR code, and a public visitor can open `/verify/[productId]` and see public-safe details.

## Integration contracts (all developers)

| Topic | Rule |
|--------|------|
| Product IDs | UUID or CUID from day one for stable QR URLs. |
| Public verification | Path: `/verify/[productId]`. Server-only getter: `getProductForVerification(productId)` — public-safe JSON (no unnecessary PII). |
| Artisan → product | `Product.artisanId` → `User.id` (or agreed profile key). |
| Government API | Only `lib/government/` — typed `verifyArtisanWithGovernment` (stub until real API). |
| Session | Document `session.user.id` usage for scoped queries. |

## Merge order (minimize conflicts)

1. **Dev 4** — `lib/government` stub, `.env.example`, migration process notes.
2. **Dev 1** — Auth.js + `User` / `ArtisanProfile`.
3. **Dev 2** — `Product` / `ProductMedia`, CRUD, `getProductForVerification`.
4. **Dev 3** — Public landing, marketplace listing, `/verify/[productId]`, QR download.
5. **Integration** — merge to `integration` or `demo`, smoke test, then `main`.

## Developer 1 — Auth, profiles, onboarding

**Status:** Implemented — see **[docs/INTEGRATION_AUTH.md](INTEGRATION_AUTH.md)** for session shape, `requireUserId()`, protected routes, and integration checklist for Dev 2–4.

- Auth.js (Google + credentials), Prisma user/session tables as needed.
- `User`, `ArtisanProfile` (`verificationStatus`, optional `externalPortalId`).
- UI: register, login, logout; protect `app/artisan/`.
- Onboarding: `verifyArtisanWithGovernment` on registration and on every `signIn` (OAuth + credentials); persist status.
- Integration doc: [INTEGRATION_AUTH.md](INTEGRATION_AUTH.md).

## Developer 2 — Products, media, dashboard

- `Product`, `ProductMedia`; optional `published`, `category` for marketplace.
- CRUD scoped to `session.user.id` only.
- Uploads via shared storage helper; cap file size for demo video.
- Artisan dashboard: list, create/edit, media gallery.
- Implement `getProductForVerification(productId)`.

## Developer 3 — Public site, QR, verification UI

- Landing + category-style listing.
- `/verify/[productId]` using `getProductForVerification`; mobile-friendly.
- QR encodes `NEXT_PUBLIC_APP_URL/verify/[productId]`; PNG/SVG download from artisan product UI.
- Nav link to artisan login.

## Developer 4 — Platform, stub, storage, Vercel

- `lib/government/`: types + stub (no network).
- Centralized storage client; optional env validation.
- `.env.example`, README setup, Prisma workflow with Dev 1/2.
- Vercel: `NEXTAUTH_URL`, OAuth redirects, DB, storage, `NEXT_PUBLIC_APP_URL`.
- Smoke checklist: login → create product → open `/verify/[id]`.

## Out of scope (prototype)

- Production government API calls (stub only).
- SMS OTP; production video transcoding/CDN tuning.
