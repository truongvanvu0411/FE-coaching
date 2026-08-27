import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";

const STORAGE = join(process.cwd(), "storage", "ipa-exemption");
const OUTPUT = join(STORAGE, "qa-v2", "legacy-pilot-pages");
const targets: Record<string, number[]> = {
  "2020-06": [5, 7, 11, 13, 15, 17, 19, 26, 38],
  "2020-07": [5, 12, 13, 15, 16, 17, 18, 23],
};

async function main() {
  const manifest = JSON.parse(await readFile(join(STORAGE, "legacy-pilot-manifest.json"), "utf8")) as { session: string; questionFile: string }[];
  await mkdir(OUTPUT, { recursive: true });
  for (const item of manifest) {
    const parser = new PDFParse({ data: await readFile(join(STORAGE, item.session, item.questionFile)) });
    try {
      const pages = await parser.getScreenshot({ partial: targets[item.session], scale: 2, imageBuffer: true });
      for (const page of pages.pages) {
        const output = join(OUTPUT, `${item.session}-p${page.pageNumber}.png`);
        await writeFile(output, Buffer.from(page.data));
        console.log(`${item.session} page ${page.pageNumber}: ${output}`);
      }
    } finally {
      await parser.destroy();
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
