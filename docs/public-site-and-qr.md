# Public site, verification page, and QR codes (Developer 3)

This document describes the **public** routes, how they connect to **Developer 2’s** `getProductForVerification`, and how **QR codes** are generated so other workstreams can integrate without guesswork.

## Routes

| Route | Purpose |
|--------|---------|
| `/` | Landing and **marketplace**: lists `published` products grouped by `category` (see `app/page.tsx`). |
| `/verify/[productId]` | **Public verification** UI. Data comes **only** from `getProductForVerification(productId)` in `lib/product-verification.ts`. |
| `/login`, `/register` | Artisan auth (Developer 1). Linked from the header and home copy. |

Unpublished or missing products: `/verify/[productId]` returns **404** (`not-found.tsx`).

## Integration contract (must not break)

1. **Product IDs** — UUID on `Product.id` (Prisma). QR URLs are stable: `/verify/{id}`.
2. **Public data** — Do not add secrets or unnecessary PII to `getProductForVerification` or the verify page. Extend `ProductVerificationPayload` in `lib/product-verification.ts` only with team agreement.
3. **Published gate** — Verification only resolves products with `published: true` (same rule as the home marketplace).

## Environment

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_APP_URL` | Base URL for **absolute** verification links in QR codes and the artisan dashboard (no trailing slash). Must match the deployed host on Vercel (see `.env.example`). |

**Server helper:** `getPublicAppBaseUrl()` and `getProductVerificationUrl(productId)` in `lib/verification-url.ts` — use these anywhere you need the same URL the QR encodes (emails, share links, logging).

## QR API

| Endpoint | Behavior |
|----------|----------|
| `GET /api/products/[id]/qr` | PNG image (`image/png`). Encodes `getProductVerificationUrl(id)`. |
| `GET /api/products/[id]/qr?format=svg` | SVG (`image/svg+xml`). Same encoded URL as PNG. |

Implementation: `app/api/products/[id]/qr/route.ts` (uses the `qrcode` package).

**Artisan UI:** `app/artisan/page.tsx` exposes **QR (PNG)** and **QR (SVG)** download actions per product.

## Files map (Dev 3 ownership)

| Area | Location |
|------|----------|
| Marketplace / landing | `app/page.tsx` |
| Verify UI + metadata | `app/verify/[productId]/page.tsx`, `app/verify/layout.tsx` |
| Verify 404 | `app/verify/[productId]/not-found.tsx` |
| QR route | `app/api/products/[id]/qr/route.ts` |
| Verification URL helpers | `lib/verification-url.ts` |
| Public payload (shared with Dev 2) | `lib/product-verification.ts` — `getProductForVerification` |
| Global nav (login link) | `components/site-header.tsx` |

## Checklist for integration / smoke tests

1. Set `NEXT_PUBLIC_APP_URL` (local: `http://localhost:3000`).
2. Register as artisan, create a product, mark **Published**.
3. Home shows the product under the right category; link opens `/verify/[id]`.
4. From the artisan dashboard, download PNG and SVG QR; scanning or opening the encoded URL shows the verify page.
5. Unpublish or use a random UUID — verify page shows not found.

## Merge order reminder

Per [implementation-plan.md](implementation-plan.md), public/QR work follows **Dev 4** (stub/env), **Dev 1** (auth), and **Dev 2** (products + `getProductForVerification`).
