import "dotenv/config";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type Choice = { key: string; order: number; textJa: string };
type Candidate = {
  id: string;
  session: string;
  sourceUrl: string;
  sourcePage: string;
  questionNumber: string;
  bodyJa: string;
  choices: Choice[];
  correctAnswer: string;
  mappingStatus: "CLEAN" | "REVIEW_REQUIRED" | "OCR_FAILED";
  parseConfidence: number;
  needsVisualReview: boolean;
  manualVisualOverride?: boolean;
};

const ROOT = process.cwd();
const SOURCES = [
  { name: "legacy-2020", dir: join(ROOT, "storage", "ipa-exemption", "candidates-v4-merged"), sessions: ["2020-06", "2020-07"] },
  { name: "classic-2014", dir: join(ROOT, "storage", "ipa-classic", "candidates-v4-merged-2014"), sessions: ["2014-autumn", "2014-spring"] },
  { name: "classic-2015-2019", dir: join(ROOT, "storage", "ipa-classic", "candidates-v4-merged"), sessions: ["2015-autumn", "2015-spring", "2016-autumn", "2016-spring", "2017-autumn", "2017-spring", "2018-autumn", "2018-spring", "2019-autumn", "2019-spring"] },
];
const OUTPUT = join(ROOT, "storage", "review");

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/gu, " ").replace(/[^\p{L}\p{N} ]/gu, "").trim();
}

function fingerprint(candidate: Candidate) {
  const text = [candidate.bodyJa, ...candidate.choices.map((choice) => choice.textJa)].map(normalize).join("|");
  return createHash("sha256").update(text).digest("hex");
}

function review(candidate: Candidate) {
  const issues: string[] = [];
  const sourceImage = join(OUTPUT, "pages", `${candidate.session}-p${candidate.sourcePage}.png`);
  const keys = ["A", "B", "C", "D"];
  if (candidate.bodyJa.trim().length < 20) issues.push("short_body");
  if (candidate.choices.length !== 4) issues.push("choice_count");
  if (candidate.choices.some((choice, index) => choice.key !== keys[index] || choice.order !== index)) issues.push("choice_order");
  // Short choices are valid for numeric/symbolic questions. Only an empty
  // choice is structurally unsafe; visual issues are tracked separately.
  if (candidate.choices.some((choice) => !choice.textJa.trim())) issues.push("short_choice");
  if (!/^[ABCD]$/u.test(candidate.correctAnswer)) issues.push("invalid_answer");
  if (candidate.mappingStatus === "OCR_FAILED") issues.push("ocr_failed");
  if (candidate.mappingStatus === "REVIEW_REQUIRED") issues.push("mapping_review");
  if (candidate.needsVisualReview && !candidate.manualVisualOverride) issues.push("visual_review");
  if (candidate.parseConfidence < 0.9) issues.push("low_confidence");
  if (!existsSync(sourceImage)) issues.push("missing_source_page");
  const hasP0 = issues.some((issue) => ["choice_count", "choice_order", "short_choice", "invalid_answer", "ocr_failed", "missing_source_page"].includes(issue));
  const hasP1 = issues.some((issue) => ["mapping_review", "visual_review", "short_body", "low_confidence"].includes(issue));
  const risk = hasP0 ? "P0" : hasP1 ? "P1" : "P2";
  const autoApprove = risk === "P2" && candidate.mappingStatus === "CLEAN" && candidate.parseConfidence >= 0.9;
  return { issues: [...new Set(issues)], risk, autoApprove, fingerprint: fingerprint(candidate) };
}

async function loadCandidates() {
  const all: Candidate[] = [];
  for (const source of SOURCES) {
    for (const session of source.sessions) {
      const report = JSON.parse(await readFile(join(source.dir, `${session}.json`), "utf8")) as { candidates: Candidate[] };
      all.push(...report.candidates);
    }
  }
  return all;
}

async function main() {
  await mkdir(OUTPUT, { recursive: true });
  const candidates = await loadCandidates();
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  let dbRows = 0;
  let dbPending = 0;
  let importedIds = new Set<string>();
  try {
    const ids = candidates.map((candidate) => candidate.id);
    const rows = await prisma.question.findMany({ where: { id: { in: ids } }, select: { id: true, reviewStatus: true, verified: true, isObsolete: true } });
    dbRows = rows.length;
    dbPending = rows.filter((row) => row.reviewStatus === "PENDING_REVIEW" && !row.verified && row.isObsolete).length;
    importedIds = new Set(rows.map((row) => row.id));
  } finally { await prisma.$disconnect(); }

  const importedCandidates = candidates.filter((candidate) => importedIds.has(candidate.id));
  const byFingerprint = new Map<string, Candidate[]>();
  for (const candidate of importedCandidates) {
    const key = fingerprint(candidate);
    const list = byFingerprint.get(key) ?? [];
    list.push(candidate);
    byFingerprint.set(key, list);
  }
  const duplicateIds = new Set([...byFingerprint.values()].filter((list) => list.length > 1).flat().map((candidate) => candidate.id));
  const reviewed = importedCandidates.map((candidate) => ({ ...candidate, ...review(candidate), duplicate: duplicateIds.has(candidate.id) }));
  for (const candidate of reviewed) if (candidate.duplicate) { candidate.issues.push("duplicate"); candidate.risk = "P0"; candidate.autoApprove = false; }

  const summary = {
    generatedAt: new Date().toISOString(),
    candidateCount: reviewed.length,
    dbRows,
    dbPending,
    answerCoverage: `${reviewed.filter((candidate) => /^[ABCD]$/u.test(candidate.correctAnswer)).length}/${reviewed.length}`,
    sourcePageCoverage: `${reviewed.filter((candidate) => !candidate.issues.includes("missing_source_page")).length}/${reviewed.length}`,
    risk: Object.fromEntries(["P0", "P1", "P2"].map((risk) => [risk, reviewed.filter((candidate) => candidate.risk === risk).length])),
    autoApprove: reviewed.filter((candidate) => candidate.autoApprove).length,
    duplicates: duplicateIds.size,
    issueCounts: Object.fromEntries([...new Set(reviewed.flatMap((candidate) => candidate.issues))].sort().map((issue) => [issue, reviewed.filter((candidate) => candidate.issues.includes(issue)).length])),
    bySession: Object.fromEntries([...new Set(reviewed.map((candidate) => candidate.session))].sort().map((session) => [session, { total: reviewed.filter((candidate) => candidate.session === session).length, p0: reviewed.filter((candidate) => candidate.session === session && candidate.risk === "P0").length, p1: reviewed.filter((candidate) => candidate.session === session && candidate.risk === "P1").length, autoApprove: reviewed.filter((candidate) => candidate.session === session && candidate.autoApprove).length }])),
  };
  await writeFile(join(OUTPUT, "pending-review-summary.json"), JSON.stringify(summary, null, 2), "utf8");
  await writeFile(join(OUTPUT, "pending-review-candidates.json"), JSON.stringify(reviewed, null, 2), "utf8");
  await writeFile(join(OUTPUT, "pending-review-auto-approve.json"), JSON.stringify(reviewed.filter((candidate) => candidate.autoApprove), null, 2), "utf8");
  await writeFile(join(OUTPUT, "pending-review-p0.json"), JSON.stringify(reviewed.filter((candidate) => candidate.risk === "P0"), null, 2), "utf8");
  await writeFile(join(OUTPUT, "pending-review-p1.json"), JSON.stringify(reviewed.filter((candidate) => candidate.risk === "P1"), null, 2), "utf8");
  await writeFile(join(OUTPUT, "pending-review-duplicates.json"), JSON.stringify(reviewed.filter((candidate) => candidate.duplicate), null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
