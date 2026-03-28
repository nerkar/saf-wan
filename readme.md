# Handicraft verification portal

Prototype for authenticating handicraft products via QR codes linked to artisan records, with planned integration to the Indian Handicrafts Portal API (stubbed until integration).

## Implementation plan (read this first)

The team works from a **single implementation plan** so parallel work stays integrable.

| What | Where |
|------|--------|
| **Full plan (workflow, contracts, per-developer tasks)** | [docs/implementation-plan.md](docs/implementation-plan.md) |
| **AI/editor guidance** | [.cursorrules](.cursorrules) at repo root |

### How to use the plan

1. **New contributor:** Read [docs/implementation-plan.md](docs/implementation-plan.md), then [.cursorrules](.cursorrules), then set up env from `.env.example` (when present).
2. **Before coding a feature:** Confirm your workstream (Dev 1–4) and dependencies in the plan; do not break **integration contracts** (product IDs, `/verify/[productId]`, `getProductForVerification`, `lib/government/` only for gov verification).
3. **Database changes:** Coordinate with the agreed **Prisma migration owner** (see plan — Developer 4) before merging migrations.
4. **Merging:** Follow the plan’s **merge order** (platform stub → auth → products → public/QR → integration branch).

Updating the plan document in-repo is a **team decision** (e.g. after changing scope or APIs).

## Tech stack (summary)

- **Framework:** Next.js (App Router), TypeScript  
- **Data:** PostgreSQL, Prisma  
- **Auth:** Auth.js — Google OAuth + email/password  
- **Hosting:** Vercel  
- **Media:** Object storage (e.g. Vercel Blob or S3-compatible) for demo-sized images/video  

## Project structure

```
saf-wan/
├── .cursorrules              # Cursor / AI project rules
├── docs/
│   └── implementation-plan.md
├── app/
│   ├── (public)/             # Landing, marketplace, /verify — public routes
│   ├── (artisan)/            # Protected artisan dashboard (Auth.js)
│   └── api/                  # Route handlers (upload, webhooks, etc.)
├── lib/
│   ├── government/           # Gov API types + verifyArtisanWithGovernment (stub)
│   └── ...                   # Shared server utilities (db, storage, auth helpers)
├── prisma/
│   └── schema.prisma
├── public/                   # Static assets
└── readme.md
```

Folders under `app/`, `lib/`, and `prisma/` are created as the app is scaffolded; add Next.js entry files (`app/layout.tsx`, etc.) when initializing the project.

## Getting started

1. Clone the repository.
2. Copy [.env.example](.env.example) to `.env` and fill values (after Phase 0 scaffold).
3. Install dependencies and run migrations per README steps added with the Next.js scaffold.
4. `npm run dev` (or `pnpm dev`) — once the app exists.

## License

Add a license if the repository is public or shared.
