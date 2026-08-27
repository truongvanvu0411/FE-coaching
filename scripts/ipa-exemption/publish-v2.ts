import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const EXPECTED_SOURCE = "IPA_EXEMPTION" as const;
const EXPECTED_KEYS = ["A", "B", "C", "D"];

async function main() {
  if (!process.argv.includes("--publish")) {
    throw new Error("This command is guarded. Pass --publish to publish IPA_EXEMPTION questions.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

  const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) });
  try {
    const questions = await prisma.question.findMany({
      where: { sourceType: EXPECTED_SOURCE },
      select: {
        id: true,
        bodyJa: true,
        correctAnswer: true,
        choices: { select: { key: true, order: true, textJa: true }, orderBy: { order: "asc" } },
        ingestJob: { select: { status: true } },
      },
    });

    if (!questions.length) throw new Error("No IPA_EXEMPTION questions found; refusing to publish.");
    const invalid = questions.filter((question) => {
      const validChoices = question.choices.length === 4
        && question.choices.every((choice, index) => choice.key === EXPECTED_KEYS[index]
          && choice.order === index
          && choice.textJa.trim().length > 0);
      return question.bodyJa.trim().length < 10
        || !/^[ABCD]$/u.test(question.correctAnswer)
        || !validChoices
        || question.ingestJob?.status !== "PARSED";
    });
    if (invalid.length) {
      throw new Error(`Refusing to publish: ${invalid.length} IPA questions failed integrity checks.`);
    }

    const result = await prisma.question.updateMany({
      where: { sourceType: EXPECTED_SOURCE },
      data: {
        reviewStatus: "VERIFIED",
        verified: true,
        isObsolete: false,
      },
    });
    console.log(`Published ${result.count} IPA_EXEMPTION questions.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
