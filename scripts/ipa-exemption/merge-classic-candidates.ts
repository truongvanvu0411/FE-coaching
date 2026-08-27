import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Candidate = {
  questionNumber: string;
  choices: { key: string; order: number; textJa: string }[];
  bodyJa: string;
  mappingStatus: string;
  parseConfidence: number;
  [key: string]: unknown;
};

const root = join(process.cwd(), "storage", "ipa-classic");
const sessions = process.env.CLASSIC_SESSIONS?.split(",").map((value) => value.trim()).filter(Boolean)
  ?? ["2015-autumn", "2015-spring", "2016-autumn", "2016-spring", "2017-autumn", "2017-spring", "2018-autumn", "2018-spring", "2019-autumn", "2019-spring"];
const inputDirs = process.env.CLASSIC_INPUT_DIRS?.split(",").map((value) => value.trim()).filter(Boolean)
  ?? ["candidates-v2-scale2", "candidates-v2-scale3", "candidates-v2-targeted"];

function score(candidate: Candidate) {
  const shape = candidate.choices.length === 4 ? 100 : 0;
  const nonEmpty = candidate.choices.filter((choice) => choice.textJa.trim().length > 0).length * 10;
  const body = candidate.bodyJa.trim().length >= 10 ? 5 : 0;
  const mapped = candidate.mappingStatus === "CLEAN" ? 1000 : candidate.mappingStatus === "REVIEW_REQUIRED" ? 100 : 0;
  return mapped + shape + nonEmpty + body + candidate.parseConfidence;
}

async function main() {
  const output = join(root, process.env.CLASSIC_OUTPUT ?? "candidates-v2");
  await mkdir(output, { recursive: true });
  const summary: Record<string, unknown> = {};
  for (const session of sessions) {
    const reports = await Promise.all(inputDirs.map(async (dir) => {
      try { return JSON.parse(await readFile(join(root, dir, `${session}.json`), "utf8")) as { candidates: Candidate[]; expected: number }; } catch { return { candidates: [], expected: 80 }; }
    }));
    const byQuestion = new Map<string, Candidate>();
    for (const report of reports) for (const candidate of report.candidates) {
      const previous = byQuestion.get(candidate.questionNumber);
      if (!previous || score(candidate) > score(previous)) byQuestion.set(candidate.questionNumber, candidate);
    }
    const candidates = [...byQuestion.values()]
      .filter((candidate) => Number(candidate.questionNumber.slice(1)) <= 80)
      .sort((a, b) => Number(a.questionNumber.slice(1)) - Number(b.questionNumber.slice(1)));
    const report = {
      session,
      parserVersion: "layout-v2-classic-merged",
      expected: 80,
      parsed: candidates.length,
      clean: candidates.filter((candidate) => candidate.mappingStatus === "CLEAN").length,
      reviewRequired: candidates.filter((candidate) => candidate.mappingStatus === "REVIEW_REQUIRED").length,
      failed: candidates.filter((candidate) => candidate.mappingStatus === "OCR_FAILED").length,
      candidates,
    };
    await writeFile(join(output, `${session}.json`), JSON.stringify(report, null, 2), "utf8");
    summary[session] = { parsed: report.parsed, shape4: candidates.filter((candidate) => candidate.choices.length === 4).length, nonEmpty4: candidates.filter((candidate) => candidate.choices.length === 4 && candidate.choices.every((choice) => choice.textJa.trim())).length, failed: report.failed };
  }
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
