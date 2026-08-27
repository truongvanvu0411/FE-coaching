import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const OUTPUT = join(process.cwd(), "storage", "ipa-exemption", "snapshots", "batch1-before-v2.jsonl");

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });
  try {
    const questions = await prisma.question.findMany({
      where: { sourceType: "IPA_EXEMPTION" },
      include: { choices: true, topic: true },
      orderBy: { id: "asc" },
    });
    await mkdir(join(process.cwd(), "storage", "ipa-exemption", "snapshots"), { recursive: true });
    const lines = questions.map((question) => JSON.stringify({
      id: question.id,
      section: question.section,
      year: question.year,
      sourceType: question.sourceType,
      sourceUrl: question.sourceUrl,
      sourcePage: question.sourcePage,
      questionNumber: question.questionNumber,
      topicId: question.topicId,
      topicNameJa: question.topic.nameJa,
      difficulty: question.difficulty,
      bodyJa: question.bodyJa,
      choices: question.choices.sort((a, b) => a.order - b.order).map((choice) => ({
        key: choice.key,
        order: choice.order,
        textJa: choice.textJa,
      })),
      correctAnswer: question.correctAnswer,
      verified: question.verified,
      reviewStatus: question.reviewStatus,
      ingestJobId: question.ingestJobId,
    }));
    await writeFile(OUTPUT, `${lines.join("\n")}\n`, "utf8");
    console.log(`Snapshot written: ${questions.length} questions -> ${OUTPUT}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
