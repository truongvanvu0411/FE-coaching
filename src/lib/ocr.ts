import { readFile } from "node:fs/promises";

/**
 * Official IPA PDFs are text-layer PDFs, not scans, so pdf-parse (text
 * extraction) is the primary path. tesseract.js OCR is kept as a fallback
 * for image uploads (e.g. a photographed/scanned page) where there is no
 * text layer to extract.
 */
export async function extractTextFromFile(filePath: string, mimeHint: string) {
  if (mimeHint === "application/pdf" || filePath.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const buffer = await readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("jpn");
  try {
    const {
      data: { text },
    } = await worker.recognize(filePath);
    return text;
  } finally {
    await worker.terminate();
  }
}
