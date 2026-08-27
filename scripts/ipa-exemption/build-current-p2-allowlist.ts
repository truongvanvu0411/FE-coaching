import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const candidates = JSON.parse(await readFile("storage/review/pending-review-candidates.json", "utf8")) as { id: string; risk: string; autoApprove: boolean }[];
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const ids = candidates.filter((candidate) => candidate.risk === "P2" && candidate.autoApprove).map((candidate) => candidate.id);
    const rows = await prisma.question.findMany({ where: { id: { in: ids }, reviewStatus: "PENDING_REVIEW" }, select: { id: true } });
    const eligible = candidates.filter((candidate) => rows.some((row) => row.id === candidate.id));
    const all = candidates.filter((candidate) => candidate.risk === "P2" && candidate.autoApprove);
    const full = JSON.parse(await readFile("storage/review/pending-review-candidates.json", "utf8")) as unknown[];
    await writeFile("storage/review/pending-review-current-p2.json", JSON.stringify(full.filter((candidate) => eligible.some((item) => item.id === (candidate as { id: string }).id)), null, 2), "utf8");
    console.log(JSON.stringify({ allAutoApprove: all.length, pendingEligible: eligible.length, ids: eligible.map((candidate) => candidate.id) }, null, 2));
  } finally { await prisma.$disconnect(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
