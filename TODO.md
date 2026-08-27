# FE Coach WebApp — Build Plan

Stack: Next.js (App Router, TS) + Prisma + self-hosted Postgres. i18n: JP gốc + VI dịch. Mobile-first responsive.

---

## Phase 0 — Foundation
- [ ] Init Next.js 15 TS repo, ESLint/Prettier, Tailwind + shadcn/ui
- [ ] Postgres instance (self-host: Docker Compose `postgres:16`), Prisma init + `DATABASE_URL`
- [ ] Auth (NextAuth/Auth.js — email+password or OAuth), roles: `LEARNER`, `REVIEWER`, `ADMIN`
- [ ] Base layout: mobile-first shell (bottom nav on mobile, sidebar on desktop), dark mode
- [ ] Env/config for i18n (`next-intl` or `next-i18next`), locales: `ja` (source), `vi` (translation)

## Phase 1 — Data Model (Prisma schema)
```prisma
enum Section     { A B }
enum SourceType  { IPA_PUBLIC IPA_EXEMPTION LEGACY_MORNING ORIGINAL_PRACTICE }
enum Difficulty  { EASY MEDIUM HARD }
enum ReviewStatus { DRAFT PENDING_REVIEW VERIFIED REJECTED }
enum Role        { LEARNER REVIEWER ADMIN }

model Question {
  id            String       @id            // e.g. FE-A-2025-PUBLIC-001
  section       Section
  year          Int?
  sourceType    SourceType
  sourceUrl     String?
  sourcePage    String?
  questionNumber String?
  topic         Topic        @relation(fields: [topicId], references: [id])
  topicId       String
  difficulty    Difficulty
  bodyJa        String
  bodyVi        String?
  choices       Choice[]
  correctAnswer String                       // choice key, from DB only — never AI
  explanationJa String?
  explanationVi String?
  vocabulary    VocabItem[]
  assets        Asset[]
  isObsolete    Boolean      @default(false)
  verified      Boolean      @default(false)
  reviewStatus  ReviewStatus @default(DRAFT)
  duplicateOfId String?                      // dedup pointer
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Choice     { id String @id; questionId String; key String; textJa String; textVi String? }
model Topic      { id String @id; nameJa String; nameVi String; parentId String? }
model VocabItem  { id String @id; questionId String; termJa String; reading String?; meaningVi String }
model Asset      { id String @id; questionId String; type String; url String }   // images/tables

model User       { id String @id; email String @unique; name String?; role Role @default(LEARNER); ... }
model Attempt    { id String @id; userId String; questionId String; chosenAnswer String; isCorrect Boolean; createdAt DateTime @default(now()) }
model Bookmark   { userId String; questionId String; @@id([userId, questionId]) }
model AiChatLog  { id String @id; userId String; questionId String?; role String; content String; createdAt DateTime @default(now()) } // DeepSeek tutor logs, audit trail
```
- [ ] Migrate + seed script (topics taxonomy for FE syllabus A/B)
- [ ] Constraint: `correctAnswer` editable only via reviewer/admin API, never by AI service

## Phase 2 — Ingestion & Verification Pipeline (internal/admin tool)
Pipeline: `IPA PDF → OCR/Parse → Question Split → Choice Parsing → Extract Images/Tables → Match Answer Key → Human Verification → Topic Mapping → Duplicate Detection → Publish`
- [ ] PDF upload + OCR service (Tesseract or cloud OCR) → raw text extraction job
- [ ] Parser: split into question/choices/images by heuristics (regex + layout)
- [ ] Answer-key matcher: cross-reference official PDF answer key → auto-fill `correctAnswer` (draft, `verified=false`)
- [ ] Reviewer UI: side-by-side (scanned PDF vs parsed JSON), edit fields, approve → `verified=true`, `reviewStatus=VERIFIED`
- [ ] Duplicate detection: embedding similarity search (pgvector) against existing bank before publish
- [ ] Legacy filter workflow: topic-mapping + "still in current syllabus?" checkbox + obsolete-tech flag → `isObsolete`
- [ ] Original practice question form: forces footer badge "Source: Original Practice Question — NOT an official IPA exam question"
- [ ] Audit log of who verified what, when (compliance with "DeepSeek must never determine official answer")

## Phase 3 — Learner-Facing Practice App
- [ ] Question bank browse: filter by section (A/B), topic, difficulty, sourceType, verified-only toggle
- [ ] Practice session flow: single question → choices → submit → reveal correct answer + explanation (JA/VI toggle)
- [ ] Mock exam mode: timed set pulled proportionally from topic frequency stats
- [ ] Source/attribution footer shown on every question card (per spec: sourceType, year, sourceUrl)
- [ ] Obsolete questions hidden from mock exams by default, visible in "legacy archive" browse mode
- [ ] Bookmark / flag-for-review (learner reports possible error)
- [ ] Vocabulary drawer per question (JP term + reading + VI meaning)

## Phase 4 — AI Tutor (DeepSeek) Integration
Allowed: Explain / Translate / Tutor / Generate similar practice questions.
Forbidden: change official answers, invent sources, replace verified content.
- [ ] Chat panel scoped to current question; system prompt hard-pins `correctAnswer` from DB (read-only context, not model output)
- [ ] "Explain this answer" action → DeepSeek call with question+correctAnswer+explanation as grounding context
- [ ] "Translate" action (JA→VI) for body/choices/explanation
- [ ] "Generate similar question" → creates `ORIGINAL_PRACTICE` draft with mandatory disclaimer, goes to reviewer queue (never auto-published)
- [ ] Log every AI exchange to `AiChatLog` for audit

## Phase 5 — Progress & Stats
- [ ] Per-user dashboard: accuracy by topic, weak-topic ranking, streak
- [ ] Topic frequency stats (for exemption/legacy pipeline prioritization — admin-facing)
- [ ] Progress toward "Target Database Size" table (admin dashboard: counts vs target per category/section)

## Phase 6 — i18n (JA/VI)
- [ ] `next-intl` setup, language switcher (default JA, VI toggle)
- [ ] Translate UI strings; question content uses `bodyJa`/`bodyVi` fallback-to-JA if VI missing
- [ ] Never auto-machine-translate verified official question text silently — mark VI text as `MT_DRAFT` vs `HUMAN_REVIEWED`

## Phase 7 — Mobile Responsive Polish
- [ ] Breakpoints: mobile (<640px) bottom-tab nav + single-column question card; tablet/desktop 2-col (question + AI tutor side panel)
- [ ] Touch-friendly choice buttons (min 44px), swipe next/prev in practice mode
- [ ] PWA manifest + offline cache of last N questions (optional stretch)
- [ ] Lighthouse mobile perf/accessibility pass

## Phase 8 — QA & Deploy
- [ ] Seed with Priority 1 (IPA_PUBLIC, ~200) end-to-end through full pipeline as pilot batch
- [ ] E2E tests: practice flow, reviewer approve flow, AI tutor grounding (answer never overridden)
- [ ] Deploy: Docker Compose (app + Postgres) or VPS; env secrets for DeepSeek API key
- [ ] Monitoring: error tracking, AI cost/usage logging

---

## Open decisions to confirm before coding
- [ ] DeepSeek API access method (official API vs self-hosted model)?
- [ ] Who are reviewers (anh solo, hay có team)? → gates how much reviewer-UI polish needed for Phase 2
- [ ] Auth: cần social login (Google) hay email/password đủ?

## Suggested build order (MVP first)
Phase 0 → 1 → 3 (learner UI với seed data thủ công) → 4 (AI tutor) → 2 (ingestion pipeline, chạy song song vì tốn thời gian) → 5 → 6 → 7 → 8
