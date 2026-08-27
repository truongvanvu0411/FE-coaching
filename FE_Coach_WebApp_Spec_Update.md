
# FE Coach Web App - Spec Update (Data Collection Strategy)

## New Section: Official Question Collection Strategy

### Goal

Build a **high-quality verified FE question bank**, not simply collect as many questions as possible.

Every published question must have:

- Verified official answer
- Source information
- Topic mapping
- Difficulty
- Explanation
- Copyright/source attribution

---

## Data Sources

### Priority 1 — Official IPA Public Questions

Collect every officially published FE CBT question from IPA.

Sources include:

- FE 科目A Public Questions
- FE 科目B Public Questions
- FE Sample Questions

Metadata:

- Year
- Source URL
- Source page
- Question number

Store as:

```text
sourceType = IPA_PUBLIC
```

---

### Priority 2 — FE Exemption (科目A免除 修了試験)

Collect all publicly released exemption examination questions.

Purpose:

- Increase A-question coverage
- Expand repeated concepts
- Build topic frequency statistics

Store as:

```text
sourceType = IPA_EXEMPTION
```

---

### Priority 3 — Legacy FE Morning Questions

Collect historical FE morning questions.

Not every question should be published.

Pipeline:

Legacy Question

↓

Topic Mapping

↓

Current syllabus relevance

↓

Remove obsolete technology

↓

Duplicate detection

↓

Publish

Questions that are obsolete should be marked:

```text
isObsolete = true
```

---

### Priority 4 — Original Practice Questions

Generate only when a syllabus gap exists.

Must always display:

```text
Source:
Original Practice Question

This is NOT an official IPA examination question.
```

---

## Target Database Size

| Category | Target |
|-----------|--------|
| Official FE CBT Public | ~200 questions |
| FE Exemption | 1,000–1,500 questions |
| Legacy Morning (after filtering) | 1,500–2,000 questions |
| Original Practice | 300–500 questions |
| **Total A** | **2,500–3,000 questions** |
| **Total B** | **600–900 questions** |
| **Grand Total** | **3,100–3,900 questions** |

Quality is more important than quantity.

---

## Question Verification Pipeline

```text
IPA PDF

↓

OCR / PDF Parsing

↓

Question Split

↓

Choice Parsing

↓

Extract Images / Tables

↓

Match Official Answer Key

↓

Human Verification

↓

Topic Mapping

↓

Duplicate Detection

↓

Publish to Database
```

DeepSeek must NEVER determine the official answer.

---

## Database Rule

Each question contains:

- id
- section
- year
- sourceType
- sourceUrl
- sourcePage
- questionNumber
- topic
- difficulty
- correctAnswer
- verified flag
- explanation
- vocabulary
- assets

Example:

```json
{
  "id": "FE-A-2025-PUBLIC-001",
  "sourceType": "IPA_PUBLIC",
  "year": 2025,
  "correctAnswer": "B",
  "verified": true
}
```

---

## AI Rule

DeepSeek responsibilities:

- Explain
- Translate
- Tutor
- Generate similar practice questions

DeepSeek must NOT:

- Change official answers
- Invent source information
- Replace verified content

Official answers always come from the database.

---

## Product Principle

The application promises:

> Learn from verified official FE material and high-quality practice questions.

The application never promises:

> Contains every real CBT examination question.
