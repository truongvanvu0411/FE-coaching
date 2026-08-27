import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { prisma } from "../../src/lib/prisma";

type FieldIssue = {
  field: string;
  value: string;
  newlineCount: number;
  cjkSpaceCount: number;
  whitespaceCount: number;
  mojibake: boolean;
  controlChars: boolean;
  score: number;
};

const cjkBetweenSpace = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]\s+(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu;
const mojibake = /(?:縺|繧|蜿|莠|譁|逡|譁ｹ|繝|螟|莠)/u;
const controlChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u;

function inspect(field: string, value: string | null | undefined): FieldIssue | null {
  if (!value) return null;
  const newlineCount = (value.match(/\r?\n/g) ?? []).length;
  const cjkSpaceCount = (value.match(cjkBetweenSpace) ?? []).length;
  const whitespaceCount = (value.match(/\s/g) ?? []).length;
  const hasMojibake = mojibake.test(value);
  const hasControlChars = controlChars.test(value);
  const score =
    cjkSpaceCount * 2 +
    newlineCount * 3 +
    (hasMojibake ? 10 : 0) +
    (hasControlChars ? 10 : 0);
  if (score === 0) return null;
  return {
    field,
    value,
    newlineCount,
    cjkSpaceCount,
    whitespaceCount,
    mojibake: hasMojibake,
    controlChars: hasControlChars,
    score,
  };
}

async function main() {
  const questions = await prisma.question.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      section: true,
      year: true,
      sourceType: true,
      reviewStatus: true,
      verified: true,
      bodyJa: true,
      bodyVi: true,
      explanationJa: true,
      explanationVi: true,
      choices: { orderBy: { order: "asc" }, select: { key: true, textJa: true, textVi: true } },
    },
  });

  const rows = questions.flatMap((question) => {
    const issues: FieldIssue[] = [];
    for (const [field, value] of [
      ["bodyJa", question.bodyJa],
      ["bodyVi", question.bodyVi],
      ["explanationJa", question.explanationJa],
      ["explanationVi", question.explanationVi],
    ] as const) {
      const issue = inspect(field, value);
      if (issue) issues.push(issue);
    }
    for (const choice of question.choices) {
      const issue = inspect(`choice:${choice.key}:textJa`, choice.textJa);
      if (issue) issues.push(issue);
      const viIssue = inspect(`choice:${choice.key}:textVi`, choice.textVi);
      if (viIssue) issues.push(viIssue);
    }
    if (issues.length === 0) return [];
    return [{
      id: question.id,
      section: question.section,
      year: question.year,
      sourceType: question.sourceType,
      reviewStatus: question.reviewStatus,
      verified: question.verified,
      maxScore: Math.max(...issues.map((issue) => issue.score)),
      issues,
    }];
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    flaggedQuestions: rows.length,
    flaggedFields: rows.reduce((sum, row) => sum + row.issues.length, 0),
    categories: {
      cjkSpacing: rows.filter((row) => row.issues.some((issue) => issue.cjkSpaceCount > 0)).length,
      newlines: rows.filter((row) => row.issues.some((issue) => issue.newlineCount > 0)).length,
      mojibake: rows.filter((row) => row.issues.some((issue) => issue.mojibake)).length,
      controlChars: rows.filter((row) => row.issues.some((issue) => issue.controlChars)).length,
    },
    rows,
  };
  await mkdir("storage/review", { recursive: true });
  const path = "storage/review/question-text-audit-2026-08-02.json";
  await writeFile(path, JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify({ ...summary, rows: rows.slice(0, 20) }, null, 2));
  console.log(`Full report: ${path}`);
}

main().finally(() => prisma.$disconnect());
