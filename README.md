# BuildMint

Learn systems engineering by **building**, not memorizing. BuildMint is a
story-driven, project-based learning platform: students work through Courses →
Chapters → Sections (Learn, Quiz, Build, Checklist), write real code, and get
asynchronous AI audits and teacher support.

This repository currently implements the **foundation** (Phase 1 + the core of
Phase 2 — the Course Engine). See the roadmap below for what is stubbed vs.
planned.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + shadcn-style UI components
- **Prisma 6** ORM + **PostgreSQL**
- Cookie-based sessions signed with **jose** (JWT), passwords hashed with **bcryptjs**

## Prerequisites

- Node.js 22+
- A PostgreSQL database (local dev uses one running on `localhost:5432`)

## Setup

```bash
npm install                 # installs deps and runs `prisma generate`
cp .env.example .env        # then edit values as needed
npm run db:migrate          # apply the schema to your database
npm run db:seed             # create a demo teacher + sample course
npm run dev                 # start the dev server on http://localhost:3000
```

### Demo credentials (from the seed)

- Teacher: `teacher@buildmint.dev` / `password123`
- Or sign up a new student account at `/signup`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Create/apply a dev migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Drop, re-migrate, and re-seed the database |

## Database schema

See `prisma/schema.prisma`. Models: `User`, `Course`, `Chapter`, `Section`,
`Progress`, `AiAuditFlag`, `SupportThread`.

## Roadmap

- **Phase 1 — Foundation & Auth** ✅ signup/login, session, sidebar + content layout, schema.
- **Phase 2 — Course Engine** ✅ Learn (markdown), Quiz (multiple choice), Checklist (updates `Progress`); Build section is a functional placeholder.
- **Phase 3 — In-browser sandbox** ⏳ WebContainers + Monaco + Xterm + PGlite (`BuildSection` is the mount point).
- **Phase 4 — AI audit background service** ⏳ Inngest/Trigger.dev + OpenAI/Anthropic → `AiAuditFlag` (needs API keys).
- **Phase 5 — Support threads & gamification** ⏳ teacher dashboard, Resend daily emails (needs API keys).
