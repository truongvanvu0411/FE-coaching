import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const allIpa = await prisma.question.findMany({
    where: { sourceType: "IPA_EXEMPTION" },
    select: { id: true, sourceUrl: true, reviewStatus: true, verified: true, isObsolete: true },
  });
  const inventory = Object.fromEntries([...new Set(allIpa.map((row) => row.id.match(/(20\d{2}-\d{2})/)?.[1]).filter(Boolean))].sort().map((session) => {
    const rows = allIpa.filter((row) => row.id.includes(session!));
    return [session, { count: rows.length, pending: rows.filter((row) => row.reviewStatus === "PENDING_REVIEW").length, verified: rows.filter((row) => row.verified).length }];
  }));
  const rows = await prisma.question.findMany({
    where: { sourceType: "IPA_EXEMPTION", year: 2020 },
    select: {
      id: true,
      reviewStatus: true,
      verified: true,
      isObsolete: true,
      choices: true,
      bodyJa: true,
    },
  });
  const pilot = rows.filter((row) => row.id.includes("2020-06") || row.id.includes("2020-07"));
  const learnerEligible = await prisma.question.count({
    where: { verified: true, reviewStatus: "VERIFIED", isObsolete: false },
  });
  const jobs = await prisma.ingestJob.findMany({
    where: { id: { in: ["ipa-exemption-2020-06", "ipa-exemption-2020-07"] } },
    select: { id: true, status: true, fileName: true, sourceType: true, _count: { select: { questions: true } } },
  });
  const statuses = [...new Set(pilot.map((row) => row.reviewStatus))].map((status) => [
    status,
    pilot.filter((row) => row.reviewStatus === status).length,
  ]);
  console.log(JSON.stringify({
    pilotCount: pilot.length,
    reviewStatus: Object.fromEntries(statuses),
    verified: pilot.filter((row) => row.verified).length,
    obsolete: pilot.filter((row) => row.isObsolete).length,
    choice4: pilot.filter((row) => Array.isArray(row.choices) && row.choices.length === 4).length,
    body: pilot.filter((row) => row.bodyJa.trim().length > 0).length,
    learnerEligible,
    inventory,
    jobs,
  }, null, 2));
}

main().finally(() => prisma.$disconnect());
