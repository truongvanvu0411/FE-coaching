import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type Candidate = { id: string; fingerprint: string; session: string; questionNumber: string; duplicate?: boolean };
async function main() {
  const candidates = JSON.parse(await readFile("storage/review/pending-review-candidates.json", "utf8")) as Candidate[];
  const groups = new Map<string, Candidate[]>();
  for (const candidate of candidates.filter((candidate) => candidate.duplicate)) {
    const list = groups.get(candidate.fingerprint) ?? [];
    list.push(candidate);
    groups.set(candidate.fingerprint, list);
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const ids = [...groups.values()].flat().map((candidate) => candidate.id);
    const rows = await prisma.question.findMany({ where: { id: { in: ids } }, select: { id: true, reviewStatus: true, verified: true, isObsolete: true, createdAt: true } });
    const byId = new Map(rows.map((row) => [row.id, row]));
    const report = [...groups.entries()].map(([fingerprint, group]) => ({ fingerprint, candidates: group.map((candidate) => ({ ...candidate, db: byId.get(candidate.id) ?? null })).sort((a, b) => Number(Boolean(byId.get(b.id)?.verified)) - Number(Boolean(byId.get(a.id)?.verified)) || (byId.get(a.id)?.createdAt.getTime() ?? 0) - (byId.get(b.id)?.createdAt.getTime() ?? 0)) }));
    await writeFile("storage/review/pending-review-duplicate-groups.json", JSON.stringify(report, null, 2), "utf8");
    console.log(JSON.stringify({ groups: report.length, candidates: ids.length, groupsWithVerifiedCanonical: report.filter((group) => group.candidates.some((candidate) => candidate.db?.verified)).length, groupsAllPending: report.filter((group) => group.candidates.every((candidate) => candidate.db?.reviewStatus === "PENDING_REVIEW")).length }, null, 2));
  } finally { await prisma.$disconnect(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
