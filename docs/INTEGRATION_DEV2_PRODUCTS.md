# Developer 2 — Products & media (integration guide)

This document describes what the **products / media / verification data** workstream exposes so **Developer 3** (public UI, QR polish) and **integration** can plug in without surprises.

## Session and ownership

- All artisan product mutations are scoped with **`session.user.id`** (Auth.js JWT session).
- `Product.artisanId` is the owning user’s id. Queries must always filter by both `id` and `artisanId` (or use a single `findFirst` with both) so artisans cannot edit each other’s listings.

## Public verification API (server-only)

**Module:** `lib/product-verification.ts`

| Export | Purpose |
|--------|---------|
| `getProductForVerification(productId)` | Returns **public-safe** JSON for `/verify/[productId]` or any server component. |
| `ProductVerificationPayload` | Type of the return value (minus `null`). |

**Rules:**

- Only **published** products are returned (`published: true` in the query).
- The payload intentionally avoids unnecessary PII; artisan is exposed as `displayName` and a stable `publicId` (currently `User.id`).
- **Do not** duplicate this query in random API routes — import the helper so behavior stays consistent.

## Storage uploads (optional for local dev)

**Module:** `lib/storage.ts`

| Export | Purpose |
|--------|---------|
| `isBlobStorageConfigured()` | `true` when `BLOB_READ_WRITE_TOKEN` is set (Vercel Blob). |
| `uploadProductBlob(...)` | Server-only upload with MIME validation and size limits. |
| `MAX_PRODUCT_IMAGE_BYTES` / `MAX_PRODUCT_VIDEO_BYTES` | Demo caps (5 MB images, 50 MB video). |

**Environment:** see `.env.example` — uncomment `BLOB_READ_WRITE_TOKEN` for Vercel Blob. Without it, artisans can still add media via **HTTPS URL** on the product edit screen.

## HTTP routes relevant to integration

| Method & path | Auth | Behavior |
|---------------|------|----------|
| `POST /api/products/[productId]/media` | Session required | Multipart `file` field; verifies product ownership; uploads to Blob (if configured); creates `ProductMedia` with next `sortOrder`. |
| `GET /api/products/[productId]/qr` | Public | PNG QR for `NEXT_PUBLIC_APP_URL/verify/[productId]` (Developer 3 may restyle or relocate). |

## Server actions (artisan UI)

**Module:** `app/artisan/products/actions.ts`

Used by dashboard and product forms. All actions enforce login + ownership where applicable.

| Action | Notes |
|--------|--------|
| `createProduct` | Creates product + optional first image URL (quick path from “New product”). |
| `updateProduct` | Fields + `published`; revalidates listing and verify paths. |
| `deleteProduct` | Cascades media via Prisma; redirects to `/artisan`. |
| `addProductMediaFromUrl` | Adds `ProductMedia` with explicit IMAGE/VIDEO. |
| `removeProductMedia` | By `mediaId`; checks parent product owner. |
| `moveProductMedia` | Swap `sortOrder` with sibling (`up` / `down`). |

## UI routes (App Router)

| Path | Role |
|------|------|
| `/artisan` | Lists products; links to edit, QR download, verify URL. |
| `/artisan/products/new` | Create product (URL-based media optional). |
| `/artisan/products/[productId]/edit` | Full edit + media gallery + upload/URL + delete product. |

## Merge / dependency notes

- Prisma models `Product` and `ProductMedia` are shared; coordinate **migrations** with the team migration owner (see `docs/implementation-plan.md`).
- Developer 3 should consume **`getProductForVerification`** on `/verify/[productId]` (already wired) and may enhance layout; QR should continue to target `NEXT_PUBLIC_APP_URL/verify/[productId]`.

## Quick manual test checklist (Dev 2 + integration)

1. Log in as an artisan; create a product; set **Published** if it should appear on the home page and verify flow.
2. Open **Edit**; add media by URL; optionally configure Blob and upload a file; reorder and remove media.
3. Open `/verify/[uuid]` for that product — expect media order to match gallery order.
4. Unpublish or delete — verify page should 404 (not published) or disappear (deleted).
