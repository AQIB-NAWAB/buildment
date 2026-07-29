<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

BuildMint is a single Next.js 16 (App Router) app backed by PostgreSQL via Prisma 6.
The startup update script only runs `npm install` (which triggers `prisma generate`
via `postinstall`). PostgreSQL and the database schema are **not** managed by the
update script, so start/prepare them manually per below.

### Database (must be running before `npm run dev`, migrate, or seed)
- A local PostgreSQL 16 cluster is used in dev. Start it with:
  `sudo pg_ctlcluster 16 main start`
- Dev role/db: user `buildmint`, password `buildmint`, database `buildmint`.
  `DATABASE_URL` lives in `.env` (see `.env.example`). If the role/db is missing on a
  fresh machine, recreate with:
  `sudo -u postgres psql -c "CREATE ROLE buildmint LOGIN PASSWORD 'buildmint' CREATEDB;"`
  then `sudo -u postgres createdb -O buildmint buildmint`.
- Apply schema: `npm run db:migrate` (creates/applies dev migrations).
- Seed demo data (teacher + sample course): `npm run db:seed`.
  Seed login: `teacher@buildmint.dev` / `password123`. Students self-register at `/signup`.

### Run / lint / build
- Dev server: `npm run dev` → http://localhost:3000 (Turbopack; `/` redirects to `/login`).
- Lint: `npm run lint`. Production build: `npm run build`.

### Gotchas
- Prisma is intentionally pinned to the **6.x** line. Prisma 7 removed `url` from the
  datasource block (requires `prisma.config.ts` + a driver adapter); do not bump major
  without migrating the config, or `prisma generate`/`migrate` will fail.
- Auth is a lightweight custom implementation (signed JWT cookie via `jose` +
  `bcryptjs`), not NextAuth, chosen for compatibility with the bleeding-edge Next 16.
  `AUTH_SECRET` in `.env` signs sessions.
- Later phases (AI audit via Inngest+LLM, Resend emails) are stubbed and require
  external API keys (`OPENAI_API_KEY`, `INNGEST_*`, `RESEND_API_KEY`).

### Phase 3 Workbench (WebContainer) gotchas — non-obvious
- The workbench lives at `/(app)/courses/[courseId]/build/[sectionId]` and boots a
  StackBlitz WebContainer. This requires the page to be **cross-origin isolated**;
  `next.config.ts` sets COOP `same-origin` + COEP **`require-corp`**.
  Do NOT switch COEP to `credentialless`: the StackBlitz-hosted runtime iframe needs a
  credentialed context and silently hangs at "Booting WebContainer…" under
  credentialless. `WebContainer.boot({ coep })` must match the header value.
- `reactStrictMode` is set to `false` because WebContainer is a single-boot-per-tab
  singleton; Strict Mode's dev double-mount orphans the boot effect.
- WebContainer needs outbound network to `stackblitz.com` (hosted runtime). If egress
  is blocked, the boot will time out after 45s and the UI shows a graceful error; the
  Monaco editor and the in-browser Postgres (PGlite "Database" tab) still work offline.
- Monaco loads from its CDN and works under COEP `require-corp` (CDN sends CORP).
