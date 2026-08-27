import "dotenv/config";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Choice = { key: string; order: number; textJa: string };
type Candidate = { id: string; session: string; sourcePage: string; bodyJa: string; choices: Choice[]; correctAnswer: string; mappingStatus: string; parseConfidence: number; needsVisualReview: boolean; duplicate?: boolean; risk?: string; issues?: string[]; autoApprove?: boolean };
const root = process.cwd();
const forcedIds = new Set((process.env.VISUAL_ALLOWLIST_IDS ?? "").split(",").map((value) => value.trim()).filter(Boolean));

function validChoice(value: string) {
  const compact = value.replace(/\s+/gu, "");
  return compact.length >= 1 && compact.length <= 180 && !/[|_`~]|ーー/u.test(value) && !/^[-。、,.]/u.test(compact);
}

function bodySimilarity(left: string, right: string) {
  const normalize = (value: string) => value.toLowerCase().replace(/\s+/gu, "").replace(/[^\p{L}\p{N}]/gu, "");
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return 0;
  const grams = (value: string) => new Set([...value].map((_, index) => value.slice(index, index + 2)).filter((gram) => gram.length === 2));
  const leftGrams = grams(a);
  const rightGrams = grams(b);
  let intersection = 0;
  for (const gram of leftGrams) if (rightGrams.has(gram)) intersection += 1;
  return (2 * intersection) / (leftGrams.size + rightGrams.size);
}

async function main() {
  const batch = JSON.parse(await readFile(join(root, process.env.VISUAL_BATCH_FILE ?? "storage/review/p1-visual-batch-02.json"), "utf8")) as { bySession: Record<string, { ids: string[] }> };
  const current = JSON.parse(await readFile(join(root, "storage/review/pending-review-candidates.json"), "utf8")) as Candidate[];
  const inventory = JSON.parse(await readFile(join(root, "storage/review/pending-current-inventory.json"), "utf8")) as { pendingByRiskIds: Record<string, string[]> };
  const pending = new Set([...inventory.pendingByRiskIds.P0 ?? [], ...inventory.pendingByRiskIds.P1 ?? []]);
  const selectedIds = new Set(Object.values(batch.bySession).flatMap((value) => value.ids));
  const outputDir = process.env.VISUAL_CANDIDATES_DIR ?? "candidates-v10-visual02";
  const allowlist: Candidate[] = [];
  for (const old of current.filter((candidate) => selectedIds.has(candidate.id) && (pending.has(candidate.id) || forcedIds.has(candidate.id)) && candidate.issues?.includes("visual_review"))) {
    const file = join(root, outputDir, `${old.session}.json`);
    let report: { candidates: Candidate[] };
    try { report = JSON.parse(await readFile(file, "utf8")) as { candidates: Candidate[] }; } catch { continue; }
    const fresh = report.candidates.find((candidate) => candidate.id === old.id);
    if (!fresh || fresh.mappingStatus !== "CLEAN" || fresh.needsVisualReview || fresh.parseConfidence < 0.85) continue;
    // Targeted OCR can shift question ordinals on pages containing diagrams.
    // Require the new body to match the current question before publishing.
    if (fresh.correctAnswer !== old.correctAnswer || bodySimilarity(fresh.bodyJa, old.bodyJa) < 0.65) continue;
    if (fresh.bodyJa.trim().length < 20 || !/^[ABCD]$/u.test(fresh.correctAnswer) || fresh.choices.length !== 4) continue;
    if (fresh.choices.some((choice, index) => choice.key !== ["A", "B", "C", "D"][index] || choice.order !== index || !validChoice(choice.textJa))) continue;
    if (!existsSync(join(root, "storage/review/pages", `${fresh.session}-p${fresh.sourcePage}.png`))) continue;
    allowlist.push({ ...fresh, risk: old.risk, duplicate: old.duplicate, autoApprove: false });
  }
  const output = process.env.VISUAL_ALLOWLIST_OUTPUT ?? "storage/review/pending-review-p1-visual-auto.json";
  await writeFile(join(root, output), JSON.stringify(allowlist, null, 2), "utf8");
  console.log(JSON.stringify({ output, selected: allowlist.length, ids: allowlist.map((candidate) => candidate.id) }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
