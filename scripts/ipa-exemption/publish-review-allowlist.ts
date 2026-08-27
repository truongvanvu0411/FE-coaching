import "dotenv/config";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type Candidate = {
  id: string;
  session: string;
  sourcePage: string;
  mappingStatus: string;
  parseConfidence: number;
  needsVisualReview: boolean;
  duplicate?: boolean;
  autoApprove: boolean;
  risk: string;
  choices: { key: string; order: number; textJa: string }[];
  correctAnswer: string;
};

const ROOT = process.cwd();
const ALLOWLIST = process.env.REVIEW_ALLOWLIST ? join(ROOT, process.env.REVIEW_ALLOWLIST) : join(ROOT, "storage", "review", "pending-review-auto-approve.json");
const EXPECTED_KEYS = ["A", "B", "C", "D"];
const ALLOW_P0_CANONICAL = process.env.ALLOW_P0_CANONICAL === "1";
const ALLOW_P1_CONSENSUS = process.env.ALLOW_P1_CONSENSUS === "1";
const ALLOW_P1_MAPPING_CONSENSUS = process.env.ALLOW_P1_MAPPING_CONSENSUS === "1";

async function main() {
  const publish = process.argv.includes("--publish");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const candidates = JSON.parse(await readFile(ALLOWLIST, "utf8")) as Candidate[];
  const invalidCandidate = candidates.filter((candidate) => {
    const choicesOk = candidate.choices.length === 4
      && candidate.choices.every((choice, index) => choice.key === EXPECTED_KEYS[index]
        && choice.order === index && choice.textJa.trim().length > 0);
    const sourceOk = existsSync(join(ROOT, "storage", "review", "pages", `${candidate.session}-p${candidate.sourcePage}.png`));
    const p2Approved = candidate.risk === "P2" && candidate.autoApprove && candidate.mappingStatus === "CLEAN"
      && candidate.parseConfidence >= 0.9 && !candidate.needsVisualReview && !candidate.duplicate;
    const p0CanonicalApproved = ALLOW_P0_CANONICAL && candidate.risk === "P0" && candidate.duplicate
      && candidate.mappingStatus === "CLEAN" && candidate.parseConfidence >= 0.95 && !candidate.needsVisualReview;
    const p1ConsensusApproved = ALLOW_P1_CONSENSUS && candidate.risk === "P1" && !candidate.duplicate
      && candidate.mappingStatus === "CLEAN" && candidate.parseConfidence >= 0.85 && !candidate.needsVisualReview;
    const p1MappingConsensusApproved = ALLOW_P1_MAPPING_CONSENSUS && candidate.risk === "P1" && !candidate.duplicate
      && candidate.mappingStatus === "REVIEW_REQUIRED" && candidate.parseConfidence >= 0.82 && !candidate.needsVisualReview;
    return !(p2Approved || p0CanonicalApproved || p1ConsensusApproved || p1MappingConsensusApproved)
      || !/^[ABCD]$/u.test(candidate.correctAnswer) || !choicesOk || !sourceOk;
  });
  if (invalidCandidate.length) throw new Error(`Allowlist integrity failed for ${invalidCandidate.length} candidates.`);

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const ids = candidates.map((candidate) => candidate.id);
    const rows = await prisma.question.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        sourceType: true,
        reviewStatus: true,
        verified: true,
        isObsolete: true,
        choices: { select: { key: true, order: true, textJa: true }, orderBy: { order: "asc" } },
      },
    });
    const byId = new Map(rows.map((row) => [row.id, row]));
    const invalidRows = candidates.filter((candidate) => {
      const row = byId.get(candidate.id);
      return !row || row.sourceType !== "IPA_EXEMPTION" || row.reviewStatus !== "PENDING_REVIEW"
        || row.verified || !row.isObsolete || row.choices.length !== 4
        || row.choices.some((choice, index) => choice.key !== EXPECTED_KEYS[index] || choice.order !== index || !choice.textJa.trim());
    });
    if (invalidRows.length) throw new Error(`DB integrity failed for ${invalidRows.length} allowlisted rows.`);

    if (!publish) {
      console.log(JSON.stringify({ mode: "dry-run", allowlist: candidates.length, dbRows: rows.length, pending: rows.filter((row) => row.reviewStatus === "PENDING_REVIEW").length }, null, 2));
      return;
    }
    const result = await prisma.question.updateMany({
      where: { id: { in: ids }, sourceType: "IPA_EXEMPTION", reviewStatus: "PENDING_REVIEW", verified: false, isObsolete: true },
      data: { reviewStatus: "VERIFIED", verified: true, isObsolete: false, reviewedAt: new Date() },
    });
    if (result.count !== candidates.length) throw new Error(`Scoped publish updated ${result.count}/${candidates.length}; refusing partial success.`);
    console.log(JSON.stringify({ mode: "publish", published: result.count }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
