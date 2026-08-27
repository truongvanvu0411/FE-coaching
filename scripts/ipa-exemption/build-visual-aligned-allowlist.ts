import "dotenv/config";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Choice = { key: string; order: number; textJa: string };
type Candidate = { id: string; session: string; sourcePage: string; questionNumber?: string; bodyJa: string; choices: Choice[]; correctAnswer: string; mappingStatus: string; parseConfidence: number; needsVisualReview: boolean; duplicate?: boolean; risk?: string; issues?: string[]; autoApprove?: boolean };
const root = process.cwd();

function normalize(value: string) { return value.toLowerCase().replace(/\s+/gu, "").replace(/[^\p{L}\p{N}]/gu, ""); }
function similarity(left: string, right: string) {
  const a = normalize(left); const b = normalize(right); if (!a || !b) return 0;
  const grams = (value: string) => new Set([...value].map((_, index) => value.slice(index, index + 2)).filter((gram) => gram.length === 2));
  const ag = grams(a); const bg = grams(b); let intersection = 0; for (const gram of ag) if (bg.has(gram)) intersection += 1;
  return (2 * intersection) / (ag.size + bg.size);
}
function validChoice(value: string) {
  const compact = value.replace(/\s+/gu, "");
  return compact.length >= 1 && compact.length <= 180 && !/[|_`~]|ーー/u.test(value) && !/^[-。、,.]/u.test(compact);
}

async function main() {
  const batchFile = process.env.ALIGN_BATCH_FILE ?? process.env.VISUAL_BATCH_FILE!;
  const candidatesDir = process.env.ALIGN_CANDIDATES_DIR ?? process.env.VISUAL_CANDIDATES_DIR!;
  const outputFile = process.env.ALIGN_ALLOWLIST_OUTPUT ?? process.env.VISUAL_ALLOWLIST_OUTPUT!;
  const requiredIssue = process.env.ALIGN_ISSUE ?? "visual_review";
  const excludedIssues = new Set((process.env.ALIGN_EXCLUDE_ISSUES ?? "").split(",").map((value) => value.trim()).filter(Boolean));
  const minScore = Number(process.env.ALIGN_MIN_SCORE ?? "0.65");
  const minMargin = Number(process.env.ALIGN_MIN_MARGIN ?? "0.08");
  const questionNumberOnly = process.env.ALIGN_QUESTION_NUMBER === "1";
  const requestedSessions = new Set((process.env.ALIGN_SESSIONS ?? "").split(",").map((value) => value.trim()).filter(Boolean));
  const batch = JSON.parse(await readFile(join(root, batchFile), "utf8")) as { bySession: Record<string, { ids: string[] }> };
  const current = JSON.parse(await readFile(join(root, "storage/review/pending-review-candidates.json"), "utf8")) as Candidate[];
  const inventory = JSON.parse(await readFile(join(root, "storage/review/pending-current-inventory.json"), "utf8")) as { pendingByRiskIds: Record<string, string[]> };
  const pending = new Set([...inventory.pendingByRiskIds.P0 ?? [], ...inventory.pendingByRiskIds.P1 ?? []]);
  const selectedIds = new Set(Object.entries(batch.bySession).filter(([session]) => requestedSessions.size === 0 || requestedSessions.has(session)).flatMap(([, value]) => value.ids));
  const bySession = new Map<string, Candidate[]>();
  for (const session of Object.keys(batch.bySession).filter((value) => requestedSessions.size === 0 || requestedSessions.has(value))) {
    const report = JSON.parse(await readFile(join(root, candidatesDir, `${session}.json`), "utf8")) as { candidates: Candidate[] };
    bySession.set(session, report.candidates);
  }
  const output: Candidate[] = [];
  for (const old of current.filter((candidate) => selectedIds.has(candidate.id)
    && pending.has(candidate.id)
    && candidate.issues?.includes(requiredIssue)
    && ![...excludedIssues].some((issue) => candidate.issues?.includes(issue)))) {
    const fresh = (bySession.get(old.session) ?? [])
      .filter((candidate) => candidate.sourcePage === old.sourcePage
        && (!questionNumberOnly || candidate.questionNumber === old.questionNumber)
        && candidate.mappingStatus === "CLEAN" && !candidate.needsVisualReview && candidate.parseConfidence >= 0.85)
      .map((candidate) => ({ candidate, score: similarity(old.bodyJa, candidate.bodyJa) }))
      .sort((a, b) => b.score - a.score);
    const best = fresh[0];
    const second = fresh[1];
    if (!best || (!questionNumberOnly && (best.score < minScore || (second && best.score - second.score < minMargin)))) continue;
    if (best.candidate.bodyJa.trim().length < 20 || best.candidate.choices.length !== 4 || best.candidate.choices.some((choice, index) => choice.key !== ["A", "B", "C", "D"][index] || choice.order !== index || !validChoice(choice.textJa))) continue;
    if (!existsSync(join(root, "storage/review/pages", `${old.session}-p${old.sourcePage}.png`))) continue;
    // Keep the old ID and authoritative answer; only replace body/choices from the aligned OCR candidate.
    output.push({ ...best.candidate, id: old.id, correctAnswer: old.correctAnswer, risk: old.risk, duplicate: old.duplicate, autoApprove: false });
  }
  await writeFile(join(root, outputFile), JSON.stringify(output, null, 2), "utf8");
  console.log(JSON.stringify({ output: outputFile, selected: output.length, ids: output.map((candidate) => candidate.id) }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
