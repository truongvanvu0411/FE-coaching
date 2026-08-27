import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type LayoutWord = { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } };

type LayoutLine = {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  words?: LayoutWord[];
};

type LayoutPage = { pageNumber: number; lines: LayoutLine[] };

type Candidate = {
  id: string;
  session: string;
  sourceUrl: string;
  sourcePage: string;
  questionNumber: string;
  bodyJa: string;
  choices: { key: string; order: number; textJa: string }[];
  correctAnswer: string;
  parseConfidence: number;
  mappingStatus: "CLEAN" | "REVIEW_REQUIRED" | "OCR_FAILED";
  needsVisualReview: boolean;
  manualVisualOverride?: boolean;
};

type VisualOverride = { sourcePage: string; choices: string[]; body?: string };

const ROOT = process.cwd();
const STORAGE = process.env.V2_STORAGE ? join(ROOT, process.env.V2_STORAGE) : join(ROOT, "storage", "ipa-exemption");
const OUTPUT = process.env.V2_OUTPUT ? join(ROOT, process.env.V2_OUTPUT) : join(STORAGE, "candidates-v2");
const OCR_DIR = process.env.V2_OCR_DIR ?? "ocr-v2";
const DEFAULT_SESSIONS = ["2026-06", "2026-07"];
const MARKERS = ["ア", "イ", "ウ", "エ"];
void MARKERS;

function normalize(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function normalizeNumber(value: string) {
  return value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xff10 + 48));
}

function questionHeader(text: string) {
  const match = normalizeNumber(text.trim()).match(/^(?:問|間)\s*([0-9]{1,3})(?=\s|[_＿ｰー\-]|$)/u);
  if (!match) return null;
  let number = Number(match[1]);
  // OCR occasionally duplicates a digit in a two-digit question number (e.g. "問 355").
  if (number > 80 && match[1].length === 3) number = Number(match[1].slice(0, 2));
  // Legacy OCR commonly reads the final question header "80" as another
  // two-digit value above the exam range (for example 86 or 89).
  if (number > 80 && number <= 99) number = 80;
  return number >= 1 && number <= 80 ? number : null;
}

function stripQuestionHeader(text: string) {
  return text.replace(/^(?:問|間)\s*[０-９0-9]{1,3}\s*[_＿ｰー\-]?\s*/u, "");
}

function optionLine(text: string, allowAttachedWide = false) {
  const parts = text.trim().split(/\s+/u);
  const first = parts[0] ?? "";
  const token = markerToken(first, true)
    ?? (allowAttachedWide && /^[アイウエ].{1,2}$/u.test(first) ? { marker: first[0], remainder: first.slice(1) } : null);
  if (!token) return null;
  return { marker: token.marker, text: [token.remainder, ...parts.slice(1)].filter(Boolean).join(" ") };
}

function legacyMarkerToken(value: string, allowAttached = false) {
  const token = value.trim().replace(/[：:、。，．.]+$/u, "");
  if (token === "ァ") return { marker: "ア", remainder: "" };
  if (/^[アイウエ](?:[ーｰィ])?$/u.test(token)) return { marker: token[0], remainder: "" };
  const attachedNumeric = token.match(/^([アイウエ])(?:[ーｰィ])?([0-9０-９]+)$/u);
  if (allowAttached && attachedNumeric) return { marker: attachedNumeric[1], remainder: attachedNumeric[2] };
  if (allowAttached && /^[アイウエ][ニスマまィーｰ]$/u.test(token)) {
    return { marker: token[0], remainder: token.slice(1) };
  }
  return null;
}

function markerToken(value: string, allowAttached = false) {
  const token = value.trim();
  const aliases = [
    { alias: "\u7e67\uFF62", marker: "A" },
    { alias: "\u7e67\uFF64", marker: "B" },
    { alias: "\u7e67\uFF66", marker: "C" },
    { alias: "\u7e67\uFF68", marker: "D" },
    { alias: "\u30A2", marker: "A" },
    { alias: "\u30A4", marker: "B" },
    { alias: "\u30A6", marker: "C" },
    { alias: "\u30A8", marker: "D" },
  ];
  if (token === "\u7e67\uFF61") return { marker: "A", remainder: "" };
  if (token === "\u30A8\u30A8") return { marker: "D", remainder: "" };
  for (const { alias, marker } of aliases) {
    if (!token.startsWith(alias)) continue;
    const remainder = token.slice(alias.length).replace(/^[\u30FC\uFF70\u7E70\uFF65\uFF63\uFF67\uFF69]/u, "");
    if (!remainder) return { marker, remainder: "" };
    if (allowAttached && /^[0-9\uFF10-\uFF19.・\uFF0B+\-=/()]+$/u.test(remainder)) return { marker, remainder };
    if (allowAttached && remainder.length === 1 && /^[\u30A1-\u30FF]$/u.test(remainder)) return { marker, remainder };
  }
  return legacyMarkerToken(value, allowAttached);
}

function inlineOptions(line: LayoutLine) {
  const words = line.words ?? [];
  const exactMarkerCount = words.filter((word) => markerToken(word.text) !== null).length;
  const markers = words
    .map((word, index) => ({
      word,
      index,
      token: markerToken(
        word.text,
        (index === 0 && word.bbox.x0 < 220)
          || (word.bbox.x0 >= 500 && word.bbox.x0 < 570)
          || (exactMarkerCount >= 2 && word.text.trim().length === 2),
      ),
    }))
    .filter((item): item is { word: LayoutWord; index: number; token: { marker: string; remainder: string } } => item.token !== null);
  if (markers.length < 2) return [];
  return markers.map((item, markerIndex) => {
    const next = markers[markerIndex + 1]?.index ?? words.length;
    return {
      marker: item.token.marker,
      text: [item.token.remainder, ...words.slice(item.index + 1, next).map((word) => word.text)].filter(Boolean).join(" "),
    };
  });
}

function scoreCandidate(body: string, choices: string[], labels: string[], confidence: number) {
  const shape = choices.length === 4 ? 0.35 : 0;
  const order = labels.join("") === ["A", "B", "C", "D"].join("") ? 0.2 : 0;
  const bodyScore = body.length >= 50 ? 0.2 : body.length >= 20 ? 0.1 : 0;
  // Numeric and symbolic answer choices are often only 1–3 characters long
  // (for example `1`, `2`, `5`, `6`). Length alone must not lower confidence;
  // emptiness is the structural failure we need to catch here.
  const choiceScore = choices.every((choice) => choice.trim().length > 0) ? 0.15 : 0;
  return Math.min(1, Number((shape + order + bodyScore + choiceScore + confidence / 100 * 0.1).toFixed(3)));
}

function isNoiseLine(text: string) {
  const value = normalize(text);
  if (!value) return true;
  if (/^[ー一\-]?\s*\d{1,3}\s*[ー一\-]?$/u.test(value)) return true;
  if (/[|<>]/u.test(value)) return true;
  if (value.length <= 3) return true;
  return false;
}

function candidateRank(candidate: Candidate) {
  const choiceShape = candidate.choices.length === 4 ? 100 : 0;
  const nonEmpty = candidate.choices.filter((choice) => choice.textJa.length >= 4).length * 10;
  const labelOrder = candidate.choices.length === 4 ? 10 : 0;
  const body = Math.min(candidate.bodyJa.length, 400) / 100;
  return choiceShape + nonEmpty + labelOrder + body + candidate.parseConfidence;
}

async function loadAnswerMap(session: string) {
  const answerMap = new Map<string, string>();
  try {
    const pages = JSON.parse(await readFile(join(STORAGE, "candidates", "pages", `${session}-answer.json`), "utf8")) as { text: string }[];
    const text = pages.map((page) => page.text).join("\n");
    for (const match of text.matchAll(/問\s*(\d{1,2})\s*([アイウエ])/gu)) {
      const number = Number(match[1]);
      if (number >= 1 && number <= 80) answerMap.set(`Q${String(number).padStart(2, "0")}`, { ア: "A", イ: "B", ウ: "C", エ: "D" }[match[2]]!);
    }
  } catch {
    // Keep the pilot usable if the legacy answer cache is absent.
  }
  if (answerMap.size < 50) {
    try {
      const previous = JSON.parse(await readFile(join(STORAGE, "candidates", `${session}.json`), "utf8")) as { candidates: { questionNumber: string; correctAnswer: string }[] };
      for (const candidate of previous.candidates) if (candidate.correctAnswer) answerMap.set(candidate.questionNumber, candidate.correctAnswer);
    } catch {
      // New pilot sessions have no v1 candidate cache; QA will fail closed if answers are missing.
    }
  }
  try {
    const overrides = JSON.parse(await readFile(join(STORAGE, "qa-v2", "answer-overrides.json"), "utf8")) as Record<string, Record<string, string>>;
    for (const [questionNumber, answer] of Object.entries(overrides[session] ?? {})) answerMap.set(questionNumber, answer);
  } catch {
    // Answer overrides are optional and only used when a source answer sheet is unreadable.
  }
  return answerMap;
}

function selectedSessions(manifest: { session: string }[]) {
  const requested = process.env.V2_SESSIONS?.split(",").map((value) => value.trim()).filter(Boolean);
  if (process.env.FULL_V2 === "1") return manifest.map((item) => item.session);
  if (requested?.length) return manifest.map((item) => item.session).filter((session) => requested.includes(session));
  return DEFAULT_SESSIONS;
}

function parsePageLines(
  pages: LayoutPage[],
  session: string,
  sourceUrl: string,
  answerMap: Map<string, string>,
  overrides: Map<string, VisualOverride>,
) {
  const candidates: Candidate[] = [];
  let current: { number: number; page: number; body: string[]; choices: { marker: string; text: string }[]; confidence: number[]; visual: boolean } | null = null;
  let questionOrdinal = 1;

  const flush = () => {
    if (!current) return;
    const questionNumber = `Q${String(current.number).padStart(2, "0")}`;
    const override = overrides.get(`${session}:${questionNumber}`);
    const body = normalize(override?.body ?? current.body.filter((line) => !isNoiseLine(line)).join("\n"));
    const labels = current.choices.map((choice) => choice.marker);
    const choices = (override?.choices ?? current.choices.slice(0, 4).map((choice) => choice.text)).map((text, index) => ({
      key: ["A", "B", "C", "D"][index],
      order: index,
      textJa: normalize(text),
    }));
    const averageConfidence = current.confidence.length
      ? current.confidence.reduce((sum, value) => sum + value, 0) / current.confidence.length
      : 0;
    const score = scoreCandidate(body, choices.map((choice) => choice.textJa), labels, averageConfidence);
    const clean = !override && choices.length === 4
      && labels.length === 4
      && labels.join("") === ["A", "B", "C", "D"].join("")
      && body.length >= 20
      && choices.every((choice) => choice.textJa.trim().length > 0)
      && averageConfidence >= 75;
    candidates.push({
      id: `FE-A-EXEMPTION-${session}-Q${String(current.number).padStart(2, "0")}`,
      session,
      sourceUrl,
      sourcePage: String(current.page),
      questionNumber,
      bodyJa: body,
      choices,
      correctAnswer: answerMap.get(`Q${String(current.number).padStart(2, "0")}`) ?? "",
      parseConfidence: score,
      mappingStatus: clean ? "CLEAN" : choices.length === 4 ? "REVIEW_REQUIRED" : "OCR_FAILED",
      needsVisualReview: current.visual || Boolean(override),
      manualVisualOverride: Boolean(override),
    });
    current = null;
  };

  for (const page of pages) {
    for (const line of page.lines) {
      const text = normalize(line.text);
      const detectedNumber = questionHeader(text);
      if (detectedNumber !== null) {
        flush();
        // The printed PDFs are sequential Q1..Q60, while OCR occasionally swaps/duplicates digits.
        // Use reading order as the canonical number and keep OCR number only as a detection signal.
        current = {
          number: questionOrdinal++,
          page: page.pageNumber,
          body: [stripQuestionHeader(text)],
          choices: [],
          confidence: [line.confidence],
          visual: /図|表|プログラム|データ/u.test(text),
        };
        continue;
      }
      if (!current) continue;
      const inline = inlineOptions(line);
      if (inline.length >= 2) {
        for (const option of inline) current.choices.push(option);
        current.confidence.push(line.confidence);
        if (/図|表|プログラム|データ/u.test(text)) current.visual = true;
        continue;
      }
      const option = optionLine(text, current.choices.length > 0);
      if (option) {
        current.choices.push(option);
        current.confidence.push(line.confidence);
      } else if (current.choices.length) {
        if (isNoiseLine(text)) continue;
        current.choices[current.choices.length - 1].text += `\n${text}`;
        current.confidence.push(line.confidence);
      } else {
        current.body.push(text);
        current.confidence.push(line.confidence);
      }
      if (/図|表|プログラム|データ/u.test(text)) current.visual = true;
    }
  }
  flush();
  const bestByNumber = new Map<string, Candidate>();
  for (const candidate of candidates) {
    const previous = bestByNumber.get(candidate.questionNumber);
    if (!previous || candidateRank(candidate) > candidateRank(previous)) bestByNumber.set(candidate.questionNumber, candidate);
  }
  return [...bestByNumber.values()].sort((a, b) => Number(a.questionNumber.slice(1)) - Number(b.questionNumber.slice(1)));
}

async function main() {
  const manifest = JSON.parse(await readFile(join(STORAGE, process.env.V2_MANIFEST ?? "batch1-manifest.json"), "utf8")) as { session: string; questionUrl: string; expected?: number }[];
  await mkdir(OUTPUT, { recursive: true });
  for (const session of selectedSessions(manifest)) {
    const layout = JSON.parse(await readFile(join(STORAGE, OCR_DIR, `${session}-question-layout.json`), "utf8")) as { pages: LayoutPage[] };
    const answerMap = await loadAnswerMap(session);
    let previous: { expected?: number } = {};
    try {
      previous = JSON.parse(await readFile(join(STORAGE, "candidates", `${session}.json`), "utf8")) as { expected?: number };
    } catch {}
    const source = manifest.find((item) => item.session === session);
    if (!source) throw new Error(`Missing manifest item ${session}`);
    const visualOverrides = JSON.parse(await readFile(join(STORAGE, "qa-v2", "visual-overrides.json"), "utf8")) as Record<string, VisualOverride>;
    let extraOverrides: Record<string, VisualOverride> = {};
    try {
      extraOverrides = JSON.parse(await readFile(join(STORAGE, "qa-v2", "visual-overrides-extra.json"), "utf8")) as Record<string, VisualOverride>;
    } catch {}
    const candidates = parsePageLines(layout.pages, session, source.questionUrl, answerMap, new Map(Object.entries({ ...visualOverrides, ...extraOverrides })))
      .filter((candidate) => Number(candidate.questionNumber.slice(1)) <= (source.expected ?? 80));
    const expectedOverride: Record<string, number> = { "2021-06": 80, "2021-07": 80, "2020-06": 80, "2020-07": 80 };
    const expected = expectedOverride[session] ?? source.expected ?? previous.expected ?? (answerMap.size >= 75 ? 80 : 60);
    const report = {
      session,
      parserVersion: "layout-v2-1",
      expected,
      parsed: candidates.length,
      clean: candidates.filter((candidate) => candidate.mappingStatus === "CLEAN").length,
      reviewRequired: candidates.filter((candidate) => candidate.mappingStatus === "REVIEW_REQUIRED").length,
      failed: candidates.filter((candidate) => candidate.mappingStatus === "OCR_FAILED").length,
      candidates,
    };
    await writeFile(join(OUTPUT, `${session}.json`), JSON.stringify(report, null, 2), "utf8");
    console.log(`${session}: parsed=${report.parsed}/${report.expected} clean=${report.clean} review=${report.reviewRequired} failed=${report.failed}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
