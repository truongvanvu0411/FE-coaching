import "dotenv/config";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const STORAGE = join(ROOT, "storage", "ipa-exemption");
const MANIFEST_PATH = join(STORAGE, "batch1-manifest.json");
const OFFICIAL_PAGE = "https://www.ipa.go.jp/shiken/about/menjo-fe.html";
const KEY_MAP: Record<string, string> = { ア: "A", イ: "B", ウ: "C", エ: "D" };

type ManifestItem = {
  session: string;
  examDate: string;
  fiscalYear: number;
  questionUrl: string;
  answerUrl: string;
  questionFile: string;
  answerFile: string;
};

type ParsedQuestion = {
  id: string;
  session: string;
  examDate: string;
  sourceUrl: string;
  sourcePage: string;
  questionNumber: string;
  bodyJa: string;
  choices: { key: string; textJa: string; order: number }[];
  correctAnswer: string;
  parseConfidence: number;
  needsReview: boolean;
};

function sha256(data: Uint8Array) {
  return createHash("sha256").update(data).digest("hex");
}

function sessionFromDate(raw: string) {
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}`;
}

function normalizeText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\r\n?/g, "\n")
    .trim();
}

function cleanChoiceText(value: string) {
  return normalizeText(value).replace(/(?:\s|^)[アイウエ]\s*$/u, "").trim();
}

async function fetchManifest() {
  const html = await fetch(OFFICIAL_PAGE).then(async (response) => {
    if (!response.ok) throw new Error(`IPA page failed: ${response.status}`);
    return response.text();
  });
  const links = [...html.matchAll(/href="([^"]*tokurei_(?:Mondai|ans)_(\d{8})_FE\.pdf)"/g)];
  const byDate = new Map<string, Partial<ManifestItem>>();
  for (const match of links) {
    const href = match[1].startsWith("http") ? match[1] : `https://www.ipa.go.jp${match[1]}`;
    const date = match[2];
    const current = byDate.get(date) ?? { examDate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}` };
    if (match[1].includes("_ans_")) {
      current.answerUrl = href;
      current.answerFile = match[1].split("/").pop()!;
    } else {
      current.questionUrl = href;
      current.questionFile = match[1].split("/").pop()!;
    }
    byDate.set(date, current);
  }
  const result: ManifestItem[] = [...byDate.entries()]
    .filter(([date, item]) => Number(date) >= 20210601 && item.questionUrl && item.answerUrl)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, item]) => ({
      session: sessionFromDate(date),
      examDate: item.examDate!,
      fiscalYear: Number(date.slice(0, 4)) - (date.slice(4, 6) === "01" ? 1 : 0),
      questionUrl: item.questionUrl!,
      answerUrl: item.answerUrl!,
      questionFile: item.questionFile!,
      answerFile: item.answerFile!,
    }));
  if (result.length !== 22) {
    throw new Error(`Expected 22 Batch 1 sessions, found ${result.length}`);
  }
  await mkdir(STORAGE, { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(`Manifest written: ${result.length} sessions -> ${MANIFEST_PATH}`);
  return result;
}

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as ManifestItem[];
  } catch {
    return fetchManifest();
  }
}

function selected(items: ManifestItem[], pilot: boolean) {
  return pilot ? items.filter((item) => item.session === "2026-06" || item.session === "2026-07") : items;
}

async function download(items: ManifestItem[]) {
  for (const item of items) {
    const dir = join(STORAGE, item.session);
    await mkdir(dir, { recursive: true });
    for (const [kind, url, file] of [
      ["question", item.questionUrl, item.questionFile],
      ["answer", item.answerUrl, item.answerFile],
    ] as const) {
      const target = join(dir, file);
      try {
        const existing = await readFile(target);
        console.log(`${item.session} ${kind}: cached sha256=${sha256(existing).slice(0, 12)}`);
        continue;
      } catch {}
      const response = await fetch(url, { headers: { "user-agent": "FE-Coach-source-ingest/1.0" } });
      if (!response.ok) throw new Error(`Download failed ${response.status}: ${url}`);
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("pdf") && !url.endsWith(".pdf")) throw new Error(`Not a PDF: ${url}`);
      const data = new Uint8Array(await response.arrayBuffer());
      await writeFile(target, data);
      console.log(`${item.session} ${kind}: downloaded ${data.byteLength} bytes sha256=${sha256(data).slice(0, 12)}`);
    }
  }
}

async function extractPages(filePath: string) {
  const data = await readFile(filePath);
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    const pages = result.pages.map((page) => ({ page: page.num, text: normalizeText(page.text) }));
    if (pages.some((page) => page.text.length > 20)) return pages;

    // A number of IPA exemption PDFs are image-only. Render each page and
    // OCR it instead of treating an empty text layer as a successful parse.
    const screenshots = await parser.getScreenshot({
      partial: Array.from({ length: result.total }, (_, index) => index + 1),
      scale: 2,
      imageBuffer: true,
    });
    const worker = await createWorker("jpn");
    try {
      const ocrPages: { page: number; text: string }[] = [];
      for (const screenshot of screenshots.pages) {
        const recognized = await worker.recognize(Buffer.from(screenshot.data));
        ocrPages.push({ page: screenshot.pageNumber, text: normalizeText(recognized.data.text) });
        console.log(`${filePath.split("\\").pop()}: OCR page ${screenshot.pageNumber}/${screenshots.total}`);
      }
      return ocrPages;
    } finally {
      await worker.terminate();
    }
  } finally {
    await parser.destroy();
  }
}

function detectQuestionCount(text: string) {
  return /80\s*問/.test(text) ? 80 : 60;
}

function parseAnswerText(text: string, expected: number) {
  const answers = new Map<number, string>();
  const normalized = text.replace(/\r\n?/g, "\n");

  // Answer PDFs are four-column tables. Reading row-wise is more reliable
  // than trusting OCR's distorted question numbers (especially in 80-question
  // legacy layouts). The columns are Q1/16/31/46 for 60, and Q1/21/41/61
  // for 80.
  const columns = expected === 80 ? [1, 21, 41, 61] : [1, 16, 31, 46];
  const rows: string[][] = [];
  for (const line of normalized.split("\n")) {
    if (!/[問間]/.test(line)) continue;
    const letters = [...line.matchAll(/([アイウエ])\s*[|｜]?\s*[0-9]*\s*[TMS]/g)].map((match) => KEY_MAP[match[1]]);
    if (letters.length >= 3) rows.push(letters.slice(0, 4));
  }
  for (let row = 0; row < rows.length; row++) {
    for (let column = 0; column < rows[row].length; column++) {
      const number = columns[column] + row;
      if (number <= expected) answers.set(number, rows[row][column]);
    }
  }

  // Newer answer PDFs have clean `問12 ア` text; use it as a fallback when
  // the table OCR did not yield enough cells.
  if (answers.size < expected) {
    const matches = [...normalized.replace(/\s+/g, " ").matchAll(/問\s*(\d{1,2})\s*([アイウエ])/g)];
    for (const match of matches) {
      const number = Number(match[1]);
      if (number >= 1 && number <= expected) answers.set(number, KEY_MAP[match[2]]);
    }
  }
  return answers;
}

function parseQuestions(pages: { page: number; text: string }[], answers: Map<number, string>, item: ManifestItem, expected: number) {
  const all = pages.map((page) => `\n[[PAGE:${page.page}]]\n${page.text}`).join("\n");
  const starts = [...all.matchAll(/(?:^|\n)\s*問\s*(\d{1,2})\s*[\.:．、]?/g)];
  const parsed: ParsedQuestion[] = [];
  for (let index = 0; index < starts.length; index++) {
    const number = Number(starts[index][1]);
    if (number < 1 || number > expected) continue;
    const start = starts[index].index! + starts[index][0].length;
    const end = starts[index + 1]?.index ?? all.length;
    const raw = all.slice(start, end).trim();
    const pageMarker = all.slice(0, start).match(/\[\[PAGE:(\d+)\]\][\s\S]*$/);
    const page = pageMarker?.[1] ?? "";
    const content = raw.replace(/\[\[PAGE:\d+\]\]/g, "").trim();
    const choiceMatches = [...content.matchAll(/(?:^|\n|\s)([アエイウ])\s*[\.．、:：]?\s*/g)];
    const ordered = choiceMatches
      .map((match, choiceIndex) => ({ key: KEY_MAP[match[1]], start: match.index! + match[0].length, choiceIndex }))
      .filter((choice) => Boolean(choice.key));
    const choices = ordered.slice(0, 4).map((choice, choiceIndex) => ({
      // OCR can misread ア/イ/ウ/エ. Choice order in the PDF is authoritative.
      key: ["A", "B", "C", "D"][choiceIndex],
      order: choiceIndex,
      textJa: cleanChoiceText(content.slice(choice.start, ordered[choiceIndex + 1]?.start ?? content.length)),
    }));
    const body = normalizeText(content.slice(0, ordered[0]?.start ? ordered[0].start - (choiceMatches[0]?.[0].length ?? 0) : content.length));
    const valid = choices.length === 4 && body.length >= 10 && answers.has(number);
    parsed.push({
      id: `FE-A-EXEMPTION-${item.session}-Q${String(number).padStart(2, "0")}`,
      session: item.session,
      examDate: item.examDate,
      sourceUrl: item.questionUrl,
      sourcePage: page,
      questionNumber: `Q${String(number).padStart(2, "0")}`,
      bodyJa: body,
      choices,
      correctAnswer: answers.get(number) ?? "",
      parseConfidence: valid ? 1 : choices.length === 4 && answers.has(number) ? 0.7 : 0.2,
      needsReview: !valid || /図|表|次のプログラム|次のデータ/.test(content),
    });
  }
  // OCR occasionally sees the same question number twice (for example in a
  // diagram caption). Keep one deterministic candidate per question number.
  const byNumber = new Map<string, ParsedQuestion>();
  for (const candidate of parsed) {
    const current = byNumber.get(candidate.questionNumber);
    const score = (candidate.choices.length === 4 ? 100 : 0) + Math.min(candidate.bodyJa.length, 500) + (candidate.sourcePage ? 10 : 0);
    const currentScore = current
      ? (current.choices.length === 4 ? 100 : 0) + Math.min(current.bodyJa.length, 500) + (current.sourcePage ? 10 : 0)
      : -1;
    if (!current || score > currentScore) byNumber.set(candidate.questionNumber, candidate);
  }
  return [...byNumber.values()].sort((a, b) => a.questionNumber.localeCompare(b.questionNumber, undefined, { numeric: true }));
}

async function parse(items: ManifestItem[]) {
  const outputDir = join(STORAGE, "candidates");
  const pagesDir = join(outputDir, "pages");
  await mkdir(outputDir, { recursive: true });
  await mkdir(pagesDir, { recursive: true });
  for (const item of items) {
    const questionFile = join(STORAGE, item.session, item.questionFile);
    const answerFile = join(STORAGE, item.session, item.answerFile);
    const questionPagesPath = join(pagesDir, `${item.session}-question.json`);
    const answerPagesPath = join(pagesDir, `${item.session}-answer.json`);
    const loadOrExtract = async (path: string, source: string) => {
      try {
        return JSON.parse(await readFile(path, "utf8")) as { page: number; text: string }[];
      } catch {
        const pages = await extractPages(source);
        await writeFile(path, JSON.stringify(pages), "utf8");
        return pages;
      }
    };
    const [questionPages, answerPages] = await Promise.all([
      loadOrExtract(questionPagesPath, questionFile),
      loadOrExtract(answerPagesPath, answerFile),
    ]);
    const expected = detectQuestionCount(answerPages.map((page) => page.text).join("\n"));
    const answers = parseAnswerText(answerPages.map((page) => page.text).join("\n"), expected);
    const candidates = parseQuestions(questionPages, answers, item, expected);
    const parsedNumbers = new Set(candidates.map((candidate) => Number(candidate.questionNumber.slice(1))));
    const missing = Array.from({ length: expected }, (_, index) => index + 1).filter((number) => !parsedNumbers.has(number));
    const report = {
      session: item.session,
      expected,
      parsed: candidates.length,
      answers: answers.size,
      valid: candidates.filter((candidate) => !candidate.needsReview).length,
      missing,
      candidates,
    };
    await writeFile(join(outputDir, `${item.session}.json`), JSON.stringify(report, null, 2), "utf8");
    console.log(`${item.session}: parsed=${report.parsed}/${report.expected} answers=${report.answers}/${report.expected} clean=${report.valid}`);
  }
}

async function importCandidates(items: ManifestItem[]) {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });
  const topics = await prisma.topic.findMany({ where: { section: "A" } });
  const fallback = topics.find((topic) => topic.nameJa === "基礎理論") ?? topics[0];
  if (!fallback) throw new Error("No Section A topics found. Run prisma seed first.");
  let imported = 0;
  try {
    for (const item of items) {
      const path = join(STORAGE, "candidates", `${item.session}.json`);
      const report = JSON.parse(await readFile(path, "utf8")) as { candidates: ParsedQuestion[] };
      const job = await prisma.ingestJob.upsert({
        where: { id: `ipa-exemption-${item.session}` },
        update: { fileName: item.questionFile, fileUrl: item.questionUrl, sourceType: "IPA_EXEMPTION", status: "PARSED", ocrText: null, parseErrors: null },
        create: { id: `ipa-exemption-${item.session}`, fileName: item.questionFile, fileUrl: item.questionUrl, sourceType: "IPA_EXEMPTION", status: "PARSED" },
      });
      for (const candidate of report.candidates) {
        if (candidate.choices.length !== 4 || !candidate.correctAnswer || candidate.bodyJa.trim().length < 10) continue;
        await prisma.question.upsert({
          where: { id: candidate.id },
          update: {
            sourceUrl: candidate.sourceUrl,
            sourcePage: candidate.sourcePage,
            questionNumber: candidate.questionNumber,
            bodyJa: candidate.bodyJa,
            correctAnswer: candidate.correctAnswer,
            reviewStatus: "PENDING_REVIEW",
            verified: false,
            ingestJobId: job.id,
            choices: { deleteMany: {}, create: candidate.choices },
          },
          create: {
            id: candidate.id,
            section: "A",
            year: Number(candidate.session.slice(0, 4)),
            sourceType: "IPA_EXEMPTION",
            sourceUrl: candidate.sourceUrl,
            sourcePage: candidate.sourcePage,
            questionNumber: candidate.questionNumber,
            topicId: fallback.id,
            difficulty: "MEDIUM",
            bodyJa: candidate.bodyJa,
            correctAnswer: candidate.correctAnswer,
            verified: false,
            reviewStatus: "PENDING_REVIEW",
            ingestJobId: job.id,
            choices: { create: candidate.choices },
          },
        });
        imported++;
      }
    }
  } finally {
    await prisma.$disconnect();
  }
  console.log(`Imported/upserted candidates: ${imported}`);
}

async function cleanupInvalidCandidates() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });
  try {
    const candidates = await prisma.question.findMany({
      where: { sourceType: "IPA_EXEMPTION", reviewStatus: "PENDING_REVIEW" },
      select: { id: true, bodyJa: true },
    });
    const invalidIds = candidates.filter((candidate) => candidate.bodyJa.trim().length < 10).map((candidate) => candidate.id);
    if (invalidIds.length) await prisma.question.deleteMany({ where: { id: { in: invalidIds } } });
    console.log(`Removed malformed unverified exemption candidates: ${invalidIds.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const pilot = args.has("--pilot");
  const action = [...args].find((arg) => !arg.startsWith("--")) ?? "all";
  const manifest = await loadManifest();
  const items = selected(manifest, pilot);
  console.log(`Batch 1 ${pilot ? "pilot" : "full"}: ${items.length} sessions`);
  if (action === "catalog" || action === "all") await fetchManifest();
  if (action === "download" || action === "all") await download(items);
  if (action === "parse" || action === "all") await parse(items);
  if (action === "import" || action === "all") await importCandidates(items);
  if (action === "cleanup") await cleanupInvalidCandidates();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
