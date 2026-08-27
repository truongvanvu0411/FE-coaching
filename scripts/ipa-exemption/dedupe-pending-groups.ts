import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type Group = { candidates: { id: string; db?: { verified?: boolean; reviewStatus?: string; createdAt?: string } }[] };
async function main() {
  const apply = process.argv.includes("--apply");
  const groups = JSON.parse(await readFile("storage/review/pending-review-duplicate-groups.json", "utf8")) as Group[];
  const pairs = groups.flatMap((group) => {
    const sorted = [...group.candidates].sort((a, b) => Number(Boolean(b.db?.verified)) - Number(Boolean(a.db?.verified)) || new Date(a.db?.createdAt ?? 0).getTime() - new Date(b.db?.createdAt ?? 0).getTime());
    const canonical = sorted[0];
    return canonical ? sorted.slice(1).filter((candidate) => candidate.db?.reviewStatus === "PENDING_REVIEW" && !candidate.db?.verified).map((candidate) => ({ id: candidate.id, duplicateOfId: canonical.id })) : [];
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const rows = await prisma.question.findMany({ where: { id: { in: pairs.map((pair) => pair.id) } }, select: { id: true, sourceType: true, reviewStatus: true, verified: true, isObsolete: true } });
    if (rows.length !== pairs.length || rows.some((row) => row.sourceType !== "IPA_EXEMPTION" || row.reviewStatus !== "PENDING_REVIEW" || row.verified || !row.isObsolete)) throw new Error("Pending duplicate DB precondition failed.");
    if (!apply) { console.log(JSON.stringify({ mode: "dry-run", rejectCount: pairs.length, keepCount: groups.length, rows: pairs }, null, 2)); return; }
    await prisma.$transaction(pairs.map((pair) => prisma.question.update({ where: { id: pair.id }, data: { reviewStatus: "REJECTED", verified: false, isObsolete: true, duplicateOfId: pair.duplicateOfId, reviewedAt: new Date() } })));
    console.log(JSON.stringify({ mode: "apply", rejected: pairs.length, keptCanonicalGroups: groups.length }, null, 2));
  } finally { await prisma.$disconnect(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
