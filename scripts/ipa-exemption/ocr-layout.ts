import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";

type ManifestItem = {
  session: string;
  questionFile: string;
};

type LayoutWord = {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};

type LayoutLine = {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  words: LayoutWord[];
};
type LayoutPage = { pageNumber: number; width: number; height: number; confidence: number; text: string; lines: LayoutLine[] };

type OcrWord = LayoutWord;
type OcrLine = { text: string; confidence: number; bbox: LayoutLine["bbox"]; words?: OcrWord[] };
type OcrParagraph = { lines?: OcrLine[] };
type OcrBlock = { paragraphs?: OcrParagraph[] };
type OcrPage = { blocks?: OcrBlock[]; confidence: number; text: string };

const ROOT = process.cwd();
const STORAGE = process.env.LAYOUT_STORAGE ? resolve(ROOT, process.env.LAYOUT_STORAGE) : join(ROOT, "storage", "ipa-exemption");
const MANIFEST = join(STORAGE, process.env.LAYOUT_MANIFEST ?? "batch1-manifest.json");
const OUTPUT = process.env.LAYOUT_OUTPUT ? resolve(ROOT, process.env.LAYOUT_OUTPUT) : join(STORAGE, "ocr-v2");
const OCR_SCALE = Number(process.env.OCR_SCALE ?? "2");
const TARGETS_FILE = process.env.LAYOUT_TARGETS;
const BASE_DIR = process.env.LAYOUT_BASE_DIR ? resolve(ROOT, process.env.LAYOUT_BASE_DIR) : null;
const OCR_PSM = process.env.OCR_PSM;

function selected(items: ManifestItem[]) {
  const requested = process.env.LAYOUT_SESSIONS?.split(",").map((value) => value.trim()).filter(Boolean);
  if (process.env.FULL_LAYOUT === "1") return items;
  if (requested?.length) return items.filter((item) => requested.includes(item.session));
  return items.filter((item) => item.session === "2026-06" || item.session === "2026-07");
}

async function extractLayout(filePath: string, partial?: number[]) {
  const data = await readFile(filePath);
  const parser = new PDFParse({ data });
  try {
    const info = await parser.getInfo();
    const screenshots = await parser.getScreenshot({
      partial: partial ?? Array.from({ length: info.total }, (_, index) => index + 1),
      scale: OCR_SCALE,
      imageBuffer: true,
    });
    const worker = await createWorker("jpn");
    try {
      if (OCR_PSM) await worker.setParameters({ tessedit_pageseg_mode: OCR_PSM as never });
      const pages: LayoutPage[] = [];
      for (const screenshot of screenshots.pages) {
        const result = await worker.recognize(
          Buffer.from(screenshot.data),
          {},
          { text: true, blocks: true, layoutBlocks: true },
        );
        const page = result.data as OcrPage;
        const lines: LayoutLine[] = [];
        for (const block of page.blocks ?? []) {
          for (const paragraph of block.paragraphs ?? []) {
            for (const line of paragraph.lines ?? []) {
              lines.push({
                text: line.text,
                confidence: line.confidence,
                bbox: line.bbox,
                  words: (line.words ?? []).map((word) => ({
                  text: word.text,
                  confidence: word.confidence,
                  bbox: word.bbox,
                })),
              });
            }
          }
        }
        pages.push({
          pageNumber: screenshot.pageNumber,
          width: screenshot.width,
          height: screenshot.height,
          confidence: page.confidence,
          text: page.text,
          lines,
        });
        console.log(`${filePath.split("\\").pop()}: layout OCR ${screenshot.pageNumber}/${screenshots.total}`);
      }
      return pages;
    } finally {
      await worker.terminate();
    }
  } finally {
    await parser.destroy();
  }
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8")) as ManifestItem[];
  const targetSpec = TARGETS_FILE ? JSON.parse(await readFile(resolve(ROOT, TARGETS_FILE), "utf8")) as { bySession: Record<string, { pages: number[] }> } : null;
  const force = process.env.FORCE_LAYOUT === "1";
  await mkdir(OUTPUT, { recursive: true });
  for (const item of selected(manifest)) {
    const outputPath = join(OUTPUT, `${item.session}-question-layout.json`);
    if (!force) {
      try {
        await readFile(outputPath);
        console.log(`${item.session}: layout cache exists`);
        continue;
      } catch {}
    }
    const targetPages = targetSpec?.bySession[item.session]?.pages;
    if (targetPages?.length && BASE_DIR) {
      const base = JSON.parse(await readFile(join(BASE_DIR, `${item.session}-question-layout.json`), "utf8")) as { session: string; pages: LayoutPage[]; [key: string]: unknown };
      const replacements = await extractLayout(join(STORAGE, item.session, item.questionFile), targetPages);
      const byPage = new Map(replacements.map((page) => [page.pageNumber, page]));
      const pages = base.pages.map((page) => byPage.get(page.pageNumber) ?? page);
      await writeFile(outputPath, JSON.stringify({ ...base, parserVersion: "layout-v2-ocr-targeted", pages }), "utf8");
    } else {
      const pages = await extractLayout(join(STORAGE, item.session, item.questionFile));
      await writeFile(outputPath, JSON.stringify({ session: item.session, parserVersion: "layout-v2-ocr-1", pages }), "utf8");
    }
    console.log(`${item.session}: layout cache written`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
