import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";

type ManifestItem = { session: string; questionFile: string };
type ReviewCandidate = { session: string; sourcePage: string; risk: string };

const ROOT = process.cwd();
const OUTPUT = join(ROOT, "storage", "review", "pages");

async function manifest(path: string) { return JSON.parse(await readFile(path, "utf8")) as ManifestItem[]; }

async function main() {
  const reviewed = JSON.parse(await readFile(join(ROOT, "storage", "review", "pending-review-candidates.json"), "utf8")) as ReviewCandidate[];
  const legacy = await manifest(join(ROOT, "storage", "ipa-exemption", "legacy-pilot-manifest.json"));
  const classic = await manifest(join(ROOT, "storage", "ipa-classic", "manifest.json"));
  const bySession = new Map([...legacy, ...classic].map((item) => [item.session, item]));
  const groups = new Map<string, Set<number>>();
  // Every pending item must have a source page available in the review UI.
  // Rendering only P0/P1 made the lower-risk queue impossible to verify
  // safely because the reviewer could tick the confirmation without seeing
  // the original scan.
  for (const candidate of reviewed) {
    const page = Number(candidate.sourcePage);
    if (!Number.isFinite(page)) continue;
    const pages = groups.get(candidate.session) ?? new Set<number>();
    pages.add(page);
    groups.set(candidate.session, pages);
  }
  await mkdir(OUTPUT, { recursive: true });
  const index: Record<string, string[]> = {};
  for (const [session, pageSet] of groups) {
    const item = bySession.get(session);
    if (!item) continue;
    const storage = session.startsWith("2020-") ? "ipa-exemption" : "ipa-classic";
    const parser = new PDFParse({ data: await readFile(join(ROOT, "storage", storage, session, item.questionFile)) });
    try {
      const pages = [...pageSet].sort((a, b) => a - b);
      const screenshots = await parser.getScreenshot({ partial: pages, scale: 2, imageBuffer: true });
      index[session] = [];
      for (const page of screenshots.pages) {
        const output = join(OUTPUT, `${session}-p${page.pageNumber}.png`);
        await writeFile(output, Buffer.from(page.data));
        index[session].push(output);
      }
      console.log(`${session}: rendered ${pages.length} review pages`);
    } finally { await parser.destroy(); }
  }
  await writeFile(join(OUTPUT, "index.json"), JSON.stringify(index, null, 2), "utf8");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
