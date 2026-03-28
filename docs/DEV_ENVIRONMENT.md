# Initial development environment (Windows — Git Bash)

This guide is for **Windows 10/11**. Use **Git Bash** (included with [Git for Windows](https://git-scm.com/download/win)) or any terminal that runs **Bash** with the same tools on your `PATH`. Avoid PowerShell for the commands below—paste them into **Git Bash**.

Run commands **from the project folder** unless noted. Copy-paste friendly; change only `<...>` placeholders.

---

## 1. Prerequisites

Install these once per PC:

| Tool | Notes | Install on Windows |
|------|--------|---------------------|
| **Git for Windows** | Gives you **Git Bash** + `git` | [https://git-scm.com/download/win](https://git-scm.com/download/win) — defaults are fine. |
| **Node.js** | **20.x LTS** | **Easiest:** [https://nodejs.org](https://nodejs.org) — LTS installer, enable **“Add to PATH”** (includes **npm**). Optional: **fnm** (below) to match `.nvmrc`. |
| **pnpm** (optional) | Faster installs | After Node works: `npm install -g pnpm` |

### Optional: Node 20 via fnm (matches `.nvmrc`)

Use this if you want the same Node version as `.nvmrc`. In **Git Bash**:

```bash
curl -fsSL https://fnm.vercel.app/install | bash
```

Close Git Bash, open it again, then (add `fnm` to your `PATH` if the installer printed instructions—often `source ~/.bashrc`):

```bash
fnm install 20
fnm use 20
node -v
```

You should see `v20.x.x`. In the repo folder later:

```bash
fnm use
```

**If `curl | bash` fails on your PC**, install Node with the **official LTS installer** from [nodejs.org](https://nodejs.org) instead—no Bash script required.

---

## 2. Clone the repository

Canonical remote: **[https://github.com/nerkar/saf-wan](https://github.com/nerkar/saf-wan)**.

```bash
cd ~/Documents
git clone https://github.com/nerkar/saf-wan.git
cd saf-wan
```

**SSH** (if you use SSH keys with GitHub): `git clone git@github.com:nerkar/saf-wan.git`

Use any parent folder instead of `~/Documents` if you prefer; paths **without spaces** reduce tooling issues.

---

## 3. Environment file (`.env`)

From the **project root** (the folder that will contain `package.json` once Phase 0 lands):

```bash
cp .env.example .env
```

Edit `.env` in your editor (pick one):

```bash
notepad.exe .env
```

Or, if you use VS Code / Cursor from Git Bash:

```bash
code .env
```

Do **not** commit `.env`.

### 3.1 `DATABASE_URL` (PostgreSQL)

Use a **hosted** database (no local Postgres install required):

1. Create a free project on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the PostgreSQL connection string (often includes `sslmode=require`).
3. In `.env`, set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
```

Confirm with your lead whether everyone uses one **shared dev** URL or **individual** databases.

### 3.2 Auth secret (Auth.js)

In **Git Bash** (any directory, as long as `node` is on `PATH`):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output into `.env` for **both** (same value), unless the scaffold documents a single variable:

```env
AUTH_SECRET="<paste_here>"
NEXTAUTH_SECRET="<paste_here>"
```

**Optional:** Git for Windows includes `openssl` on the PATH in Git Bash:

```bash
openssl rand -base64 32
```

### 3.3 Local app URL

Keep these aligned with the port you use (default **3000**):

```env
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

If you change the port, update **all** of these and the Google redirect URI below.

### 3.4 Google OAuth (when the app uses Google sign-in)

1. [Google Cloud Console](https://console.cloud.google.com/) → your project → **APIs & Services** → **Credentials** → **OAuth 2.0 Client ID** (Web application).
2. **Authorized redirect URI** (port must match):

   `http://localhost:3000/api/auth/callback/google`

3. In `.env`:

```env
AUTH_GOOGLE_ID="<your-client-id>.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="<your-client-secret>"
```

Use per-developer OAuth clients or shared test credentials from a **secure** channel — never commit secrets.

---

## 4. Install dependencies and database (after Next.js + Prisma exist)

When `package.json` and Prisma are in the repo (Phase 0 done), from the **project root** in Git Bash:

```bash
npm install
```

If the team uses pnpm:

```bash
pnpm install
```

Then:

```bash
npx prisma generate
npx prisma migrate dev
```

If there are no migrations yet:

```bash
npx prisma db push
```

Follow any extra steps in the repo `README` after Phase 0.

---

## 5. Run the dev server

```bash
npm run dev
```

Or:

```bash
pnpm dev
```

Open a browser: [http://localhost:3000](http://localhost:3000).

---

## 6. Git workflow (team)

```bash
git checkout main
git pull
git checkout -b feat/your-feature
```

Use names from [implementation-plan.md](implementation-plan.md) (e.g. `feat/auth`). Before opening a PR:

```bash
git status
git add .
git commit -m "Describe your change in one sentence."
git push -u origin feat/your-feature
```

Coordinate **Prisma migrations** with the migration owner before merging.

---

## 7. Troubleshooting (Windows + Git Bash)

| Issue | What to try |
|--------|--------------|
| `node` or `git` not found | Reopen Git Bash; reinstall Node/Git with **Add to PATH**; confirm `node -v` / `git --version`. |
| `fnm` not found after install | Run `source ~/.bashrc` or open a new Git Bash; follow [fnm Windows notes](https://github.com/Schniz/fnm#windows). |
| Paths look wrong (`/c/Users/...`) | Normal in Git Bash—that’s the Unix-style path to your C: drive. |
| Prisma cannot connect | Check `DATABASE_URL`, firewall/VPN; Neon/Supabase IP allowlist if used. |
| Auth redirect mismatch | `NEXTAUTH_URL` / `AUTH_URL` must match the browser URL and port; Google redirect URI must match **exactly**. |
| Port 3000 in use | `npx kill-port 3000` or Windows Task Manager → end the process on port 3000; or change port and update `.env` + Google URI. |
| Line endings | Prefer LF for scripts; `core.autocrlf` in Git is usually `true` on Windows—if shell scripts break, ask the team. |

---

## Checklist (copy for your notes)

- [ ] Git for Windows installed; **Git Bash** opens
- [ ] Node 20+ installed (`node -v`)
- [ ] Repository cloned; `cd` into `saf-wan`
- [ ] `.env` created from `.env.example` and filled
- [ ] `npm install` (or `pnpm install`)
- [ ] `npx prisma generate` and `migrate dev` or `db push`
- [ ] `npm run dev` — app loads at http://localhost:3000
