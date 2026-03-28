# Handicraft verification portal

Prototype for authenticating handicraft products via QR codes linked to artisan records, with planned integration to the Indian Handicrafts Portal API (stubbed until integration).

**Repository:** [github.com/nerkar/saf-wan](https://github.com/nerkar/saf-wan)

## Implementation plan (read this first)

The team works from a **single implementation plan** so parallel work stays integrable.

| What | Where |
|------|--------|
| **Full plan (workflow, contracts, per-developer tasks)** | [docs/implementation-plan.md](docs/implementation-plan.md) |
| **AI/editor guidance** | [.cursorrules](.cursorrules) at repo root |

### How to use the plan

1. **New contributor:** Follow [docs/DEV_ENVIRONMENT.md](docs/DEV_ENVIRONMENT.md), then read [docs/implementation-plan.md](docs/implementation-plan.md) and [.cursorrules](.cursorrules).
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

## Getting started (local development)

**Copy-paste setup (Windows):** follow **[docs/DEV_ENVIRONMENT.md](docs/DEV_ENVIRONMENT.md)** — **Git Bash** commands, `.env`, database, Auth secrets, Google OAuth, npm, Prisma, and Git.

Quick summary:

1. Install **Git for Windows** (includes **Git Bash**) and **Node.js 20 LTS** (see `.nvmrc`; optional **fnm** via curl in Bash is in [docs/DEV_ENVIRONMENT.md](docs/DEV_ENVIRONMENT.md), or use the [Node.js installer](https://nodejs.org)).
2. Clone: `git clone https://github.com/nerkar/saf-wan.git` — then work in **Git Bash** (or another Bash terminal) from the project folder.
3. `cp .env.example .env` and fill values per [docs/DEV_ENVIRONMENT.md](docs/DEV_ENVIRONMENT.md).
4. After Phase 0 adds `package.json` and Prisma: `npm install`, `npx prisma generate`, `npx prisma migrate dev` (or `db push` as documented).
5. `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## License

Add a license if the repository is public or shared.
