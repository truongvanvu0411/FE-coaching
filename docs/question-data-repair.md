# Question data repair — IPA_EXEMPTION

The exemption question bank cannot be trusted as it stands. This is what is
wrong, how it was found, what has already been done about it, and what remains.

The stakes are not cosmetic: a study app that teaches the wrong answer is worse
than one with fewer questions.

---

## 1. What is wrong

### Answers point at the wrong question

The source paper for 2015 spring, page 33, shows:

| Paper | Question | Database |
|---|---|---|
| 問69 | コストプラス法 | `Q72` |
| 問70 | ナレッジマネジメント | `Q73` |
| 問71 | ディジタルディバイド | — |

The numbering is off by three, and the official answer key is applied **by
number**. So `ナレッジマネジメント` was given 問73's answer (ウ) instead of its own
(ア) — the stored answer describes benchmarking, not knowledge management.

The choice text and its A/B/C/D order match the paper exactly. Only the number
drifted, which is why this survived every text-level check.

### The audit that should have caught it could not

`storage/review/answer-map-audit.json` reports `mismatchCount: 0` across 1,016
candidates. It compares the parsed answer against the answer map **using the same
drifted number**, so it is self-consistent and wrong. A green audit here means
nothing.

### Where the drift comes from

The 2014–2019 sessions are short. The parser never recovered a full paper:

| Session | Parsed | Expected |
|---|---|---|
| 2014-spring | 64 | 80 |
| 2014-autumn | 67 | 80 |
| 2018-autumn | 67 | 80 |
| 2015-spring | 74 | 80 |

Questions were then numbered sequentially rather than by the 問N printed on the
page, so every question after the first gap carries someone else's number — and
someone else's answer.

The 2020+ sessions parse to their full 80 or 60, so their numbering is intact.
That distinction is what makes a partial recovery possible.

### Measured error rate

Hand-checked against domain knowledge:

| Sample | Wrong answers |
|---|---|
| 12 random VERIFIED questions | 3 (25%) |
| 14 PENDING_REVIEW questions | 5 (36%) |
| 10 from the restored set (§2) | 0 |

### Damage beyond numbering

- **688 duplicate rows** across 428 groups, 915 of them previously VERIFIED.
- **Shredded choices**: one sentence split across two lettered options, so the
  real answer is absent. `2014-autumn-Q51` offers `パックトラッキング`,
  `ブォワード`, `ンツー`, `リンダ` — the answer, リバースエンジニアリング, is not
  among them.
- **149 rows** with a choice beginning `_`, the tail of a line the parser cut.
- **109 questions** referring to a 図 or 表 that was never extracted, which makes
  them unanswerable regardless of whether the answer is right.

### Why the source cannot simply be re-read

The exemption PDFs are image scans. `pdf-parse` returns 711 characters for a
40-page paper — page markers and nothing else. OCR is unavoidable here. (The
note in `src/lib/ocr.ts` about text-layer PDFs holds for the *public* IPA papers,
not these.)

---

## 2. Done

- [x] Backed up every row's review state to `_review_status_backup_20260905`
      (3,134 rows). Any step below is reversible from it.
- [x] Demoted **all 1,972** VERIFIED IPA_EXEMPTION questions, not just the 915
      duplicates. Checking first showed why: `2015-spring-Q73` has a wrong answer
      and is **not** a duplicate, so a duplicate-only sweep would have left it in
      the study pool while implying the problem was handled.
- [x] Restored **732** that pass all four filters:
      1. session is 2020 or later (numbering intact),
      2. exactly four distinct, non-empty choices,
      3. no choice truncated — none begins `_`, at most one lacks end
         punctuation,
      4. no reference to a 図 or 表 without an attached asset.
- [x] Verified the policy on a 10-question sample from the restored set before
      applying it: 9 answers correct, the tenth excluded by filter 4.

Study pool now: **1,340 questions** — 703 exemption, 488 original practice,
149 IPA public.

---

## 3. To do

### Phase A — Recover the 2020+ remainder (~900 questions)

These have sound numbering; they failed on text quality alone.

- [ ] **A1** Re-OCR only the pages backing questions that failed filters 2–3,
      using the existing `scripts/ipa-exemption/ocr-layout.ts` at higher DPI.
      Page images already exist for 15 session prefixes under
      `storage/review/pages/`.
- [ ] **A2** Anchor choice extraction on the ア/イ/ウ/エ glyphs rather than on
      line breaks. Splitting one option across two letters is the single most
      common defect, and line-based splitting is why.
- [ ] **A3** Re-import, then re-run filters 2–4 and restore what now passes.
- [ ] **A4** Extract the 図/表 regions as assets for the 109 figure questions so
      they become answerable rather than merely present.

### Phase B — Repair the 2014–2019 numbering (~856 questions)

Nothing here can be trusted until each question is tied back to its printed 問N.

- [ ] **B1** For each legacy session, extract the 問N markers from the page
      images and build a `問N → body` map.
- [ ] **B2** Match each database row to that map by body-text similarity, and
      rewrite `questionNumber` to the paper's number.
- [ ] **B3** Re-apply the official answer key by the corrected number.
- [ ] **B4** Anything that fails to match confidently stays demoted. A question
      that cannot be tied to a number cannot be given an answer.
- [ ] **B5** Render pages for the sessions that have none — 21 of 36 prefixes are
      missing images, and the PDFs are all present under
      `storage/ipa-exemption/`.

### Phase C — Duplicates

- [ ] **C1** Collapse the 428 duplicate groups, keeping the copy with the highest
      parse confidence and an intact figure reference where one exists.
- [ ] **C2** Re-point `Attempt` and `Bookmark` rows at the surviving id before
      deleting, or the learner loses history.

### Phase D — Stop it happening again

- [ ] **D1** Fix `answer-map-audit` to compare against the 問N read from the page,
      not the number the parser assigned. As written it can only ever confirm
      its own input.
- [ ] **D2** Refuse to mark a question VERIFIED when `parseConfidence` is below
      threshold or `needsReview` is set. The candidate files already carried
      `parseConfidence: 0.2` and `needsReview: true` on rows that reached
      VERIFIED anyway.
- [ ] **D3** Add a seeded sanity test: a fixed set of questions whose answers are
      known independently, failing the build if any drifts.

### Phase E — Cross-check with domain knowledge

Only after A and B, and only as a net for what the mechanical repair misses.

- [ ] **E1** Review the definitional questions (SCM, WAF, RFID, パレート図,
      ナレッジマネジメント and similar) where the correct answer follows from the
      term itself.
- [ ] **E2** Record every correction with its reasoning, so a wrong call can be
      traced and reverted.

**This ordering is not negotiable.** Domain knowledge is a check on a mechanical
repair, never a substitute for it: guessing 2,000 answers would be slower than
fixing the pipeline and less accurate than the official key.

---

## 4. Reverting

```sql
-- restore every review state to the 5 Sep snapshot
UPDATE "Question" q
   SET "reviewStatus" = b."reviewStatus", verified = b.verified
  FROM "_review_status_backup_20260905" b
 WHERE b.id = q.id;
```
