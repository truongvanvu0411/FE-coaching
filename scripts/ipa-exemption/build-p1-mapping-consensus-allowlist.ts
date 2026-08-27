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

const ROOT = process.cwd();
const KEYS = ["A", "B", "C", "D"];

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/gu, "").replace(/[、。，．,.|_`~]+/gu, "");
}

function sourceDirs(session: string) {
  if (session.startsWith("2020")) return [
    "ipa-exemption/candidates-v2",
    "ipa-exemption/candidates-v4-merged",
    "ipa-exemption/candidates-v5-targeted-scale4",
    "ipa-exemption/candidates-v6-psm3",
  ];
  if (session.startsWith("2014")) return [
    "ipa-classic/candidates-v2-2014",
    "ipa-classic/candidates-v4-merged-2014",
  ];
  return [
    "ipa-classic/candidates-v2",
    "ipa-classic/candidates-v2-scale2",
    "ipa-classic/candidates-v2-scale3",
    "ipa-classic/candidates-v2-targeted",
    "ipa-classic/candidates-v4-parser",
    "ipa-classic/candidates-v4-merged",
    "ipa-classic/candidates-v5-targeted-scale4",
    "ipa-classic/candidates-v6-psm3",
    "ipa-classic/candidates-v7-psm11",
  ];
}

function safeChoiceText(value: string) {
  const compact = value.replace(/\s+/gu, "");
  if (compact.length < 2 || compact.length > 180) return false;
  // Reject OCR residue that is known to be a detached marker/scan footer.
  if (/[|_`~]|ーー|\u4e00\s*8|\u5c0e\s*ご|\u5409\s*三|\u4e5f\s*家|年$/u.test(value)) return false;
  if (/[4８8][UＵ]|[gm][CＯ]|\b(?:gm4|grQ|nC)\b|\d[.,]\d[.,]\d|[.,][.,]/u.test(value)) return false;
  if (/^[。、,.]/u.test(compact)) return false;
  if (/^[\u30f3\u30f5\u30f6\u30a7\u30a3\u30a9\u30c3\u30e3\u30e5\u30e7\u30cb]/u.test(compact)) return false;
  if (/^[\u3041-\u3096]\d/u.test(compact)) return false;
  if (/\n/u.test(value) && compact.length < 12) return false;
  return true;
}

async function main() {
  const candidates = JSON.parse(await readFile(join(ROOT, "storage/review/pending-review-candidates.json"), "utf8")) as Candidate[];
  const inventory = JSON.parse(await readFile(join(ROOT, "storage/review/pending-current-inventory.json"), "utf8")) as { pendingByRiskIds: Record<string, string[]> };
  const pending = new Set(inventory.pendingByRiskIds.P1 ?? []);
  const variants = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    for (const dir of sourceDirs(candidate.session)) {
      const file = join(ROOT, "storage", dir, `${candidate.session}.json`);
      try {
        const report = JSON.parse(await readFile(file, "utf8")) as { candidates: Candidate[] };
        const variant = report.candidates.find((item) => item.id === candidate.id);
        if (variant) variants.set(candidate.id, [...(variants.get(candidate.id) ?? []), variant]);
      } catch {
        // A variant is optional; the minimum consensus below remains fail-closed.
      }
    }
  }

  const allowlist = candidates.filter((candidate) => {
    if (!pending.has(candidate.id) || candidate.risk !== "P1" || !candidate.issues.includes("mapping_review")) return false;
    if (candidate.issues.includes("visual_review") || candidate.duplicate || candidate.needsVisualReview) return false;
    if (candidate.parseConfidence < 0.82 || candidate.bodyJa.trim().length < 20 || !/^[ABCD]$/u.test(candidate.correctAnswer)) return false;
    if (candidate.choices.length !== 4 || candidate.choices.some((choice, index) => choice.key !== KEYS[index] || choice.order !== index || !safeChoiceText(choice.textJa))) return false;
    if (!existsSync(join(ROOT, "storage/review/pages", `${candidate.session}-p${candidate.sourcePage}.png`))) return false;

    const fingerprints = new Map<string, number>();
    for (const variant of variants.get(candidate.id) ?? []) {
      if (variant.choices.length !== 4 || variant.choices.some((choice) => !safeChoiceText(choice.textJa))) continue;
      const fingerprint = variant.choices.map((choice) => normalize(choice.textJa)).join("|");
      fingerprints.set(fingerprint, (fingerprints.get(fingerprint) ?? 0) + 1);
    }
    const consensus = Math.max(0, ...fingerprints.values());
    const minimum = candidate.session.startsWith("2014") || candidate.session.startsWith("2020") ? 2 : 3;
    return consensus >= minimum;
  });

  await writeFile(join(ROOT, "storage/review/pending-review-p1-mapping-consensus.json"), JSON.stringify(allowlist, null, 2), "utf8");
  console.log(JSON.stringify({
    selected: allowlist.length,
    bySession: Object.fromEntries([...new Set(allowlist.map((candidate) => candidate.session))].sort().map((session) => [session, allowlist.filter((candidate) => candidate.session === session).length])),
  }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
