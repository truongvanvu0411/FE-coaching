import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type Group = { candidates: { id: string; db?: { verified?: boolean; reviewStatus?: string } }[] };
async function main() {
  const publish = process.argv.includes("--apply");
  const groups = JSON.parse(await readFile("storage/review/pending-review-duplicate-groups.json", "utf8")) as Group[];
  const pairs = groups.flatMap((group) => {
    const canonical = group.candidates.find((candidate) => candidate.db?.verified);
    return canonical
      ? group.candidates
        .filter((candidate) => !candidate.db?.verified && candidate.db?.reviewStatus === "PENDING_REVIEW")
        .map((candidate) => ({ id: candidate.id, duplicateOfId: canonical.id }))
      : [];
  });
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const rows = await prisma.question.findMany({ where: { id: { in: pairs.map((pair) => pair.id) } }, select: { id: true, sourceType: true, reviewStatus: true, verified: true, isObsolete: true } });
    if (rows.length !== pairs.length || rows.some((row) => row.sourceType !== "IPA_EXEMPTION" || row.reviewStatus !== "PENDING_REVIEW" || row.verified || !row.isObsolete)) throw new Error("Duplicate allowlist DB precondition failed.");
    if (!publish) { console.log(JSON.stringify({ mode: "dry-run", rows: pairs }, null, 2)); return; }
    await prisma.$transaction(pairs.map((pair) => prisma.question.update({ where: { id: pair.id }, data: { reviewStatus: "REJECTED", verified: false, isObsolete: true, duplicateOfId: pair.duplicateOfId, reviewedAt: new Date() } })));
    console.log(JSON.stringify({ mode: "apply", rejected: pairs.length, rows: pairs }, null, 2));
  } finally { await prisma.$disconnect(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
