import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type Candidate = { id: string; session: string; sourcePage: string; questionNumber: string; bodyJa: string; choices: { key: string; order: number; textJa: string }[]; correctAnswer: string; mappingStatus: string; parseConfidence: number; needsVisualReview: boolean; manualVisualOverride?: boolean };
const ROOT = process.cwd();
const CANDIDATES_DIR = process.env.CLASSIC_CANDIDATES_DIR ?? "candidates-v2";
const SESSIONS = ["2015-autumn", "2015-spring", "2016-autumn", "2016-spring", "2017-autumn", "2017-spring", "2018-autumn", "2018-spring", "2019-autumn", "2019-spring"];

async function main() {
  const artifact = JSON.parse(await readFile(join(ROOT, "storage", "review", "pending-review-candidates.json"), "utf8")) as { id: string; duplicate?: boolean }[];
  const duplicateIds = new Set(artifact.filter((row) => row.duplicate).map((row) => row.id));
  const candidates: Candidate[] = [];
  for (const session of SESSIONS) {
    const report = JSON.parse(await readFile(join(ROOT, "storage", "ipa-classic", CANDIDATES_DIR, `${session}.json`), "utf8")) as { candidates: Candidate[] };
    candidates.push(...report.candidates);
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const rows = await prisma.question.findMany({ where: { id: { in: candidates.map((candidate) => candidate.id) }, reviewStatus: "PENDING_REVIEW" }, select: { id: true } });
    const eligible = candidates.filter((candidate) => rows.some((row) => row.id === candidate.id) && !duplicateIds.has(candidate.id) && candidate.mappingStatus === "CLEAN" && candidate.parseConfidence >= 0.9 && !candidate.needsVisualReview && candidate.choices.length === 4 && candidate.choices.every((choice, index) => choice.key === ["A", "B", "C", "D"][index] && choice.order === index && choice.textJa.trim().length > 0) && candidate.bodyJa.trim().length >= 20 && /^[ABCD]$/u.test(candidate.correctAnswer) && existsSync(join(ROOT, "storage", "review", "pages", `${candidate.session}-p${candidate.sourcePage}.png`))).map((candidate) => ({ ...candidate, risk: "P2", autoApprove: true, duplicate: false, issues: [] }));
    await writeFile(join(ROOT, "storage", "review", "pending-review-classic-auto-approve.json"), JSON.stringify(eligible, null, 2), "utf8");
    console.log(JSON.stringify({ pendingClassic: rows.length, eligible: eligible.length, bySession: Object.fromEntries(SESSIONS.map((session) => [session, eligible.filter((candidate) => candidate.session === session).length])) }, null, 2));
  } finally { await prisma.$disconnect(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
