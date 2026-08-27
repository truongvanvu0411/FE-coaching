import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";

type LayoutWord = { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } };
type LayoutLine = { text: string; confidence: number; bbox: LayoutWord["bbox"]; words?: LayoutWord[] };
type LayoutPage = { pageNumber: number; width: number; height: number; confidence: number; text: string; lines: LayoutLine[] };
type OcrPage = { blocks?: { paragraphs?: { lines?: { text: string; confidence: number; bbox: LayoutWord["bbox"]; words?: LayoutWord[] }[] }[] }[]; confidence: number; text: string };
type Candidate = { sourcePage: string; choices: { textJa: string }[]; mappingStatus?: string; parseConfidence?: number; needsVisualReview?: boolean };

const root = join(process.cwd(), "storage", "ipa-classic");
const inputDir = process.env.CLASSIC_INPUT_DIR ?? "candidates-v2";
const baseOcrDir = process.env.CLASSIC_BASE_OCR_DIR ?? "ocr-v2";
const outputDir = process.env.CLASSIC_OUTPUT_DIR ?? "ocr-v4-targeted";
const targetsFile = process.env.CLASSIC_TARGETS_FILE;
const ocrPsm = process.env.CLASSIC_OCR_PSM;
const sessions = (process.env.CLASSIC_SESSIONS?.split(",").map((value) => value.trim()).filter(Boolean)
  ?? ["2015-autumn", "2015-spring", "2016-autumn", "2016-spring", "2017-autumn", "2017-spring", "2018-autumn", "2018-spring", "2019-autumn", "2019-spring"]);

async function main() {
  const targetSpec = targetsFile ? JSON.parse(await readFile(join(process.cwd(), targetsFile), "utf8")) as { bySession: Record<string, { pages: number[] }> } : null;
  const output = join(root, outputDir);
  await mkdir(output, { recursive: true });
  for (const session of sessions) {
    let report: { candidates: Candidate[] } = { candidates: [] };
    try { report = JSON.parse(await readFile(join(root, inputDir, `${session}.json`), "utf8")) as { candidates: Candidate[] }; } catch {}
    const targetPages = targetSpec?.bySession[session]?.pages ?? [...new Set(report.candidates.filter((candidate) => candidate.choices.length !== 4 || candidate.choices.some((choice) => !choice.textJa.trim()) || candidate.mappingStatus === "REVIEW_REQUIRED" || candidate.mappingStatus === "OCR_FAILED" || candidate.needsVisualReview || (candidate.parseConfidence ?? 1) < 0.9).map((candidate) => Number(candidate.sourcePage)).filter(Number.isFinite))];
    const base = JSON.parse(await readFile(join(root, baseOcrDir, `${session}-question-layout.json`), "utf8")) as { pages: LayoutPage[]; [key: string]: unknown };
    if (!targetPages.length) { await writeFile(join(output, `${session}-question-layout.json`), JSON.stringify(base), "utf8"); continue; }
    const manifest = JSON.parse(await readFile(join(root, "manifest.json"), "utf8")) as { session: string; questionFile: string }[];
    const item = manifest.find((entry) => entry.session === session);
    if (!item) throw new Error(`Missing manifest item ${session}`);
    const data = await readFile(join(root, session, item.questionFile));
    const parser = new PDFParse({ data });
    try {
      const screenshots = await parser.getScreenshot({ partial: targetPages, scale: 4, imageBuffer: true });
      const worker = await createWorker("jpn");
      try {
        if (ocrPsm) await worker.setParameters({ tessedit_pageseg_mode: ocrPsm as never });
        const replacements = new Map<number, LayoutPage>();
        for (const screenshot of screenshots.pages) {
          const result = await worker.recognize(Buffer.from(screenshot.data), {}, { text: true, blocks: true, layoutBlocks: true });
          const page = result.data as unknown as OcrPage;
          const lines: LayoutLine[] = [];
          for (const block of page.blocks ?? []) for (const paragraph of block.paragraphs ?? []) for (const line of paragraph.lines ?? []) {
            lines.push({ text: line.text, confidence: line.confidence, bbox: line.bbox, words: (line.words ?? []).map((word) => ({ text: word.text, confidence: word.confidence, bbox: word.bbox })) });
          }
          replacements.set(screenshot.pageNumber, { pageNumber: screenshot.pageNumber, width: screenshot.width, height: screenshot.height, confidence: page.confidence, text: page.text, lines });
          console.log(`${session}: targeted OCR page ${screenshot.pageNumber}/${targetPages.join(",")}`);
        }
        const pages = base.pages.map((page) => replacements.get(page.pageNumber) ?? page);
        await writeFile(join(output, `${session}-question-layout.json`), JSON.stringify({ ...base, parserVersion: "layout-v2-ocr-targeted-4", pages }), "utf8");
      } finally { await worker.terminate(); }
    } finally { await parser.destroy(); }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
