# Deploying on Vercel

**Inventory of all Vercel-related code and env:** [vercel-platform-touchpoints.md](vercel-platform-touchpoints.md) — also search the codebase for `@vercel-platform`.

## Build

The project uses **`vercel.json`** so production builds run:

`npm run vercel-build` → `prisma migrate deploy && next build`

- **`DATABASE_URL`** must be available at **build time** so migrations can run (set for Production, and for Preview if those builds should migrate a preview database).
- Local quick builds without applying migrations: `npm run build` (plain `next build`).

## Required environment variables

Copy from [`.env.example`](../.env.example) and set in **Vercel → Project → Settings → Environment Variables** (Production / Preview / Development as needed):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string. |
| `AUTH_SECRET` | Strong random secret (same pattern as `.env.example`). |
| `NEXTAUTH_SECRET` | Optional duplicate of `AUTH_SECRET` if your tooling expects it. |
| `NEXTAUTH_URL` | Public site URL, e.g. `https://your-app.vercel.app` (no trailing slash). |
| `AUTH_URL` | Same as `NEXTAUTH_URL` for Auth.js v5. |
| `NEXT_PUBLIC_APP_URL` | Same origin as above — used for QR codes and public links. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | If using Google sign-in: add redirect URI `https://YOUR_DOMAIN/api/auth/callback/google` in Google Cloud Console. |
| Blob / S3 vars | If product uploads use storage (see product integration docs). |

## After deploy

1. Open the deployment URL and run the smoke path from [implementation-plan.md](implementation-plan.md) (login → product → `/verify/[id]`).
2. Confirm OAuth redirect URIs match the deployed hostname exactly (including `https`).
