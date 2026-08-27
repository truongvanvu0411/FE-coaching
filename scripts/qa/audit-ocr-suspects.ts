import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { prisma } from "../../src/lib/prisma";

const explicitArtifacts = [
  /適切な(?:ゃ|もゃ)/u,
  /分割さまれ/u,
  /許可しレ/u,
  /すずる/u,
  /データ烈/u,
  /サーパバ/u,
  /[ァヵ]log/u,
  /るる/u,
  /タタスク/u,
  /とするる/u,
];

function reasons(value: string) {
  const found: string[] = [];
  for (const pattern of explicitArtifacts) if (pattern.test(value)) found.push(pattern.source);
  if (value.includes("�")) found.push("replacement_character");
  return found;
}

async function main() {
  const questions = await prisma.question.findMany({
    where: { verified: true, reviewStatus: "VERIFIED", isObsolete: false },
    orderBy: { id: "asc" },
    select: { id: true, sourceType: true, year: true, bodyJa: true, choices: { orderBy: { order: "asc" }, select: { key: true, textJa: true } } },
  });
  const rows = questions.flatMap((question) => {
    const fields = [{ field: "bodyJa", value: question.bodyJa }, ...question.choices.map((choice) => ({ field: `choice:${choice.key}`, value: choice.textJa }))];
    const hits = fields.flatMap((item) => reasons(item.value).map((reason) => ({ field: item.field, reason, excerpt: item.value.slice(0, 600) })));
    return hits.length ? [{ id: question.id, sourceType: question.sourceType, year: question.year, hits }] : [];
  });
  const report = { generatedAt: new Date().toISOString(), eligibleQuestions: questions.length, suspectQuestions: rows.length, suspectFields: rows.reduce((sum, row) => sum + row.hits.length, 0), rows };
  await mkdir("storage/review", { recursive: true });
  await writeFile("storage/review/eligible-ocr-suspects.json", JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({ ...report, rows: rows.slice(0, 30) }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
