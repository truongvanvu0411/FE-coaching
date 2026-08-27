import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { prisma } from "../../src/lib/prisma";

const replacements: Array<[RegExp, string]> = [
  [/適切なもゃのは/g, "適切なものは"],
  [/適切なゃのは/g, "適切なものは"],
  [/適切なもゃの/g, "適切なもの"],
  [/適切なゃの/g, "適切なもの"],
  [/分割さまれた/g, "分割された"],
  [/分割さまれ/g, "分割された"],
  [/許可しレ/g, "許可し"],
  [/データ烈/g, "データ列"],
  [/サーパバ/g, "サーバ"],
  [/タ個のデータの2分探索に要する比較回数は, ヵlog。 ヵに比例する。/g, "n個のデータの2分探索に要する比較回数は, n log₂ nに比例する。"],
  [/実施すずることは選ける。/g, "実施することは避ける。"],
];

function fix(value: string) {
  return replacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), value);
}

type Change = { kind: "question" | "choice"; id: string; field: string; before: string; after: string };

async function main() {
  const apply = process.argv.includes("--apply");
  const questions = await prisma.question.findMany({
    orderBy: { id: "asc" },
    select: { id: true, bodyJa: true, explanationJa: true, choices: { orderBy: { order: "asc" }, select: { id: true, textJa: true } } },
  });
  const changes: Change[] = [];
  for (const question of questions) {
    for (const [field, before] of [["bodyJa", question.bodyJa], ["explanationJa", question.explanationJa]] as const) {
      if (!before) continue;
      const after = fix(before);
      if (after !== before) changes.push({ kind: "question", id: question.id, field, before, after });
    }
    for (const choice of question.choices) {
      const after = fix(choice.textJa);
      if (after !== choice.textJa) changes.push({ kind: "choice", id: choice.id, field: "textJa", before: choice.textJa, after });
    }
  }
  await mkdir("storage/review", { recursive: true });
  const backupPath = `storage/review/question-known-ocr-fixes-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  await writeFile(backupPath, JSON.stringify({ generatedAt: new Date().toISOString(), replacements: replacements.map(([pattern, value]) => [pattern.source, value]), changes }, null, 2), "utf8");
  if (apply) {
    await prisma.$transaction(async (tx) => {
      for (const change of changes) {
        if (change.kind === "question") await tx.question.update({ where: { id: change.id }, data: { [change.field]: change.after } });
        else await tx.choice.update({ where: { id: change.id }, data: { textJa: change.after } });
      }
    }, { timeout: 120_000 });
  }
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", changes: changes.length, backupPath, samples: changes.slice(0, 20) }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
