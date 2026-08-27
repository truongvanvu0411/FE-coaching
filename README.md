# FE Coach

Mobile-responsive web app for studying towards the Japanese FE (基本情報技術者試験) exam, built around a
verified question bank rather than bulk-scraped content. See
[FE_Coach_WebApp_Spec_Update.md](FE_Coach_WebApp_Spec_Update.md) for the data-quality spec and
[TODO.md](TODO.md) for the phased build plan this app implements.

## Stack

- Next.js 16 (App Router, TypeScript) + Tailwind v4 + shadcn/ui (base-ui primitives)
- Prisma 7 + PostgreSQL (via `@prisma/adapter-pg` driver adapter — required by Prisma 7)
- NextAuth v5 (Credentials, JWT sessions, roles: `LEARNER` / `REVIEWER` / `ADMIN`)
- next-intl (`ja` source locale, `vi` translation locale)
- DeepSeek API for the AI tutor (explain / translate / generate-similar) — grounded on the verified
  DB record so the model can never override an official answer

## Local setup

1. **Start Postgres** (Docker Desktop must be running):
   ```bash
   docker compose up -d postgres
   ```
   Postgres is published on **host port 5434**, not 5432 — this machine already has other projects'
   containers bound to 5432 (`papipo-postgres-1`) and 5433 (`papermark`/`templatedoc`). Verify the
   mapping really applied before debugging connection errors:
   ```bash
   docker compose ps          # expect: 0.0.0.0:5434->5432/tcp
   ```
   If `PORTS` shows a bare `5432/tcp` with no `->`, the container was created without the mapping;
   run `docker compose up -d --force-recreate postgres`. A container with no published port plus a
   *different* Postgres on 5432 produces a very misleading `P1000 / 28P01 authentication failed`,
   because you reach the other server, which has no `fecoach` role.
2. **Configure environment** — copy `.env.example` to `.env` if you don't already have one, and fill in
   `DEEPSEEK_API_KEY`. `AUTH_SECRET` should be a real random value in anything beyond local dev
   (`openssl rand -base64 32`).
3. **Install deps & generate the Prisma client**:
   ```bash
   npm install
   npx prisma generate
   ```
4. **Run migrations + seed**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
   Seeds a topic taxonomy, one admin user (`admin@fecoach.local` / `ChangeMe123!` — change this in
   any shared environment), and one sample `ORIGINAL_PRACTICE` question so the app isn't empty.
5. **Run the dev server**:
   ```bash
   npm run dev
   ```
   Visit http://127.0.0.1:3000, register a learner account, or log in as the seeded admin to reach
   `/admin`. Use `127.0.0.1` rather than `localhost` — the dev server binds IPv4, and `localhost`
   resolves to IPv6 `::1` on this machine, which returns an empty reply.

### Troubleshooting: Docker engine returns HTTP 500 on every command

If `docker version` / `docker compose up` fail with `500 Internal Server Error ... check if the
server supports the requested API version`, the Docker Desktop Linux engine is wedged — usually from
memory pressure when many containers auto-start (`restart: unless-stopped`). On a 16 GB machine,
RagFlow + Elasticsearch + Neo4j + MySQL together are enough to do it. Recover with:

```bash
docker desktop restart
docker stop docker-ragflow-cpu-1 docker-es01-1 papipo-neo4j-1 docker-mysql-1 docker-minio-1
```

Stopped containers stay stopped across Docker restarts (that is what `unless-stopped` means), and
`docker start <name>` brings them back when you need them.

## Data pipeline (spec-driven)

Learner-facing queries (`src/lib/questions.ts`) hard-enforce `verified = true` and
`reviewStatus = VERIFIED` — draft/pending/rejected questions can never reach practice or mock-exam
sessions, no matter what filters are applied. The only way a question becomes visible to learners is
through `/admin/review`.

Ingestion pipeline (`/admin/ingest`): upload a PDF or image → extract text (`pdf-parse` for the
text layer most official IPA PDFs have; `tesseract.js` OCR as a fallback for scanned images) → a
human reviewer splits the extracted text into a structured question, entering the **official answer
key value by hand** → saved as `PENDING_REVIEW` → a reviewer approves via `/admin/review`, at which
point it becomes `VERIFIED` and visible to learners. `/admin/review` also runs a lightweight
duplicate-similarity check (Dice coefficient over character bigrams) against existing questions in
the same topic before publishing.

The AI tutor never determines or edits an official answer — every DeepSeek call in
`src/lib/deepseek.ts` is grounded with the verified DB record as fixed system-prompt context, and
"generate similar question" always creates a `PENDING_REVIEW` draft, never an auto-published one.

## Deployment

`docker-compose.yml` defines both `postgres` and `app` services; `Dockerfile` builds a Next.js
standalone production image. `npm run build` uses `output: "standalone"`.

```bash
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

Uploaded PDFs/images are stored on disk under `storage/uploads` (mounted as a named volume in
compose) — not committed to git and not suitable for a stateless/serverless host as-is.

## Known gaps / follow-ups

- OCR-based question **splitting** (body vs. choices vs. answer key) is a manual, human-driven step
  by design — the spec requires human verification before publish, and automatically parsing
  arbitrary PDF layouts reliably is out of scope for this pass.
- No real IPA question content is seeded — only one placeholder `ORIGINAL_PRACTICE` question ships
  by default, clearly labeled as such per the spec's product principle.
- Admin/reviewer UI copy is in English (internal tooling); learner-facing UI is JA/VI per spec.
- No automated tests yet.
- `npm run lint` reports 5 `react-hooks/set-state-in-effect` findings on the admin pages'
  load-on-mount `useEffect(() => { load() }, [])` pattern (fetch → setState). This is the standard
  "load data on mount" pattern and doesn't affect correctness or the production build (Next doesn't
  gate `next build` on it here) — flagged for awareness, not fixed, since resolving it properly means
  adopting a data-fetching library (SWR/React Query) across the admin pages rather than a local patch.
