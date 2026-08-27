import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Candidate = { id: string; session: string; sourcePage: string; parseConfidence: number; issues: string[]; risk: string };
const root = process.cwd();

async function main() {
  const candidates = JSON.parse(await readFile(join(root, "storage/review/pending-review-candidates.json"), "utf8")) as Candidate[];
  const inventory = JSON.parse(await readFile(join(root, "storage/review/pending-current-inventory.json"), "utf8")) as { pendingByRiskIds: Record<string, string[]> };
  const pending = new Set(inventory.pendingByRiskIds.P1 ?? []);
  const requested = new Set((process.env.LOW_CONFIDENCE_SESSIONS ?? "").split(",").map((value) => value.trim()).filter(Boolean));
  const targets = candidates.filter((candidate) => pending.has(candidate.id)
    && (!requested.size || requested.has(candidate.session))
    && (candidate.parseConfidence < 0.85 || candidate.issues.includes("short_body")));
  const bySession: Record<string, { pages: number[]; ids: string[] }> = {};
  for (const candidate of targets) {
    const page = Number(candidate.sourcePage);
    if (!Number.isFinite(page)) continue;
    const entry = bySession[candidate.session] ?? { pages: [], ids: [] };
    if (!entry.pages.includes(page)) entry.pages.push(page);
    entry.ids.push(candidate.id);
    bySession[candidate.session] = entry;
  }
  for (const entry of Object.values(bySession)) entry.pages.sort((a, b) => a - b);
  const result = { generatedAt: new Date().toISOString(), targetCount: targets.length, bySession };
  const output = process.env.LOW_CONFIDENCE_OUTPUT ?? "storage/review/p1-low-confidence-targets.json";
  await writeFile(join(root, output), JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify({ targetCount: targets.length, bySession: Object.fromEntries(Object.entries(bySession).map(([session, value]) => [session, { ids: value.ids.length, pages: value.pages.length, pageList: value.pages }])) }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
