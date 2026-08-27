import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type Candidate = { id: string; session: string; sourcePage: string; questionNumber: string; bodyJa: string; choices: { key: string; order: number; textJa: string }[]; correctAnswer: string; mappingStatus: string; parseConfidence: number; needsVisualReview: boolean; manualVisualOverride?: boolean };
const ROOT = process.cwd();
const SESSIONS = ["2020-06", "2020-07"];

async function main() {
  const byId = new Map<string, Candidate>();
  for (const session of SESSIONS) {
    const report = JSON.parse(await readFile(join(ROOT, "storage", "ipa-exemption", "candidates-v4-merged", `${session}.json`), "utf8")) as { candidates: Candidate[] };
    for (const candidate of report.candidates) byId.set(candidate.id, candidate);
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const rows = await prisma.question.findMany({ where: { id: { in: [...byId.keys()] }, reviewStatus: "PENDING_REVIEW" }, select: { id: true } });
    const eligible = rows.map((row) => byId.get(row.id)).filter((candidate): candidate is Candidate => Boolean(candidate)).filter((candidate) => candidate.mappingStatus === "CLEAN" && candidate.parseConfidence >= 0.9 && !candidate.needsVisualReview && candidate.choices.length === 4 && candidate.choices.every((choice, index) => choice.key === ["A", "B", "C", "D"][index] && choice.order === index && choice.textJa.trim().length > 0) && candidate.bodyJa.trim().length >= 20 && /^[ABCD]$/u.test(candidate.correctAnswer)).map((candidate) => ({ ...candidate, risk: "P2", autoApprove: true, duplicate: false, issues: [] }));
    await writeFile(join(ROOT, "storage", "review", "pending-review-v4-auto-approve.json"), JSON.stringify(eligible, null, 2), "utf8");
    console.log(JSON.stringify({ pendingPilot: rows.length, eligible: eligible.length, ids: eligible.map((candidate) => candidate.id) }, null, 2));
  } finally { await prisma.$disconnect(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
