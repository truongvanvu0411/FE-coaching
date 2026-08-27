import "dotenv/config";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type Candidate = { id: string; sourceUrl: string; sourcePage: string; questionNumber: string; bodyJa: string; correctAnswer: string; choices: { key: string; order: number; textJa: string }[] };
const ROOT = process.cwd();
const files = ["storage/review/pending-review-v4-auto-approve.json", "storage/review/pending-review-classic-auto-approve.json", "storage/review/pending-review-current-p2.json", "storage/review/pending-review-p0-canonical.json", "storage/review/pending-review-p1-consensus.json", "storage/review/pending-review-p1-mapping-consensus.json", "storage/review/pending-review-p1-mapping-pilot.json", "storage/review/pending-review-p1-visual-auto.json", "storage/review/pending-review-psm3-recovery.json"];

async function main() {
  const candidates = (await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(ROOT, file), "utf8")) as Candidate[]))).flat();
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const rows = await prisma.question.findMany({ where: { id: { in: candidates.map((candidate) => candidate.id) } }, select: { id: true, sourceType: true, reviewStatus: true, verified: true, isObsolete: true } });
    const byId = new Map(rows.map((row) => [row.id, row]));
    if (rows.length !== candidates.length || candidates.some((candidate) => { const row = byId.get(candidate.id); return !row || row.sourceType !== "IPA_EXEMPTION" || row.reviewStatus !== "VERIFIED" || !row.verified || row.isObsolete; })) throw new Error("Published allowlist sync precondition failed.");
    await prisma.$transaction(candidates.map((candidate) => prisma.question.update({ where: { id: candidate.id }, data: { sourceUrl: candidate.sourceUrl, sourcePage: candidate.sourcePage, questionNumber: candidate.questionNumber, bodyJa: candidate.bodyJa, correctAnswer: candidate.correctAnswer, choices: { deleteMany: {}, create: candidate.choices } } })));
    console.log(JSON.stringify({ synced: candidates.length }, null, 2));
  } finally { await prisma.$disconnect(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
