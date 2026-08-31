# UI rebuild — implementation to-do

Execution checklist for [ui-rebuild-spec.md](./ui-rebuild-spec.md). Work top to
bottom. Every phase has an exit test; do not start the next until it passes.

One commit per numbered item unless stated otherwise. Phases 0–2 change nothing
a user can see, which is what makes them safe to land quickly.

---

## Phase 0 — Visual baseline (blocks everything)

Nothing else in this document is verifiable without this.

- [ ] **0.1** Write `tests/e2e/visual.spec.ts`
  - [ ] Log in once, reuse the session via `storageState`
  - [ ] Screens: `/`, `/practice`, `/practice/session`, `/mock-exam`,
        `/mock-exam/session`, `/progress`, `/bookmarks`, `/login`
  - [ ] Loop `locale` (`vi`, `ja`) × `theme` (`light`, `dark`) = **32 images**
  - [ ] Set theme by adding/removing `dark` on `<html>` — **never click the
        toggle**, it animates and the screenshot races it
  - [ ] Pin a fixed question set for the two `/session` screens (they draw
        randomly; otherwise every run diffs for reasons unrelated to CSS)
  - [ ] Seed the test DB with `SEED_ADMIN_PASSWORD=ChangeMe123!` so
        `E2E_ADMIN_PASSWORD`'s default matches
- [ ] **0.2** Capture and commit the baseline: `npx playwright test visual --update-snapshots`
- [ ] **0.3** Re-run without `--update-snapshots` twice; confirm zero diff both times

**Exit:** 32 snapshots committed, suite green on two consecutive runs.

---

## Phase 0a — Declare tokens (no visual change)

Values must match **today's** colours exactly. The new palette lands in phase 1.

- [ ] **0a.1** Add to `:root` in `src/app/globals.css`, values copied from the
      current hardcoded ones:
      `--surface-page-from`, `--surface-page-to`, `--surface-sheet`,
      `--surface-read`, `--surface-rail`, `--surface-rail-foreground`,
      `--surface-rail-active`
- [ ] **0a.2** Add the `.dark` counterparts
- [ ] **0a.3** Add `--section-a`, `--section-b`, `--state-correct`,
      `--state-incorrect`, `--state-bookmark`, `--state-obsolete`
- [ ] **0a.4** Add `--shadow-card-value`, `--shadow-sheet-value`, `--shadow-fab-value`
- [ ] **0a.5** Register **every** one in `@theme inline` — `--color-*` for colours,
      `--shadow-*` for shadows, `--text-*` for the type scale (spec §4).
      An unmapped token produces a class that silently does nothing
- [ ] **0a.6** Add the six `--text-*` sizes with their `--line-height` pairs

**Exit:** snapshot diff empty. Nothing on screen has moved.

---

## Phase 0b — Convert call sites (no visual change)

94 occurrences, 7 files. Largest first so the pattern is established early.

- [ ] **0b.1** `components/layout/app-shell.tsx` — 6 hex + 13 utilities
- [ ] **0b.2** `app/[locale]/(app)/page.tsx` — 2 hex + 32 utilities (the `#171c3a` hero)
- [ ] **0b.3** `app/[locale]/(app)/practice/page.tsx` — 1 hex + 13 utilities
- [ ] **0b.4** `app/[locale]/(app)/admin/page.tsx` — 1 hex + 10 utilities
- [ ] **0b.5** `components/practice/session-runner.tsx` — 1 hex + 9 utilities
- [ ] **0b.6** `app/[locale]/(auth)/layout.tsx` — 1 hex + 2 utilities
- [ ] **0b.7** `app/[locale]/(app)/admin/review/page.tsx` — 3 utilities
- [ ] **0b.8** Remove the redundant `className="h-2"` at `session-runner.tsx:162`
      — it pins the progress height past any later restyle

**Exit — all four must hold:**

```bash
grep -rE "\[#[0-9a-fA-F]{3,8}\]" src --include=*.tsx                    # empty
grep -rE "\b(bg|text|from|to|via|border|shadow|ring)-(indigo|violet|slate|sky|amber|emerald|rose|purple|blue|zinc|gray)-[0-9]{2,3}" src --include=*.tsx   # empty
npx playwright test visual                                              # green
```

Plus by hand: change `--primary` to something lurid and confirm **all 14 screens**
change. Revert.

---

## Phase 1 — New identity (the redesign becomes visible)

The only phase that needs sign-off before it lands.

- [ ] **1.1** Load the Japanese font. `[locale]/layout.tsx` claims Zen Kaku Gothic
      New is "loaded below" and **it is not** — no stylesheet link exists. Add
      Noto Sans JP, self-hosted or via a real Google Fonts stylesheet
- [ ] **1.2** Set `--font-sans: var(--font-montserrat), "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif`
      — Latin **first**, or Vietnamese tone marks detach
- [ ] **1.3** Retune tokens to the measured palette (spec §4, §5). Every value
      there is contrast-verified; do not round them:
      `--primary: oklch(0.55 0.19 255)` · `--surface-sheet: oklch(0.972 0.006 250)` ·
      dark `--card: oklch(0.26 0.02 258)` · `--section-b: oklch(0.62 0.15 165)` ·
      `--state-bookmark: oklch(0.65 0.15 75)`
- [ ] **1.4** Apply the page gradient in the shell:
      `linear-gradient(150deg, var(--surface-page-from) 0%, var(--surface-page-to) 55%)`
- [ ] **1.5** Re-run the contrast check on the 20 pairs. Any value changed during
      review must be re-measured **against `--surface-sheet`, not white** — the
      sheet is the harder background and two drafts failed on exactly that
- [ ] **1.6** Update the 32 snapshots deliberately; review every diff

**Exit:** Japanese renders in Noto Sans JP **on a Linux browser** (not the
author's Mac or Windows, where the OS hides the bug); Vietnamese diacritics
attached; contrast audit clean in both themes.

---

## Phase 2 — Primitives

- [ ] **2.1** Replace `locator("button.min-h-14")` in `tests/e2e/*.spec.ts`
      (**5 assertions**) with `getByRole` or `data-testid`. Do this **first** —
      restyling breaks them, and the failure reads as a broken app rather than a
      stale selector
- [ ] **2.2** `ui/card.tsx` — `--shadow-card`, borderless default
- [ ] **2.3** `ui/button.tsx` — radius-lg, blue primary, soft shadow
- [ ] **2.4** `ui/badge.tsx` — pill, section and state variants
- [ ] **2.5** `ui/progress.tsx` — keep 8px (`ProgressTrack` is already `h-2`),
      add rounded cap and gradient fill
- [ ] **2.6** `ui/input.tsx` — pill search variant
- [ ] **2.7** `ui/tabs.tsx` — segmented control
- [ ] **2.8** Remaining 13 primitives — token pass only
- [ ] **2.9** New `components/ui/surface.tsx` — the sheet layer. **Named
      `Surface`, not `Sheet`**: `ui/sheet.tsx` already exports `Sheet` and is the
      slide-over drawer
- [ ] **2.10** New `StatTile`, `TopicRow` (props in spec §8)
- [ ] **2.11** Build `/dev/ui` — every primitive × every state × both themes on
      one page. **Do not skip this.** Without it each screen rediscovers the same
      system bugs, and fixing one breaks the screens already converted

**Exit:** `/dev/ui` renders complete; Playwright green with the new selectors.

---

## Phase 3 — Shell and tutor

- [ ] **3.1** Rail (72px) + panel (220px) in `app-shell.tsx`
- [ ] **3.2** Panel collapses by default **below 1280px**, not just below `md` —
      72 + 220 = 292px against today's 268px, so without this the rebuild leaves
      the reading column *narrower* than before
- [ ] **3.3** Mobile: rail becomes a bottom tab bar, panel becomes a drawer.
      Not in the reference — needs a decision, not improvisation
- [ ] **3.4** Rehome `locale-switcher.tsx`, `theme-toggle.tsx`, `user-menu.tsx`
      — they currently live in the sidebar footer, which no longer exists
- [ ] **3.5** Active item: `--surface-rail-active` + 3px `--primary` leading bar
- [ ] **3.6** `TutorFab` — floating action button + drawer
- [ ] **3.7** **Preserve the answer gate.** `TutorPanel` renders today only when
      `showTutor && answered` (`session-runner.tsx:182,192`) and `showTutor && result`
      (`question-card.tsx:166`). A learner must not be able to read the
      explanation and *then* choose. Breaking this is a correctness regression,
      not a design change
- [ ] **3.8** Remove the `showTutor` prop from `session-runner` and `question-card`
      once the FAB owns it — including the `showTutor={false}` hand-off between
      them. **The only breaking API change this rebuild is allowed.** Own commit
- [ ] **3.9** Plumb a `tutorEnabled` boolean from a server component (the key is
      server-only; a client component cannot read `DEEPSEEK_API_KEY`)
- [ ] **3.10** Show remaining quota when under 5 (`/api/tutor` caps at 30/hour)

**Exit:** keyboard navigable end to end; 375px bottom bar works; tutor still
unreachable before an answer.

---

## Phase 4 — Screens

Traffic order. One commit each.

- [ ] **4.1** `practice/session` — **plus `question-card.tsx`**, which is where
      the answer-state visuals actually live (`isCorrectChoice`, `result.isCorrect`).
      Flat `--surface-read`, one column, `text-body-ja`
- [ ] **4.2** `(app)/page` — drop the `#171c3a` hero, rebuild as `Surface` + StatTiles
- [ ] **4.3** `progress` — TopicRow with accuracy bars, weak topics first
- [ ] **4.4** `mock-exam` + session — **mostly free**: the session renders the same
      `SessionRunner` as 4.1, so only the timer and the landing page are new
- [ ] **4.5** `bookmarks` — card list on TopicRow
- [ ] **4.6** `practice` filters — segmented tabs, pill selects
- [ ] **4.7** `login` / `register` — centred `Surface` on gradient
- [ ] **4.8** Admin (5 screens) — token pass only, keep the density. It is a
      working tool, not a showcase

**Exit:** every screen reviewed in both themes, both locales, at 375px and 1440px.

---

## Phase 5 — Hardening

- [ ] **5.1** States sweep per spec §10: hover, focus-visible, active, disabled,
      loading skeletons, empty, error (answer submit failure, tutor 502, tutor
      429 with retry minutes)
- [ ] **5.2** **Overflow with the real extremes** — measured from the database,
      not invented: a **1,394-character** `bodyJa` with a **675-character**
      choice. At `text-body-ja` that is ~40 lines on desktop. The reading column
      must scroll with the choices still reachable, and the answer button must
      keep growing (`min-h-14` is a *minimum*) rather than clipping
- [ ] **5.3** Contrast audit in both themes with devtools or axe. Do not eyeball
      OKLCH lightness — it is not a contrast ratio
- [ ] **5.4** `focus-visible` on every interactive element, 2px, `--ring`
- [ ] **5.5** Touch targets ≥ 44px
- [ ] **5.6** `prefers-reduced-motion` respected
- [ ] **5.7** Snapshots stable; full Playwright suite green

---

## Definition of done

All eight, simultaneously:

- [ ] Both greps in Phase 0b return nothing
- [ ] Changing `--primary` re-themes all 14 screens
- [ ] Japanese renders in Noto Sans JP on Linux; Vietnamese tone marks attached
- [ ] `/dev/ui` shows every primitive in every state, both themes
- [ ] Tutor unreachable before an answer, in both session screens
- [ ] A 1,394-char question with a 675-char choice is readable and answerable at 375px
- [ ] Playwright green, styling-coupled selectors gone
- [ ] Contrast audit passes in both themes

The last two rows and the tutor gate are what get dropped under time pressure.
They are also what separates a study app from a screenshot.

---

## Sequencing rules

1. **Phase 0 first, always.** Without the baseline, "no visual change" is a claim.
2. **0a before 0b.** The five hex values (`#171c3a`, `#111827`, `#f6f7fb`,
   `#11152e`, `#0b1020`) have no equivalent in today's token set — there is
   nothing to convert them *to* until the tokens exist.
3. **2.1 before any restyle.** Five e2e assertions select on a styling class.
4. **2.11 before phase 4.** The gallery is the cheapest place to find system bugs.
5. **3.8 in its own commit.** It is the one breaking API change; keep it isolated
   so a revert is surgical.
