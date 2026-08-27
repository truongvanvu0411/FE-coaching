import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { prisma } from "../../src/lib/prisma";

const cjk = "\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}ーｰ";
const hasCjk = new RegExp(`[${cjk}]`, "u");
const betweenCjk = new RegExp(`([${cjk}])\\s+(?=[${cjk}])`, "gu");
const cjkAscii = new RegExp(`([${cjk}])\\s+(?=[A-Za-z0-9])|([A-Za-z0-9])\\s+(?=[${cjk}])`, "gu");
const beforePunctuation = new RegExp(`([${cjk}])\\s+([、。，．：；！？,.!?;:：\\)\\]】」』〉》〕])`, "gu");
const afterOpening = /([（(［\[【「『〈《〔])\s+/gu;

/**
 * Fixes layout artefacts introduced by OCR without guessing characters.
 * It intentionally does not perform dictionary substitutions: those require
 * source-image verification and are handled by the review queue.
 */
export function polishJapaneseText(value: string) {
  if (!value) return value;
  const base = value
    .replace(/\r\n?/g, "\n")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!hasCjk.test(base)) return base;
  return base
    .replace(betweenCjk, "$1")
    .replace(cjkAscii, (_match, leftCjk, leftAscii, offset, source) => {
      // Keep a space in ordinary Latin prose; remove OCR separators adjacent
      // to Japanese/numeric tokens (e.g. `10 進 数` -> `10進数`).
      return leftCjk ?? leftAscii ?? source[offset as number];
    })
    .replace(beforePunctuation, "$1$2")
    .replace(afterOpening, "$1");
}

type Change = { kind: "question" | "choice"; id: string; field: string; before: string; after: string };

async function main() {
  const apply = process.argv.includes("--apply");
  const questions = await prisma.question.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      bodyJa: true,
      explanationJa: true,
      choices: { orderBy: { order: "asc" }, select: { id: true, textJa: true } },
    },
  });
  const changes: Change[] = [];
  for (const question of questions) {
    for (const [field, before] of [["bodyJa", question.bodyJa], ["explanationJa", question.explanationJa]] as const) {
      if (!before) continue;
      const after = polishJapaneseText(before);
      if (after !== before) changes.push({ kind: "question", id: question.id, field, before, after });
    }
    for (const choice of question.choices) {
      const after = polishJapaneseText(choice.textJa);
      if (after !== choice.textJa) changes.push({ kind: "choice", id: choice.id, field: "textJa", before: choice.textJa, after });
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  await mkdir("storage/review", { recursive: true });
  const backupPath = `storage/review/question-text-polish-${stamp}.json`;
  await writeFile(backupPath, JSON.stringify({ generatedAt: new Date().toISOString(), changes }, null, 2), "utf8");

  if (apply) {
    await prisma.$transaction(async (tx) => {
      for (const change of changes) {
        if (change.kind === "question") {
          await tx.question.update({ where: { id: change.id }, data: { [change.field]: change.after } });
        } else {
          await tx.choice.update({ where: { id: change.id }, data: { textJa: change.after } });
        }
      }
    }, { timeout: 120_000 });
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", questions: questions.length, changes: changes.length, backupPath, samples: changes.slice(0, 10) }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
