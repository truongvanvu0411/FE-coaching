import "dotenv/config";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
type Candidate = { id: string; session: string; sourcePage: string; bodyJa: string; choices: { key: string; order: number; textJa: string }[]; correctAnswer: string; mappingStatus: string; parseConfidence: number; needsVisualReview: boolean; duplicate?: boolean; risk?: string; issues?: string[] };
const root = process.cwd();
const candidatesDir = process.env.RECOVERY_CANDIDATES_DIR ?? "candidates-v6-psm3";
async function main() {
  const current = JSON.parse(await readFile(join(root, "storage/review/pending-review-candidates.json"), "utf8")) as Candidate[];
  const inventory = JSON.parse(await readFile(join(root, "storage/review/pending-current-inventory.json"), "utf8")) as { pendingByRiskIds: Record<string, string[]> };
  const pending = new Set([...inventory.pendingByRiskIds.P0 ?? [], ...inventory.pendingByRiskIds.P1 ?? []]);
  const audit = JSON.parse(await readFile(join(root, "storage/review/answer-map-audit.json"), "utf8")) as { mismatchCount: number };
  if (audit.mismatchCount !== 0) throw new Error("Answer map audit is not clean");
  const allowlist: Candidate[] = [];
  for (const old of current) {
    if (!pending.has(old.id) || old.duplicate || old.needsVisualReview) continue;
    const file = join(root, "storage", old.session.startsWith("2020") ? "ipa-exemption" : "ipa-classic", candidatesDir, `${old.session}.json`);
    try {
      const report = JSON.parse(await readFile(file, "utf8")) as { candidates: Candidate[] };
      const candidate = report.candidates.find((item) => item.id === old.id);
      if (!candidate || candidate.needsVisualReview || candidate.mappingStatus !== "CLEAN" || candidate.parseConfidence < 0.88 || candidate.choices.length !== 4 || candidate.choices.some((choice, index) => choice.key !== ["A", "B", "C", "D"][index] || choice.order !== index || !choice.textJa.trim()) || candidate.bodyJa.trim().length < 20 || !/^[ABCD]$/u.test(candidate.correctAnswer) || !existsSync(join(root, "storage/review/pages", `${candidate.session}-p${candidate.sourcePage}.png`))) continue;
      allowlist.push({ ...candidate, risk: "P1", issues: ["psm3_recovery"] });
    } catch {}
  }
  await writeFile(join(root, "storage/review/pending-review-psm3-recovery.json"), JSON.stringify(allowlist, null, 2), "utf8");
  console.log(JSON.stringify({ selected: allowlist.length, ids: allowlist.map((candidate) => candidate.id) }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
