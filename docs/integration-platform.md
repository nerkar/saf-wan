# Platform integration (Developer 4)

This document is the handoff for **government stub**, **object storage**, **environment variables**, **Prisma coordination**, and **Vercel**. Other workstreams should treat it as the source of truth for these topics unless the team updates the [implementation plan](implementation-plan.md).

## Government verification API

- **Module:** `lib/government/`
- **Entry:** `verifyArtisanWithGovernment(input)` — async, **no network** in the prototype.
- **Types:** `lib/government/types.ts` — `GovernmentVerificationInput`, `GovernmentVerificationResult`, `GovernmentVerificationStatus`.
- **Contract:** `GovernmentVerificationStatus` must stay aligned with the Prisma enum `VerificationStatus` in `schema.prisma` (`PENDING`, `VERIFIED`, `REJECTED`). When the real portal returns different labels, map them in this module only.

### Replacing the stub

1. Implement HTTP client code **inside** `lib/government/` (e.g. `client.ts`), keeping `verifyArtisanWithGovernment` as the single exported call used by onboarding (see `app/register/actions.ts`).
2. Do **not** duplicate stub or verification logic under `app/` or other `lib/` folders; that breaks the integration contract in `.cursorrules`.
3. Map timeouts, HTTP errors, and unknown responses to a `GovernmentVerificationResult` with a safe `status` (often `PENDING` or `REJECTED`) and an optional `message` for support.

## Object storage (product media)

- **Module:** `lib/storage/` — **server-only** (`import "server-only"`); never import from client components.
- **Configured when:** `BLOB_READ_WRITE_TOKEN` is set (Vercel Blob).
- **Upload API:** `uploadPublicMedia({ pathname, body, contentType })` → `{ url }`. Persist `url` on `ProductMedia.url` (Developer 2).

### Path naming

Use predictable prefixes so buckets stay organized and support is easier, for example:

- `products/{productId}/{uuid}-{safeFileName}`

Avoid raw user email or legal names in `pathname` when the bucket is shared.

### Local development without Blob

Media upload routes may return a clear configuration error until `BLOB_READ_WRITE_TOKEN` is set, or the team may add a **dev-only** local disk adapter later — if so, gate it on `NODE_ENV === "development"` and document it here.

### Future: S3-compatible storage

`lib/storage/env.ts` currently resolves `vercel-blob` vs `none`. Adding S3 would mean extending `getStorageBackend()`, implementing the same `UploadPublicMediaParams` → `UploadPublicMediaResult` flow, and documenting new env vars in `.env.example`.

## Environment variables

Copy from [`.env.example`](../.env.example). Summary:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Auth.js — use the same random value for both unless the team standardizes on one |
| `AUTH_URL` / `NEXTAUTH_URL` | Must match the URL users open (origin + port); drives OAuth callback URLs |
| `NEXT_PUBLIC_APP_URL` | Same origin as the public site; base URL for QR codes (`/verify/[productId]`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (optional locally) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token when using hosted uploads |

Optional diagnostics: `getServerEnvIssues()` in `lib/env/server.ts` returns human-readable problems (missing DB URL, secrets, URLs). Safe to call from a future health route or startup log.

## Prisma migrations (coordination)

Per the implementation plan, **Developer 4** owns the **migration process** documentation and merge-order expectations; **schema changes** from Developer 1 and 2 should be coordinated before parallel merges land on `main`.

**Workflow:**

1. **One migration at a time on shared branches:** avoid two PRs each adding unrelated `prisma/migrations/*` folders without sequence agreement.
2. After pulling, run `npx prisma migrate dev` (or `db push` only when explicitly agreed for throwaway DBs).
3. **Developer 1** typically owns `User` / `ArtisanProfile` / Auth adapter models; **Developer 2** owns `Product` / `ProductMedia`. Either side can propose schema edits, but the **Prisma migration owner** (agreed as Dev 4 for this repo) should review ordering against [merge order](implementation-plan.md#merge-order-minimize-conflicts): platform → auth → products → public/QR.

Document in the PR which models changed and whether a merge dependency exists (e.g. “requires Dev 1 `User` already on branch”).

## Vercel deployment

1. **Project settings → Environment variables:** set all variables from `.env.example` for Production (and Preview if you test OAuth there).
2. **`NEXTAUTH_URL` / `AUTH_URL`:** production site URL, e.g. `https://your-app.vercel.app` — **no trailing slash** (match local convention).
3. **`NEXT_PUBLIC_APP_URL`:** same value as the public origin so QR codes point at the deployed host.
4. **Google OAuth:** add the production callback  
   `https://<your-domain>/api/auth/callback/google`  
   to the Google Cloud Console OAuth client.
5. **Database:** use Vercel Postgres, Neon, or another Postgres provider; set `DATABASE_URL`; run `prisma migrate deploy` in the build command or as a one-off (team choice). Typical pattern: `"build": "prisma migrate deploy && next build"` once migrations exist — confirm with the migration owner before changing `package.json` scripts.
6. **Blob:** create a Blob store in the Vercel project; add `BLOB_READ_WRITE_TOKEN` to the environment.

## Session shape (for scoped queries)

Auth.js session should expose `session.user.id` (string, Prisma `User.id`) for **Developer 2** to scope `Product` queries. Exact shape is documented by **Developer 1** in the README when auth is finalized; server code must not trust client-sent user IDs.

## Smoke checklist (prototype)

Use after merges to an integration or demo branch:

1. Register or log in as an artisan (`/register`, `/login`).
2. Create a product with media (once upload uses `uploadPublicMedia`).
3. Publish if the UI requires it for public verify.
4. Open `/verify/[productId]` in an incognito window and confirm public-safe payload (no private emails unless intentionally shown).

## Related docs

- [DEV_ENVIRONMENT.md](DEV_ENVIRONMENT.md) — Windows local setup  
- [implementation-plan.md](implementation-plan.md) — workstreams and merge order  
- [readme.md](../readme.md) — repository overview  
