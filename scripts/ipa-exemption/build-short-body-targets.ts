import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Candidate = { id: string; session: string; sourcePage: string; issues: string[]; risk: string };
const root = process.cwd();

async function main() {
  const candidates = JSON.parse(await readFile(join(root, "storage/review/pending-review-candidates.json"), "utf8")) as Candidate[];
  const inventory = JSON.parse(await readFile(join(root, "storage/review/pending-current-inventory.json"), "utf8")) as { pendingByRiskIds: Record<string, string[]> };
  const pending = new Set(inventory.pendingByRiskIds.P1 ?? []);
  const targets = candidates.filter((candidate) => pending.has(candidate.id) && candidate.risk === "P1" && candidate.issues.includes("short_body"));
  const bySession: Record<string, { pages: number[]; ids: string[] }> = {};
  for (const candidate of targets) {
    const entry = bySession[candidate.session] ?? { pages: [], ids: [] };
    const page = Number(candidate.sourcePage);
    if (Number.isFinite(page) && !entry.pages.includes(page)) entry.pages.push(page);
    entry.ids.push(candidate.id);
    bySession[candidate.session] = entry;
  }
  for (const entry of Object.values(bySession)) entry.pages.sort((left, right) => left - right);
  const output = process.env.SHORT_BODY_OUTPUT ?? "storage/review/p1-short-body-targets.json";
  await writeFile(join(root, output), JSON.stringify({ generatedAt: new Date().toISOString(), targetCount: targets.length, bySession }, null, 2), "utf8");
  console.log(JSON.stringify({ output, targetCount: targets.length, bySession }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
