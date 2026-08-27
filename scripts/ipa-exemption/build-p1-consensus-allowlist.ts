import "dotenv/config";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Choice = { key: string; order: number; textJa: string };
type Candidate = {
  id: string;
  session: string;
  sourcePage: string;
  bodyJa: string;
  choices: Choice[];
  correctAnswer: string;
  mappingStatus: string;
  parseConfidence: number;
  needsVisualReview: boolean;
  duplicate?: boolean;
  risk: string;
  issues: string[];
};

const root = process.cwd();
const keys = ["A", "B", "C", "D"];
const normalize = (value: string) => value.toLowerCase().replace(/\s+/gu, "").replace(/[、。，．,.|_`~]+/gu, "");
const fingerprint = (candidate: Candidate) => candidate.choices.map((choice) => normalize(choice.textJa)).join("|");

function sourceDirs(session: string) {
  if (session.startsWith("2020")) return ["ipa-exemption/candidates-v2", "ipa-exemption/candidates-v4-merged"];
  if (session.startsWith("2014")) return ["ipa-classic/candidates-v2-2014", "ipa-classic/candidates-v4-merged-2014"];
  return ["ipa-classic/candidates-v2", "ipa-classic/candidates-v2-scale2", "ipa-classic/candidates-v2-scale3", "ipa-classic/candidates-v2-targeted", "ipa-classic/candidates-v4-parser", "ipa-classic/candidates-v4-merged"];
}

async function main() {
  const candidates = JSON.parse(await readFile(join(root, "storage/review/pending-review-candidates.json"), "utf8")) as Candidate[];
  const inventory = JSON.parse(await readFile(join(root, "storage/review/pending-current-inventory.json"), "utf8")) as { pendingByRiskIds: Record<string, string[]> };
  const pending = new Set(inventory.pendingByRiskIds.P1 ?? []);
  const answerAudit = JSON.parse(await readFile(join(root, "storage/review/answer-map-audit.json"), "utf8")) as { mismatchCount: number };
  if (answerAudit.mismatchCount !== 0) throw new Error("Official answer map audit is not clean; refusing consensus allowlist.");

  const variants = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    for (const dir of sourceDirs(candidate.session)) {
      const file = join(root, "storage", dir, `${candidate.session}.json`);
      try {
        const report = JSON.parse(await readFile(file, "utf8")) as { candidates: Candidate[] };
        const variant = report.candidates.find((item) => item.id === candidate.id);
        if (variant) variants.set(candidate.id, [...(variants.get(candidate.id) ?? []), variant]);
      } catch {}
    }
  }

  const allowlist = candidates.filter((candidate) => {
    if (!pending.has(candidate.id) || candidate.risk !== "P1" || candidate.duplicate || candidate.mappingStatus !== "CLEAN" || candidate.needsVisualReview || candidate.parseConfidence < 0.85 || candidate.issues.some((issue) => issue !== "low_confidence")) return false;
    if (candidate.bodyJa.trim().length < 20 || !/^[ABCD]$/u.test(candidate.correctAnswer) || candidate.choices.length !== 4 || candidate.choices.some((choice, index) => choice.key !== keys[index] || choice.order !== index || !choice.textJa.trim())) return false;
    if (!existsSync(join(root, "storage/review/pages", `${candidate.session}-p${candidate.sourcePage}.png`))) return false;
    const fingerprints = new Map<string, number>();
    for (const variant of variants.get(candidate.id) ?? []) {
      if (variant.choices.length !== 4 || variant.choices.some((choice) => !choice.textJa.trim())) continue;
      const fp = fingerprint(variant);
      fingerprints.set(fp, (fingerprints.get(fp) ?? 0) + 1);
    }
    const consensus = Math.max(0, ...fingerprints.values());
    const minimum = candidate.session.startsWith("2020") ? 2 : 3;
    return consensus >= minimum;
  });

  await writeFile(join(root, "storage/review/pending-review-p1-consensus.json"), JSON.stringify(allowlist, null, 2), "utf8");
  console.log(JSON.stringify({ selected: allowlist.length, bySession: Object.fromEntries([...new Set(allowlist.map((candidate) => candidate.session))].sort().map((session) => [session, allowlist.filter((candidate) => candidate.session === session).length])) }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
