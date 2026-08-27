import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const sessions = ["2014-autumn", "2014-spring", "2015-autumn", "2015-spring", "2016-autumn", "2016-spring", "2017-autumn", "2017-spring", "2018-autumn", "2018-spring", "2019-autumn", "2019-spring"];
  const rows = await prisma.question.findMany({
    where: { id: { startsWith: "FE-A-EXEMPTION-20" }, year: { gte: 2014, lte: 2019 } },
    include: { choices: true },
  });
  const perSession = Object.fromEntries(sessions.map((session) => {
    const selected = rows.filter((row) => row.id.includes(`-${session}-`));
    return [session, {
      count: selected.length,
      pending: selected.filter((row) => row.reviewStatus === "PENDING_REVIEW").length,
      verified: selected.filter((row) => row.verified).length,
      obsolete: selected.filter((row) => row.isObsolete).length,
      choice4: selected.filter((row) => row.choices.length === 4).length,
      body: selected.filter((row) => row.bodyJa.trim().length >= 10).length,
    }];
  }));
  const learnerEligible = await prisma.question.count({ where: { verified: true, reviewStatus: "VERIFIED", isObsolete: false } });
  console.log(JSON.stringify({ total: rows.length, perSession, learnerEligible }, null, 2));
}

main().finally(() => prisma.$disconnect());
