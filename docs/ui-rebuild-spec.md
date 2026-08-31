# UI rebuild spec

Rebuild the FE Coach interface around the visual language of a supplied
reference: tinted background, white floating cards, large radii, soft wide
shadows, two-tier navigation, a blue identity.

The reference is a mood board, not a blueprint. It is an AI-generated CRM
mockup — the copy is nonsense (`Jnein Jumes`, `Quars Pipeline`), alignment is
inconsistent, and it has no dark mode. Its **surface language** is worth taking.
Its **information architecture** is not: a CRM user glances at twenty widgets
for five seconds, an FE Coach user reads dense Japanese for forty-five minutes.

---

## 1. Current state — measured, not assumed

| | |
|---|---|
| Design system | shadcn + Tailwind v4, OKLCH tokens, light + dark already defined |
| Radius base | `--radius: 1rem` |
| Primitives | 19 in `src/components/ui` |
| Feature components | `auth`, `bookmarks`, `layout`, `practice`, `question`, `tutor` |
| Screens | 14 (9 learner, 5 admin) |
| Topics | 13 (11 in section A, 2 in section B) |

### Three problems the token layer does not currently solve

**The tokens exist but the layout ignores them.** 12 hardcoded hex values across
6 files, and 82 hardcoded Tailwind colour utilities across 7. `app-shell.tsx` paints
`bg-[#f6f7fb]`, `bg-[#111827]`, `from-indigo-400 to-violet-500`;
`(app)/page.tsx` alone carries 32 fixed colours including a `#171c3a` hero card.
Re-theming by editing `globals.css` would currently change almost nothing on
screen.

**The identity hue is wrong for the target.** `--primary: oklch(0.55 0.22 272)`
is violet-indigo. The reference is a lighter, cleaner blue around hue 250–256.
Combined with the near-black `#171c3a` hero, the current app reads heavy where
the reference reads light.

**Japanese typography is undefined in production.** `[locale]/layout.tsx`
carries a comment reading "Zen Kaku Gothic New (loaded below)", but no such font
is ever loaded — there is no stylesheet link, and `--font-sans` falls through to
`"Hiragino Sans", "Yu Gothic"`. Japanese therefore renders in whatever the
operating system supplies: Hiragino on macOS, Yu Gothic on Windows, and on Linux
or Android frequently no Japanese face at all. Every question body in the app is
Japanese. This is the highest-risk item in this document, and it is already
broken today, independent of any redesign.

---

## 2. Principles

1. **The reading surface is sacred.** `practice/session` and `mock-exam/session`
   are where the product earns its keep. Everything there serves legibility:
   flat background, maximum contrast, one column, no decoration competing with
   kanji.
2. **Decoration lives in the chrome.** The gradient, the depth, the colour —
   those belong to the shell and the glanceable screens (home, progress,
   bookmarks, admin).
3. **Colour carries meaning or it does not appear.** Correct, incorrect,
   bookmarked, section A/B, review status. Not ornament.
4. **Token or component — never a third option.** Anything appearing twice is
   promoted. No new hardcoded colour ships.
5. **Two scripts, one voice.** Japanese and Vietnamese sit in the same sentence
   throughout. They must look deliberate together.

---

## 3. Surface model

The reference's defining structural trait, and the one most easily missed: the
main content sits inside **one large rounded container**, and cards nest
*inside* that container. Two levels of surface, not one.

```
page          tinted, gradient          <- identity
  Surface     near-white, radius-3xl    <- the sheet layer
    card      pure white, radius-2xl    <- content
      row     transparent / muted-hover <- list items
```

Depth comes from surface colour and shadow. Borders are a last resort — use them
only where two same-coloured surfaces meet.

### Reading-surface exception

| Screen group | Page background |
|---|---|
| Shell, home, progress, bookmarks, admin | gradient |
| `practice/session`, `mock-exam/session` | flat `--surface-read` |

A gradient behind forty-five minutes of 14px kanji costs legibility for nothing.
The user still meets the gradient everywhere else, so the identity survives.

---

## 4. Tokens

Extends the existing `:root` / `.dark` blocks in `src/app/globals.css`. Values
are OKLCH to match what is already there.

### Registering them — do this first or nothing works

This project is Tailwind v4. Declaring a variable in `:root` does **not** create
a utility class. The variable must also be mapped inside `@theme inline` under
the namespace Tailwind derives utilities from — `--color-*` produces `bg-*` /
`text-*` / `border-*`, `--shadow-*` produces `shadow-*`. Without this, every
class named below silently does nothing.

Every token this spec introduces, mapped. An omission here is invisible: the
class simply does nothing.

```css
@theme inline {
  /* existing mappings stay */
  --color-surface-sheet:          var(--surface-sheet);
  --color-surface-read:           var(--surface-read);
  --color-surface-rail:           var(--surface-rail);
  --color-surface-rail-foreground: var(--surface-rail-foreground);
  --color-surface-rail-active:    var(--surface-rail-active);
  --color-section-a:              var(--section-a);
  --color-section-b:              var(--section-b);
  --color-state-correct:          var(--state-correct);
  --color-state-incorrect:        var(--state-incorrect);
  --color-state-bookmark:         var(--state-bookmark);
  --color-state-obsolete:         var(--state-obsolete);
  --shadow-card:  var(--shadow-card-value);
  --shadow-sheet: var(--shadow-sheet-value);
  --shadow-fab:   var(--shadow-fab-value);
  --text-display: 2rem;      --text-display--line-height: 1.15;
  --text-title:   1.25rem;   --text-title--line-height:   1.3;
  --text-body:    0.9375rem; --text-body--line-height:    1.7;
  --text-body-ja: 1rem;      --text-body-ja--line-height: 1.9;
  --text-label:   0.8125rem; --text-label--line-height:   1.4;
  --text-caption: 0.6875rem; --text-caption--line-height: 1.4;
}
```

The page gradient stays a raw CSS value (`--surface-page-from` / `-to`) applied
by the shell in a `background-image`; it is not a utility and needs no mapping.

### Identity

```css
--primary:            oklch(0.55 0.19 255);   /* was 0.55 0.22 272 (violet) */
--primary-foreground: oklch(0.99 0 0);
--ring:               oklch(0.55 0.19 255 / 45%);
```

**L is 0.55, not the 0.58 an earlier draft proposed.** White on `oklch(0.58 …)`
measures **4.23:1** — below the 4.5:1 this document requires in §11, on the
single most-used colour pair in the app: the label of every primary button. At
0.55 it is 4.59:1. The threshold sits between the two, so this is not a rounding
choice.

### Surfaces — light

```css
--surface-page-from: oklch(0.940 0.038 248);
--surface-page-to:   oklch(0.975 0.014 250);
--surface-sheet:     oklch(0.972 0.006 250);  /* NOT 0.995 — see below */
--card:              oklch(1 0 0);
--surface-read:      oklch(0.995 0.001 250);  /* flat, no gradient */
--surface-rail:      oklch(0.31 0.06 258);    /* icon rail — dark in both themes */
--surface-rail-foreground: oklch(0.97 0.005 258);
--surface-rail-active:     oklch(1 0 0 / 14%);
```

The rail stays dark in light mode, as in the reference. It therefore needs its
own foreground token — `--foreground` is near-black and would be invisible on it.

**The sheet layer has to be visibly darker than the card, or §3 does not exist.**
An earlier draft set `--surface-sheet` to `oklch(0.995 …)` against a pure-white
card: a lightness difference of 0.005 and a contrast ratio of **1.014:1**, which
is invisible. The two-level surface model — the reference's defining trait — would
simply not have rendered. At 0.972 the step is 1.084:1: still quiet, actually
present.

| `--surface-sheet` L | ΔL vs card | Ratio | Reads as |
|---|---|---|---|
| 0.995 | 0.005 | 1.014 | nothing |
| 0.985 | 0.015 | 1.044 | barely |
| **0.972** | **0.028** | **1.084** | **a step** |
| 0.958 | 0.042 | 1.129 | a grey panel |

The page gradient moves down to 0.940–0.975 to stay darker than the sheet that
floats on it. Three layers, three steps: page → sheet → card.

### Surfaces — dark

```css
--surface-page-from: oklch(0.19 0.03 258);
--surface-page-to:   oklch(0.15 0.02 255);
--surface-sheet:     oklch(0.20 0.018 258);
--card:              oklch(0.26 0.02 258);    /* NOT 0.235 */
--surface-read:      oklch(0.17 0.012 258);
--surface-rail:      oklch(0.16 0.02 258);
```

Same problem, same fix: `0.235` against a `0.20` sheet is 1.086:1 — technically a
step, but dark surfaces need more separation than light ones to read, because the
eye is less sensitive to lightness differences at the bottom of the range. `0.26`
gives 1.165:1.

`--surface-rail-foreground` and `--surface-rail-active` are unchanged between
themes: the rail is dark in both, so its own contrast pair does not flip.

### Page gradient geometry

```css
background-image: linear-gradient(150deg, var(--surface-page-from) 0%, var(--surface-page-to) 55%);
```

150° puts the tint in the top-left and lets it fall away before the content
column, which is what keeps the reference feeling light rather than washed. It
is applied once, by the shell, on the page element — never per screen.

### Tokens this rebuild leaves alone

`--secondary`, `--muted`, `--accent`, `--destructive`, `--success`, `--border`,
`--input` keep their roles and are re-tuned to the blue hue in phase 1, not
redefined.

`--chart-1` … `--chart-5` are currently a greyscale ramp and are referenced
nowhere. With no charts in the app (§5) they stay untouched — deleting them is a
separate cleanup, not this rebuild's business.

### Elevation

Soft, wide, low-opacity — the reference's shadows are diffuse, never crisp.

```css
--shadow-card-value:  0 1px 2px oklch(0.4 0.05 258 / 4%), 0 8px 24px oklch(0.4 0.05 258 / 6%);
--shadow-sheet-value: 0 2px 4px oklch(0.4 0.05 258 / 3%), 0 16px 48px oklch(0.4 0.05 258 / 8%);
--shadow-fab-value:   0 4px 12px oklch(0.58 0.19 255 / 28%), 0 12px 32px oklch(0.58 0.19 255 / 20%);
```

The `-value` suffix avoids a self-referential definition when these are mapped
into `@theme` as `--shadow-card: var(--shadow-card-value)`.

In dark mode shadows do not read. Substitute a 1px `--border` hairline at each
elevation level rather than deepening the shadow.

### Radius

`--radius: 1rem` stays; the existing derived scale (`--radius-sm` … `--radius-4xl`)
already produces the reference's proportions. Usage:

| Element | Token |
|---|---|
| `Surface` container | `--radius-3xl` (2.2rem) |
| Card | `--radius-2xl` (1.8rem) |
| Button, input, chip | `--radius-lg` (1rem) |
| Pill search, status chip | `9999px` |

### Spacing rhythm

4px base. Card padding 24px desktop / 20px mobile. Gap between cards 20px.
`Surface` inset from page edge 24px desktop / 12px mobile.

---

## 5. Categorical colour — deliberately not 13 hues

The reference dots every list row in a different colour. Reproducing that for 13
topics would fail: people cannot reliably distinguish 13 hues, and roughly 1 in
12 men cannot separate the red-green pairs at all.

**Decision:** colour encodes *section* and *state* only. Topics are distinguished
by label and by their accuracy bar, never by hue.

```css
--section-a: oklch(0.60 0.16 255);   /* blue  */
--section-b: oklch(0.62 0.15 165);   /* teal  */

--state-correct:   var(--success);
--state-incorrect: var(--destructive);
--state-bookmark:  oklch(0.65 0.15 75);   /* amber */
--state-obsolete:  var(--muted-foreground);
```

### These were measured against the wrong background twice — read this before changing them

Indicators appear on **two** surfaces: the pure-white card and the slightly
darker `--surface-sheet` (0.972). The sheet is the harder case, and it is the one
that must be satisfied.

| Token | Draft 1 | Draft 2 | Final | Why |
|---|---|---|---|---|
| `--section-b` | 0.66 → 2.86:1 on card | 0.64 → 3.08 card / **2.94 sheet** | **0.62** → 3.05 sheet | draft 2 was solved against card only |
| `--state-bookmark` | 0.72 → **2.54:1** on card | 0.67 → 3.06 card / **2.82 sheet** | **0.65** → 3.05 sheet | same mistake |
| `--section-a` | 0.60 | 0.60 | 0.60 → 3.67 sheet | blue passes at a much higher L |

Amber at 0.72 measuring 2.54:1 made the bookmark dot the worst failure in the
palette. Yellows and cyans are the trap: they carry high perceived brightness at
lightness values where blues still pass comfortably, so they need darkening
further than intuition suggests — `--section-a` clears 3:1 at L 0.60 while amber
needs 0.65 for the same ratio.

Whenever one of these values changes, re-check it against `--surface-sheet`, not
against white.

No categorical ramp is defined, because **the app has no charts** — `progress`
renders `<Progress>` bars and there is no charting library in `package.json`.
Adding a ramp now would be speccing tokens for a component that does not exist.
If charts arrive later, generate the ramp by holding L and C fixed and rotating
hue, so the steps stay perceptually even.

Never use colour as the only signal. Correct/incorrect also carries an icon;
section also carries a letter.

---

## 6. Typography

### The fix

| Role | Family | Why |
|---|---|---|
| Latin + Vietnamese | Montserrat (kept) | verified Vietnamese subset, correct tone-mark shaping |
| Japanese | **Noto Sans JP**, actually loaded | today nothing is loaded |
| Mono | Geist Mono (kept) | pseudocode in section B |

```css
--font-sans: var(--font-montserrat), "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif;
```

Order matters and is not cosmetic: the Latin face must come first so Vietnamese
diacritics are shaped by a font that supports them. A Japanese face placed first
renders `ế` and `ữ` with detached marks.

### Scale

Registered in `@theme` as `--text-*` (see §4), so each becomes a utility:
`text-display`, `text-title`, `text-body`, `text-body-ja`, `text-label`,
`text-caption`. Weight and tracking are applied alongside, not baked in.

| Utility | Size / line-height | Extra | Use |
|---|---|---|---|
| `text-display` | 32 / 1.15 | weight 700, tracking −0.03em | page titles |
| `text-title` | 20 / 1.3 | weight 700 | card headings |
| `text-body` | 15 / 1.7 | — | prose, Vietnamese |
| `text-body-ja` | 16 / 1.9 | — | **question and choice bodies** |
| `text-label` | 13 / 1.4 | weight 600 | form labels, chips |
| `text-caption` | 11 / 1.4 | tracking 0.16em, uppercase | eyebrow labels |

Japanese gets a larger size and looser leading than Latin at the same visual
weight — kanji carry more strokes per em and need the vertical room. Do not set
Japanese question bodies below 16px on any breakpoint.

**`text-body-ja` is chosen by content, not by locale.** `bodyJa` and `textJa`
render as Japanese even when the interface is Vietnamese — a learner reads a
Vietnamese UI around a Japanese question. Apply the utility to the node holding
the Japanese field, never to the page or to `<html lang>`.

---

## 7. Shell

Two tiers, as in the reference:

- **Rail** — 72px, `--surface-rail`, icon-only, always visible from `md`. Holds
  primary destinations plus the account avatar at the bottom.
- **Panel** — 220px, `--surface-sheet`, labelled navigation for the active
  section. Collapsible; state persisted in `localStorage`.

72 + 220 = 292px against today's single 268px sidebar. On a 1366px laptop that
leaves 1074px for content, and the reading column must still cap at a
comfortable measure. **The panel therefore collapses by default below 1280px**,
not just below `md` — otherwise the rebuild makes the reading screen narrower
than the one it replaces.

Three existing shell components move with it and are not optional extras:
`locale-switcher.tsx`, `theme-toggle.tsx`, `user-menu.tsx`. Today they sit in the
sidebar footer; decide their home in the rail or the panel before starting, since
the reference has no equivalent.

Below `md`, the rail becomes a bottom tab bar and the panel becomes a drawer.
This is not in the reference — the reference is desktop-only — and must be
designed rather than improvised.

**Active item.** `--surface-rail-active` fill plus a 3px rounded accent bar on
the leading edge in `--primary`. The current shell already does this with
`bg-white/12` and a left bar; keep the behaviour, move it onto tokens.

### Tutor as floating action button

The reference's blue circular button, bottom-right. The AI tutor moves out of
its current inline panel into a FAB that opens a sheet.

**Preserve the existing gate.** `TutorPanel` renders today only when
`showTutor && answered` (`session-runner.tsx:182,192`) and when `result` is set
(`question-card.tsx:166`). The tutor is unreachable before the user commits to
an answer, which is a correctness rule, not a layout choice — a session must not
be able to ask for the explanation and then pick. Breaking it during the FAB
refactor is a regression, not a redesign.

Three call sites move, across two feature components:

| File | Line | Gate today |
|---|---|---|
| `session-runner.tsx` | 182 (mobile), 192 (desktop) | `showTutor && answered` |
| `question-card.tsx` | 166 | `showTutor && result` |

`showTutor` is a prop defaulting to `true`, and `session-runner` passes
`showTutor={false}` down to `QuestionCard` so the panel is not rendered twice.
That prop contract changes when the FAB lifts to the shell — see §8.

Also:

- Show remaining hourly quota when under 5 (`/api/tutor` caps at 30/hour).
- Do not render when `DEEPSEEK_API_KEY` is unset. The key is server-only, so
  this needs a boolean plumbed from a server component into the shell — it
  cannot be read client-side.

---

## 8. Components

All 19 **primitives** keep their public API. Restyle only — this keeps the change
reviewable and lets pages migrate independently.

**Feature components are a different story.** Lifting the tutor into a shell-level
FAB removes the `showTutor` prop from `session-runner` and `question-card`, and
with it the `showTutor={false}` hand-off between them. That is a breaking change
to two components, and it is the only one this rebuild is allowed to make. Do it
in its own commit, before the screens that depend on them.

| Primitive | Change |
|---|---|
| `card` | `--shadow-card`, borderless by default. The sheet layer is the separate `Surface` component, not a card variant |
| `button` | radius-lg, softer shadow, blue primary |
| `badge` | pill, section/state variants |
| `progress` | keep 8px — `ProgressTrack` is already `h-2`. Add rounded cap and gradient fill. Strip the redundant `className="h-2"` at `session-runner.tsx:162`, which would otherwise pin the height past any restyle |
| `input` | pill search variant |
| `tabs` | segmented-control look |
| Others | token pass only |

New. Sketched here so four people do not invent four APIs:

```ts
// The outer rounded container from §3. Not to be confused with ui/sheet.tsx
// (the existing drawer) — name this one Surface to avoid the collision.
type SurfaceProps = {
  as?: "div" | "section" | "main";
  padded?: boolean;          // default true -> 24px / 20px mobile
  children: React.ReactNode;
  className?: string;
};

type StatTileProps = {
  value: string | number;    // pre-formatted; the tile does no maths
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "correct" | "bookmark";
};

type TopicRowProps = {
  name: string;
  section: "A" | "B";        // drives the dot colour, plus a letter for non-colour users
  accuracy: number;          // 0-100
  total: number;             // attempts, shown as context
  href?: string;             // row becomes a link when present
};

type TutorFabProps = {
  questionId: string;
  enabled: boolean;          // false when DEEPSEEK_API_KEY is unset (server-plumbed)
  remaining?: number;        // shown only when < 5
};
```

`Surface`, not `Sheet`: `src/components/ui/sheet.tsx` already exists and exports
`Sheet`, `SheetTrigger`, `SheetClose`, `SheetPortal` — it is the slide-over
drawer. Two components named Sheet in one codebase is how a rebuild starts
costing more than it should. The token keeps the layer name
(`--surface-sheet` is the colour `Surface` paints); only the component is
renamed.

---

## 9. Screens

Migration order is traffic order. Each screen is one commit.

| # | Screen | Change |
|---|---|---|
| 1 | `practice/session` — which means `session-runner.tsx` **and** `question-card.tsx` | flat reading surface, one column, JA at 16/1.9, answer states, tutor FAB. The answer-state visuals live in `question-card.tsx` (`isCorrectChoice`, `result.isCorrect`), not in the page |
| 2 | `(app)/page` (home) | remove the `#171c3a` hero, rebuild as `Surface` + StatTiles + quick actions |
| 3 | `progress` | topic rows with bars, weak-topic emphasis |
| 4 | `mock-exam` + session | **mostly free** — `mock-exam/session` renders the same `SessionRunner` as (1), so only the timer and the landing page are new work |
| 5 | `bookmarks` | card list, TopicRow |
| 6 | `practice` (filters) | segmented tabs, pill selects |
| 7 | `login` / `register` | centred `Surface` on gradient |
| 8 | admin (5 screens) | token pass, density kept — this is a working tool, not a showcase |

---

## 10. States the design must cover

Mockups show the happy path. Every component ships with:

- hover, focus-visible, active, disabled
- loading (skeleton, not spinner, for content areas)
- empty (no bookmarks, no attempts, no results for a filter)
- error (failed answer submit, tutor 502, tutor 429 with retry minutes)
- both locales, both themes, 375px and 1440px

### Overflow, using the real extremes in the database

Not guesses — measured:

| Field | Longest | Average |
|---|---|---|
| `Question.bodyJa` | **1,394 chars** | 76 |
| `Choice.textJa` | **675 chars** | — |
| `Topic.nameVi` | 28 chars | — |

The 1,394-character body is the layout test that matters: at `text-body-ja`
(16/1.9) that is roughly 40 lines on desktop and far more on a phone. The
reading column must scroll cleanly with the answer choices still reachable, and
the question must not be trapped in a fixed-height card.

A 675-character choice inside a button is the second trap — the current answer
button is `min-h-14`, which is a *minimum*, so it grows. Any restyle must keep
it growing rather than clipping.

---

## 11. Accessibility

- Body text ≥ 4.5:1 against its surface; large text and UI ≥ 3:1. Verify in both
  themes — the dark palette is where this usually fails. Measure with the
  browser devtools contrast readout or axe; do not eyeball OKLCH lightness,
  which is not a contrast ratio.
- `focus-visible` ring on every interactive element, 2px, `--ring`, never removed.
- Touch targets ≥ 44px.
- Colour never the sole carrier of meaning.
- Motion respects `prefers-reduced-motion`.

---

## 12. Implementation order

Each phase has an exit test. Do not start the next until the current one passes.

The first two phases change nothing on screen. That is the point: they make the
redesign land in **one reviewable moment** at phase 1 instead of dribbling out
across every commit.

An earlier draft of this document had a single phase 0 — "convert hardcoded
colour to tokens" — placed before the token layer existed. That is impossible:
the five hex values in the codebase (`#171c3a`, `#111827`, `#f6f7fb`,
`#11152e`, `#0b1020`) are shell and hero surfaces with **no equivalent in the
current token set**. There is nothing to convert them to until the tokens are
declared. Hence 0a before 0b.

### Phase 0 needs a baseline first

"Screenshots unchanged" is the exit test for 0a and 0b, and there is nothing to
compare against today. `playwright.config.ts` exists, but **no test in the suite
calls `toHaveScreenshot()`** — every existing spec is functional. Running
`--update-snapshots` today captures nothing, because there is nothing to update.

So phase 0 is not a command, it is a file: `tests/e2e/visual.spec.ts`, which
logs in once and screenshots the eight learner screens across both themes and
both locales — 32 images.

```ts
// shape only
for (const locale of ["vi", "ja"] as const)
  for (const theme of ["light", "dark"] as const)
    for (const path of SCREENS)
      await expect(page).toHaveScreenshot(`${locale}-${theme}-${slug(path)}.png`);
```

Notes that will otherwise cost an afternoon:

- Log in with `E2E_ADMIN_PASSWORD`; the seed no longer hardcodes a password (§ see
  `prisma/seed.ts`), so pin it when seeding the test database.
- Set the theme by adding the `dark` class to `<html>`, not by clicking the
  toggle — the toggle animates and the screenshot races it.
- `practice/session` and `mock-exam/session` draw random questions. Screenshot
  them with a fixed `questionId` set, or they diff on every run for reasons that
  have nothing to do with CSS.

Without this file, 0a and 0b are claims rather than tests, and the whole
"no visual change" guarantee is worthless.

| Phase | Work | Exit test |
|---|---|---|
| 0 | Capture the visual baseline | snapshots committed for 8 screens × 2 themes × 2 locales |
| 0a | Declare every token in §4–§5 and register them in `@theme inline` — **with values matching today's colours exactly** | app renders byte-identical; snapshot diff empty |
| 0b | Convert all 94 call sites (12 hex + 82 utilities) to those tokens | both greps return nothing (see below); snapshot diff **still** empty; editing `--primary` now re-themes every screen |
| 1 | Retune token values to the new blue identity, and actually load Noto Sans JP | the redesign appears everywhere at once; Japanese renders in Noto Sans JP on a Linux browser; Vietnamese tone marks intact |
| 2 | Primitives + `/dev/ui` gallery | every primitive, every state, both themes, on one page |
| 3 | Shell + tutor FAB | keyboard navigable; mobile bottom bar works at 375px |
| 4 | Screens 1–8 | screenshot diff reviewed per screen |
| 5 | Accessibility + regression | contrast audit passes; Playwright green |

### The e2e suite is coupled to styling — fix before phase 2

`tests/e2e/*.spec.ts` selects answer buttons with `locator("button.min-h-14")`
in five assertions. `min-h-14` is a Tailwind sizing class on the answer choice
button; restyling it breaks five tests, and the failure will read as a broken
app rather than a stale selector.

Replace those selectors with `getByRole` or a `data-testid` **before** touching
the primitives. The rest of the suite already uses `getByRole` (13),
`getByLabel` (4) and attribute selectors, which survive a restyle.

Phase 0's exit test, both of which must return nothing:

```bash
grep -rE "\[#[0-9a-fA-F]{3,8}\]" src --include=*.tsx
grep -rE "\b(bg|text|from|to|via|border|shadow|ring)-(indigo|violet|slate|sky|amber|emerald|rose|purple|blue|zinc|gray)-[0-9]{2,3}" src --include=*.tsx
```

The second matters more than the first: 82 occurrences against 12. Checking only
for hex would pass a codebase that is still unthemeable.

Phases 0a and 0b are not optional and are not cosmetic. Until it is done, the token layer
is decorative and every later phase fights the pages.

Phase 2's gallery is the phase most often skipped and the most expensive to
skip: without it, each screen re-discovers the same system bugs, and fixing one
breaks the screens already done.

---

## 13. Definition of done

The rebuild is finished when all of these hold at once, not when the screens
look right:

1. Both grep commands in §12 return nothing.
2. Changing `--primary` in `globals.css` visibly re-themes all fourteen screens.
3. Japanese renders in Noto Sans JP on a Linux browser; Vietnamese tone marks
   are attached in both fonts.
4. `/dev/ui` shows every primitive in every state in both themes.
5. The tutor is unreachable before an answer is submitted — verified in
   `practice/session` and `mock-exam/session`.
6. A 1,394-character question with a 675-character choice is readable and
   answerable at 375px.
7. Playwright is green, with the styling-coupled selectors replaced.
8. Contrast audit passes in both themes.

Items 5 and 6 are the ones that will be skipped under time pressure. They are
the two that make it a study app rather than a screenshot.

---

## 14. Out of scope

- No new data, queries, or API routes. This is presentation only.
- Admin screens get a token pass, not a redesign.
- No animation library. Transitions are CSS, at most 200ms.
- No component library swap. shadcn stays.

## 15. Risks

| Risk | Mitigation |
|---|---|
| Japanese font never loads (already true today) | Phase 1 exit test runs on a Linux browser, not the author's Mac/Windows |
| Gradient hurts long reading | Reading surfaces excluded by rule, not by judgement |
| 82 hardcoded colours make re-theming look broken halfway | 0a and 0b complete before any visual change ships |
| Dark mode diverges from light | Every phase reviewed in both themes; shadows swapped for hairlines |
| Scope creep into a rewrite | Primitive APIs frozen; presentation only |
