# Vercel platform touchpoints

Use this list when configuring a **Vercel** project or reviewing a deploy. In the repo, integration points are also tagged with **`@vercel-platform`** in source comments (grep-friendly).

## Grep

```bash
rg "@vercel-platform" --glob "*.ts" --glob "*.tsx"
rg "vercel-platform" .
```

## Build & project config

| Location | Role |
|----------|------|
| [`vercel.json`](../vercel.json) | `buildCommand` → `npm run vercel-build` (Prisma migrate + Next build) |
| [`package.json`](../package.json) | `vercel-build` script; `engines.node`; dependency `@vercel/blob` |
| [`docs/vercel-deployment.md`](vercel-deployment.md) | Env checklist for Production / Preview |

## Runtime env (Vercel → Settings → Environment Variables)

| Variable | Used for |
|----------|----------|
| `DATABASE_URL` | Prisma (`lib/prisma.ts`) |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Auth.js (`auth.ts`) |
| `NEXTAUTH_URL`, `AUTH_URL` | OAuth callbacks, session |
| `NEXT_PUBLIC_APP_URL` | QR + public links (`lib/verification-url.ts`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob uploads (`lib/storage*.ts`) |
| `AUTH_GOOGLE_*` | Google OAuth |

## Code modules (`@vercel-platform` tags)

| Tag in file | Package / concern |
|-------------|-------------------|
| `blob` | `@vercel/blob` — `lib/storage.ts`, `lib/storage/index.ts`, `lib/storage/env.ts` |
| `prisma` | Serverless Prisma client — `lib/prisma.ts` |
| `public-url` | `NEXT_PUBLIC_APP_URL` — `lib/verification-url.ts` |
| `auth` | Auth.js deployment URLs / secret — `auth.ts` |
| `api-blob` | Upload route using blob storage — `app/api/products/[productId]/media/route.ts` |
| `qr` | QR PNG/SVG uses `getProductVerificationUrl` — `app/api/products/[productId]/qr/route.ts` |

## UI copy (non-code)

| Location | Notes |
|----------|--------|
| `app/artisan/products/[productId]/edit/product-edit-form.tsx` | Mentions Vercel Blob when uploads disabled |

## Docs (reference only)

| Doc | Topic |
|-----|--------|
| [`integration-platform.md`](integration-platform.md) | Storage backend, Vercel env |
| [`public-site-and-qr.md`](public-site-and-qr.md) | `NEXT_PUBLIC_APP_URL` on Vercel |
