import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type Candidate = { id: string; session: string; risk: string; issues: string[]; mappingStatus: string; parseConfidence: number; choices: { textJa: string }[]; needsVisualReview: boolean };
async function main() {
  const candidates = JSON.parse(await readFile("storage/review/pending-review-candidates.json", "utf8")) as Candidate[];
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const rows = await prisma.question.findMany({ where: { id: { in: candidates.map((candidate) => candidate.id) } }, select: { id: true, reviewStatus: true, verified: true, isObsolete: true } });
    const pending = new Set(rows.filter((row) => row.reviewStatus === "PENDING_REVIEW" && !row.verified && row.isObsolete).map((row) => row.id));
    const current = candidates.filter((candidate) => pending.has(candidate.id));
    const byRisk = Object.fromEntries(["P0", "P1", "P2"].map((risk) => [risk, current.filter((candidate) => candidate.risk === risk).length]));
    const issueCounts: Record<string, number> = {};
    for (const candidate of current) for (const issue of candidate.issues) issueCounts[issue] = (issueCounts[issue] ?? 0) + 1;
    const bySession = Object.fromEntries([...new Set(current.map((candidate) => candidate.session))].sort().map((session) => [session, current.filter((candidate) => candidate.session === session).length]));
    const pendingByRiskIds = Object.fromEntries(["P0", "P1", "P2"].map((risk) => [risk, current.filter((candidate) => candidate.risk === risk).map((candidate) => candidate.id)]));
    const report = { generatedAt: new Date().toISOString(), pending: current.length, byRisk, issueCounts, bySession, pendingByRiskIds };
    await writeFile("storage/review/pending-current-inventory.json", JSON.stringify(report, null, 2), "utf8");
    console.log(JSON.stringify(report, null, 2));
  } finally { await prisma.$disconnect(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
