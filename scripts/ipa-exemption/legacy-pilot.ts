import "dotenv/config";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";

type PilotItem = {
  session: string;
  examDate: string;
  fiscalYear: number;
  expected: number;
  questionUrl: string;
  answerUrl: string;
  questionFile: string;
  answerFile: string;
};

const STORAGE = join(process.cwd(), "storage", "ipa-exemption");
const MANIFEST_PATH = join(STORAGE, "legacy-pilot-manifest.json");
const PAGE_CACHE = join(STORAGE, "candidates", "pages");
const SESSIONS = ["2020-06", "2020-07"];

function sha256(data: Uint8Array) {
  return createHash("sha256").update(data).digest("hex");
}

async function fetchManifest() {
  const html = await fetch("https://www.ipa.go.jp/shiken/about/menjo-fe.html").then(async (response) => {
    if (!response.ok) throw new Error(`IPA page failed: ${response.status}`);
    return response.text();
  });
  const byDate = new Map<string, Partial<PilotItem>>();
  for (const match of html.matchAll(/href="([^"]*tokurei_(?:Mondai|ans)_(\d{8})_FE\.pdf)"/g)) {
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
  const selected = [...byDate.entries()]
    .filter(([date, item]) => SESSIONS.includes(`${date.slice(0, 4)}-${date.slice(4, 6)}`) && item.questionUrl && item.answerUrl)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, item]) => ({
      session: `${date.slice(0, 4)}-${date.slice(4, 6)}`,
      examDate: item.examDate!,
      fiscalYear: Number(date.slice(0, 4)) - (date.slice(4, 6) === "01" ? 1 : 0),
      expected: 80,
      questionUrl: item.questionUrl!,
      answerUrl: item.answerUrl!,
      questionFile: item.questionFile!,
      answerFile: item.answerFile!,
    }));
  if (selected.length !== SESSIONS.length) throw new Error(`Expected ${SESSIONS.length} pilot sessions, found ${selected.length}`);
  await mkdir(STORAGE, { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(selected, null, 2), "utf8");
  return selected;
}

async function download(item: PilotItem, kind: "question" | "answer", url: string, file: string) {
  const target = join(STORAGE, item.session, file);
  await mkdir(join(STORAGE, item.session), { recursive: true });
  try {
    const cached = await readFile(target);
    return { file, bytes: cached.byteLength, sha256: sha256(cached), cached: true };
  } catch {
    const response = await fetch(url, { headers: { "user-agent": "FE-Coach-source-ingest/1.0" } });
    if (!response.ok) throw new Error(`${item.session} ${kind}: download failed ${response.status}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("pdf") && !url.endsWith(".pdf")) throw new Error(`${item.session} ${kind}: response is not PDF`);
    const data = new Uint8Array(await response.arrayBuffer());
    if (data.byteLength < 50_000) throw new Error(`${item.session} ${kind}: suspiciously small PDF (${data.byteLength} bytes)`);
    await writeFile(target, data);
    return { file, bytes: data.byteLength, sha256: sha256(data), cached: false };
  }
}

async function extractPages(filePath: string, allowOcr = true) {
  const data = await readFile(filePath);
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    const pages = result.pages.map((page) => ({ page: page.num, text: page.text.trim() }));
    if (pages.filter((page) => page.text.length > 20).length >= Math.max(1, Math.floor(pages.length * 0.8))) {
      return { pages, mode: "TEXT_LAYER" as const };
    }
    if (!allowOcr) return { pages: [], mode: "IMAGE_ONLY" as const };
    const info = await parser.getInfo();
    const screenshots = await parser.getScreenshot({ partial: Array.from({ length: info.total }, (_, index) => index + 1), scale: 2, imageBuffer: true });
    const worker = await createWorker("jpn");
    try {
      const ocrPages: { page: number; text: string }[] = [];
      for (const screenshot of screenshots.pages) {
        const recognized = await worker.recognize(Buffer.from(screenshot.data));
        ocrPages.push({ page: screenshot.pageNumber, text: recognized.data.text.trim() });
        console.log(`${filePath.split("\\").pop()}: OCR ${screenshot.pageNumber}/${screenshots.total}`);
      }
      return { pages: ocrPages, mode: "OCR" as const };
    } finally {
      await worker.terminate();
    }
  } finally {
    await parser.destroy();
  }
}

async function main() {
  const manifest = await fetchManifest();
  const artifacts: { session: string; files: unknown; questionExtraction: string; answerExtraction: string }[] = [];
  await mkdir(PAGE_CACHE, { recursive: true });
  await mkdir(join(STORAGE, "qa-v2"), { recursive: true });
  for (const item of manifest) {
    const [question, answer] = await Promise.all([
      download(item, "question", item.questionUrl, item.questionFile),
      download(item, "answer", item.answerUrl, item.answerFile),
    ]);
    const questionPath = join(STORAGE, item.session, item.questionFile);
    const answerPath = join(STORAGE, item.session, item.answerFile);
    const [questionPages, answerPages] = await Promise.all([extractPages(questionPath, false), extractPages(answerPath)]);
    await writeFile(join(PAGE_CACHE, `${item.session}-question.json`), JSON.stringify(questionPages.pages), "utf8");
    await writeFile(join(PAGE_CACHE, `${item.session}-answer.json`), JSON.stringify(answerPages.pages), "utf8");
    artifacts.push({ session: item.session, files: { question, answer }, questionExtraction: questionPages.mode, answerExtraction: answerPages.mode });
    console.log(`${item.session}: source verified; question=${questionPages.mode}, answer=${answerPages.mode}`);
  }
  await writeFile(join(STORAGE, "qa-v2", "legacy-pilot-source.json"), JSON.stringify({ generatedAt: new Date().toISOString(), sessions: manifest, artifacts }, null, 2), "utf8");
  console.log(`Legacy pilot source ready: ${manifest.map((item) => item.session).join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
