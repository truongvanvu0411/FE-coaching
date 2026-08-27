import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

type Candidate = { id: string; session: string; sourcePage: string; mappingStatus: string; parseConfidence: number; needsVisualReview: boolean; duplicate?: boolean; risk: string; choices: { key: string; order: number; textJa: string }[]; correctAnswer: string; bodyJa: string };
async function main() {
  const root = process.cwd();
  const candidates = JSON.parse(await readFile(join(root, "storage/review/pending-review-candidates.json"), "utf8")) as Candidate[];
  const inventory = JSON.parse(await readFile(join(root, "storage/review/pending-current-inventory.json"), "utf8")) as { pendingByRiskIds: Record<string, string[]> };
  const pending = new Set(inventory.pendingByRiskIds.P0 ?? []);
  const allowlist = candidates.filter((candidate) => pending.has(candidate.id)
    && candidate.risk === "P0" && candidate.duplicate === true
    && candidate.mappingStatus === "CLEAN" && candidate.parseConfidence >= 0.95
    && !candidate.needsVisualReview && candidate.bodyJa.trim().length > 0
    && candidate.choices.length === 4
    && candidate.choices.every((choice, index) => choice.key === ["A", "B", "C", "D"][index] && choice.order === index && choice.textJa.trim().length > 0)
    && /^[ABCD]$/u.test(candidate.correctAnswer)
    && existsSync(join(root, "storage/review/pages", `${candidate.session}-p${candidate.sourcePage}.png`)));
  await writeFile(join(root, "storage/review/pending-review-p0-canonical.json"), JSON.stringify(allowlist, null, 2), "utf8");
  console.log(JSON.stringify({ selected: allowlist.length, ids: allowlist.map((candidate) => candidate.id) }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
