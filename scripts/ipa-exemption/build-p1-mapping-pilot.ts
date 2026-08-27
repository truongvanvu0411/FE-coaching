import "dotenv/config";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Choice = { key: string; order: number; textJa: string };
type Candidate = {
  id: string; session: string; sourcePage: string; bodyJa: string; choices: Choice[];
  correctAnswer: string; mappingStatus: string; parseConfidence: number;
  needsVisualReview: boolean; duplicate?: boolean; risk: string; issues: string[];
  autoApprove?: boolean; sourceUrl?: string; questionNumber?: string;
};

const ROOT = process.cwd();
const KEYS = ["A", "B", "C", "D"];

function sourceDirs(session: string) {
  if (session.startsWith("2020")) return ["ipa-exemption/candidates-v2", "ipa-exemption/candidates-v4-merged"];
  if (session.startsWith("2014")) return ["ipa-classic/candidates-v2-2014", "ipa-classic/candidates-v4-merged-2014"];
  return ["ipa-classic/candidates-v2", "ipa-classic/candidates-v2-scale2", "ipa-classic/candidates-v2-scale3", "ipa-classic/candidates-v2-targeted", "ipa-classic/candidates-v4-parser", "ipa-classic/candidates-v4-merged", "ipa-classic/candidates-v5-targeted-scale4", "ipa-classic/candidates-v6-psm3", "ipa-classic/candidates-v7-psm11"];
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/gu, "").replace(/[縲√ゑｼ鯉ｼ・.|_`~]+/gu, "");
}

function cleanChoice(value: string) {
  const firstLine = value.split(/\r?\n/u)[0].trim();
  if (/^[+-]?\d[\d.,]*$/u.test(firstLine)) {
    if (!/^[+-]?\d{1,3}(?:[.,]\d{3})*(?:\.\d+)?$/u.test(firstLine)) return null;
    return firstLine;
  }
  return value.trim();
}

function safeChoice(value: string) {
  const cleaned = cleanChoice(value);
  if (!cleaned) return false;
  const compact = cleaned.replace(/\s+/gu, "");
  return compact.length >= 1 && compact.length <= 180
    && !/[|_`~]|繝ｼ繝ｼ/u.test(value)
    && !/^[縲ゅ・.]/u.test(compact)
    && !/^[\u30f3\u30f5\u30f6\u30a7\u30a3\u30a9\u30c3\u30e3\u30e5\u30e7\u30cb]/u.test(compact);
}

function validChoices(choices: Choice[]) {
  return choices.length === 4 && choices.every((choice, index) => choice.key === KEYS[index]
    && choice.order === index && safeChoice(choice.textJa))
    && !choices.every((choice) => /^[A-Za-z]$/u.test(choice.textJa.trim()));
}

async function main() {
  const current = JSON.parse(await readFile(join(ROOT, "storage/review/pending-review-candidates.json"), "utf8")) as Candidate[];
  const inventory = JSON.parse(await readFile(join(ROOT, "storage/review/pending-current-inventory.json"), "utf8")) as { pendingByRiskIds: Record<string, string[]> };
  const pending = new Set(inventory.pendingByRiskIds.P1 ?? []);
  const output: Candidate[] = [];

  for (const old of current.filter((candidate) => pending.has(candidate.id)
    && candidate.risk === "P1"
    && candidate.issues.length === 1 && candidate.issues[0] === "mapping_review"
    && candidate.mappingStatus === "REVIEW_REQUIRED"
    && candidate.parseConfidence >= 0.9
    && candidate.bodyJa.trim().length >= 20
    && /^[ABCD]$/u.test(candidate.correctAnswer)
    && existsSync(join(ROOT, "storage/review/pages", `${candidate.session}-p${candidate.sourcePage}.png`)))) {
    const variants: Candidate[] = [];
    for (const dir of sourceDirs(old.session)) {
      try {
        const report = JSON.parse(await readFile(join(ROOT, "storage", dir, `${old.session}.json`), "utf8")) as { candidates: Candidate[] };
        const variant = report.candidates.find((candidate) => candidate.id === old.id);
        if (variant && variant.parseConfidence >= 0.85 && validChoices(variant.choices) && variant.bodyJa.trim().length >= 20 && variant.correctAnswer === old.correctAnswer) variants.push(variant);
      } catch {}
    }
    const fingerprints = new Map<string, { count: number; candidate: Candidate }>();
    for (const variant of variants) {
      const fingerprint = variant.choices.map((choice) => normalize(cleanChoice(choice.textJa) ?? choice.textJa)).join("|");
      const entry = fingerprints.get(fingerprint);
      fingerprints.set(fingerprint, { count: (entry?.count ?? 0) + 1, candidate: entry?.candidate ?? variant });
    }
    const best = [...fingerprints.values()].sort((left, right) => right.count - left.count)[0];
    const minimum = old.session.startsWith("2020") ? 2 : 3;
    if (!best || best.count < minimum) continue;
    output.push({ ...best.candidate, id: old.id, correctAnswer: old.correctAnswer, risk: old.risk, duplicate: false, autoApprove: false, mappingStatus: "CLEAN", needsVisualReview: false, choices: best.candidate.choices.map((choice) => ({ ...choice, textJa: cleanChoice(choice.textJa) ?? choice.textJa })) });
  }

  const outputFile = "storage/review/pending-review-p1-mapping-pilot.json";
  await writeFile(join(ROOT, outputFile), JSON.stringify(output, null, 2), "utf8");
  console.log(JSON.stringify({ output: outputFile, selected: output.length, ids: output.map((candidate) => candidate.id) }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
