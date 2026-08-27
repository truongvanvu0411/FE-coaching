import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";

type ManifestItem = { session: string; questionFile: string };

const ROOT = process.cwd();
const STORAGE = join(ROOT, "storage", "ipa-exemption");
const REVIEW_DIR = join(STORAGE, "qa-v2", "review-pages");
const REVIEW = [
  { session: "2026-06", questionNumber: "Q13", page: 8 },
  { session: "2026-06", questionNumber: "Q22", page: 12 },
  { session: "2026-06", questionNumber: "Q58", page: 29 },
  { session: "2026-07", questionNumber: "Q14", page: 8 },
  { session: "2026-07", questionNumber: "Q20", page: 11 },
  { session: "2026-07", questionNumber: "Q22", page: 12 },
  { session: "2025-12", questionNumber: "Q03", page: 4 },
  { session: "2025-12", questionNumber: "Q21", page: 11 },
  { session: "2025-12", questionNumber: "Q42", page: 19 },
  { session: "2026-01", questionNumber: "Q01", page: 4 },
  { session: "2026-01", questionNumber: "Q16", page: 8 },
  { session: "2026-01", questionNumber: "Q19", page: 10 },
  { session: "2026-01", questionNumber: "Q27", page: 13 },
  { session: "2026-01", questionNumber: "Q57", page: 25 },
  { session: "2025-06", questionNumber: "Q04", page: 5 },
  { session: "2025-06", questionNumber: "Q45", page: 24 },
  { session: "2025-06", questionNumber: "Q58", page: 29 },
  { session: "2025-06", questionNumber: "Q59", page: 29 },
  { session: "2025-07", questionNumber: "Q01", page: 4 },
  { session: "2025-07", questionNumber: "Q02", page: 4 },
  { session: "2025-07", questionNumber: "Q31", page: 16 },
  { session: "2025-07", questionNumber: "Q44", page: 22 },
  { session: "2024-12", questionNumber: "Q01", page: 4 },
  { session: "2024-12", questionNumber: "Q09", page: 7 },
  { session: "2024-12", questionNumber: "Q16", page: 10 },
  { session: "2024-12", questionNumber: "Q26", page: 14 },
  { session: "2025-01", questionNumber: "Q13", page: 8 },
  { session: "2024-07", questionNumber: "Q04", page: 5 },
  { session: "2024-07", questionNumber: "Q06", page: 5 },
  { session: "2024-07", questionNumber: "Q16", page: 8 },
  { session: "2024-07", questionNumber: "Q57", page: 27 },
  { session: "2024-06", questionNumber: "Q19", page: 9 },
  { session: "2024-06", questionNumber: "Q28", page: 12 },
  { session: "2024-06", questionNumber: "Q42", page: 18 },
  { session: "2024-01", questionNumber: "Q02", page: 4 },
  { session: "2024-01", questionNumber: "Q12", page: 8 },
  { session: "2024-01", questionNumber: "Q16", page: 10 },
  { session: "2024-01", questionNumber: "Q21", page: 12 },
  { session: "2024-01", questionNumber: "Q26", page: 14 },
  { session: "2023-12", questionNumber: "Q19", page: 9 },
  { session: "2023-07", questionNumber: "Q02", page: 2 },
  { session: "2023-07", questionNumber: "Q03", page: 3 },
  { session: "2023-07", questionNumber: "Q19", page: 10 },
  { session: "2023-07", questionNumber: "Q42", page: 19 },
  { session: "2023-06", questionNumber: "Q33", page: 13 },
  { session: "2023-06", questionNumber: "Q45", page: 18 },
  { session: "2023-06", questionNumber: "Q57", page: 24 },
  { session: "2023-01", questionNumber: "Q01", page: 4 },
  { session: "2023-01", questionNumber: "Q02", page: 4 },
  { session: "2023-01", questionNumber: "Q04", page: 5 },
  { session: "2023-01", questionNumber: "Q09", page: 8 },
  { session: "2023-01", questionNumber: "Q19", page: 12 },
  { session: "2023-01", questionNumber: "Q47", page: 25 },
  { session: "2023-01", questionNumber: "Q58", page: 30 },
  { session: "2022-12", questionNumber: "Q03", page: 4 },
  { session: "2022-12", questionNumber: "Q04", page: 4 },
  { session: "2022-12", questionNumber: "Q07", page: 6 },
  { session: "2022-12", questionNumber: "Q20", page: 13 },
  { session: "2022-12", questionNumber: "Q23", page: 15 },
  { session: "2022-12", questionNumber: "Q26", page: 16 },
  { session: "2022-12", questionNumber: "Q33", page: 19 },
  { session: "2022-07", questionNumber: "Q02", page: 3 },
  { session: "2022-07", questionNumber: "Q04", page: 4 },
  { session: "2022-07", questionNumber: "Q08", page: 6 },
  { session: "2022-07", questionNumber: "Q19", page: 10 },
  { session: "2022-07", questionNumber: "Q22", page: 11 },
  { session: "2022-07", questionNumber: "Q24", page: 12 },
  { session: "2022-07", questionNumber: "Q38", page: 18 },
  { session: "2022-07", questionNumber: "Q80", page: 36 },
  { session: "2022-06", questionNumber: "Q01", page: 3 },
  { session: "2022-06", questionNumber: "Q04", page: 4 },
  { session: "2022-06", questionNumber: "Q07", page: 6 },
  { session: "2022-06", questionNumber: "Q13", page: 9 },
  { session: "2022-06", questionNumber: "Q22", page: 12 },
  { session: "2022-06", questionNumber: "Q34", page: 16 },
  { session: "2022-06", questionNumber: "Q35", page: 17 },
  { session: "2022-06", questionNumber: "Q43", page: 20 },
  { session: "2022-06", questionNumber: "Q53", page: 24 },
  { session: "2022-06", questionNumber: "Q54", page: 24 },
  { session: "2022-01", questionNumber: "Q01", page: 3 },
  { session: "2022-01", questionNumber: "Q02", page: 3 },
  { session: "2022-01", questionNumber: "Q06", page: 5 },
  { session: "2022-01", questionNumber: "Q09", page: 8 },
  { session: "2022-01", questionNumber: "Q12", page: 9 },
  { session: "2022-01", questionNumber: "Q17", page: 11 },
  { session: "2022-01", questionNumber: "Q20", page: 12 },
  { session: "2022-01", questionNumber: "Q21", page: 13 },
  { session: "2022-01", questionNumber: "Q22", page: 13 },
  { session: "2022-01", questionNumber: "Q24", page: 14 },
  { session: "2022-01", questionNumber: "Q26", page: 15 },
  { session: "2022-01", questionNumber: "Q27", page: 15 },
  { session: "2022-01", questionNumber: "Q40", page: 20 },
  { session: "2022-01", questionNumber: "Q47", page: 24 },
  { session: "2022-01", questionNumber: "Q49", page: 25 },
  { session: "2022-01", questionNumber: "Q51", page: 26 },
  { session: "2022-01", questionNumber: "Q76", page: 37 },
  { session: "2021-12", questionNumber: "Q02", page: 3 },
  { session: "2021-12", questionNumber: "Q03", page: 4 },
  { session: "2021-12", questionNumber: "Q05", page: 5 },
  { session: "2021-12", questionNumber: "Q06", page: 5 },
  { session: "2021-12", questionNumber: "Q11", page: 8 },
  { session: "2021-12", questionNumber: "Q12", page: 9 },
  { session: "2021-12", questionNumber: "Q13", page: 9 },
  { session: "2021-12", questionNumber: "Q15", page: 10 },
  { session: "2021-12", questionNumber: "Q19", page: 11 },
  { session: "2021-12", questionNumber: "Q20", page: 11 },
  { session: "2021-12", questionNumber: "Q22", page: 12 },
  { session: "2021-12", questionNumber: "Q25", page: 14 },
  { session: "2021-12", questionNumber: "Q26", page: 14 },
  { session: "2021-12", questionNumber: "Q27", page: 15 },
  { session: "2021-12", questionNumber: "Q30", page: 16 },
  { session: "2021-12", questionNumber: "Q34", page: 17 },
  { session: "2021-12", questionNumber: "Q41", page: 20 },
  { session: "2021-12", questionNumber: "Q43", page: 21 },
  { session: "2021-12", questionNumber: "Q47", page: 23 },
  { session: "2021-12", questionNumber: "Q53", page: 26 },
  { session: "2021-12", questionNumber: "Q54", page: 26 },
] as const;

async function main() {
  const manifest = JSON.parse(await readFile(join(STORAGE, "batch1-manifest.json"), "utf8")) as ManifestItem[];
  await mkdir(REVIEW_DIR, { recursive: true });
  for (const target of REVIEW) {
    const item = manifest.find((entry) => entry.session === target.session);
    if (!item) throw new Error(`Missing manifest item ${target.session}`);
    const parser = new PDFParse({ data: await readFile(join(STORAGE, target.session, item.questionFile)) });
    try {
      const screenshot = await parser.getScreenshot({ partial: [target.page], scale: 2, imageBuffer: true });
      const page = screenshot.pages[0];
      if (!page) throw new Error(`Missing page ${target.session} ${target.page}`);
      const output = join(REVIEW_DIR, `${target.session}-${target.questionNumber}-p${target.page}.png`);
      await writeFile(output, Buffer.from(page.data));
      console.log(`${target.session} ${target.questionNumber}: ${output}`);
    } finally {
      await parser.destroy();
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
