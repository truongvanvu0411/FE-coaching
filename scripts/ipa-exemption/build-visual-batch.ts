import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Row = { id: string; session: string; sourcePage: string; issues: string[] };
type Inventory = { pendingByRiskIds: Record<string, string[]> };

const root = process.cwd();
const sessions = new Set((process.env.VISUAL_BATCH_SESSIONS ?? "2020-06,2020-07").split(",").map((value) => value.trim()).filter(Boolean));
const pageLimit = Number(process.env.VISUAL_BATCH_PAGE_LIMIT ?? "20");
const output = process.env.VISUAL_BATCH_OUTPUT ?? "storage/review/p1-visual-batch-01.json";
const excludedPages = new Set((process.env.VISUAL_BATCH_EXCLUDE_PAGES ?? "").split(",").map((value) => value.trim()).filter(Boolean));

async function main() {
  const inventory = JSON.parse(await readFile(join(root, "storage/review/pending-current-inventory.json"), "utf8")) as Inventory;
  const candidates = JSON.parse(await readFile(join(root, "storage/review/pending-review-candidates.json"), "utf8")) as Row[];
  const pending = new Set([...inventory.pendingByRiskIds.P0 ?? [], ...inventory.pendingByRiskIds.P1 ?? []]);
  const rows = candidates.filter((candidate) => pending.has(candidate.id) && sessions.has(candidate.session) && candidate.issues.includes("visual_review"));
  const pages = new Map<string, number>();
  for (const row of rows) {
    const page = Number(row.sourcePage);
    if (Number.isFinite(page)) pages.set(`${row.session}:${page}`, page);
  }
  const selectedPages = [...pages.entries()].filter(([key]) => !excludedPages.has(key)).sort(([a], [b]) => a.localeCompare(b)).slice(0, pageLimit);
  const selected = new Set(selectedPages.map(([key]) => key));
  const bySession: Record<string, { pages: number[]; ids: string[] }> = {};
  for (const row of rows) {
    const page = Number(row.sourcePage);
    if (!selected.has(`${row.session}:${page}`)) continue;
    bySession[row.session] ??= { pages: [], ids: [] };
    if (!bySession[row.session].pages.includes(page)) bySession[row.session].pages.push(page);
    bySession[row.session].ids.push(row.id);
  }
  for (const value of Object.values(bySession)) value.pages.sort((a, b) => a - b);
  await writeFile(join(root, output), JSON.stringify({ generatedAt: new Date().toISOString(), pageLimit, targetCount: Object.values(bySession).reduce((sum, value) => sum + value.ids.length, 0), bySession }, null, 2), "utf8");
  console.log(JSON.stringify({ output, pages: selectedPages.length, targets: Object.values(bySession).reduce((sum, value) => sum + value.ids.length, 0), bySession }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
