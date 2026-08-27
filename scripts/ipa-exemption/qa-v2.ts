import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Choice = { key: string; order: number; textJa: string };
type Candidate = {
  questionNumber: string;
  sourcePage: string;
  bodyJa: string;
  choices: Choice[];
  correctAnswer: string;
  mappingStatus: string;
  parseConfidence: number;
  needsVisualReview: boolean;
  manualVisualOverride?: boolean;
};

const ROOT = process.cwd();
const STORAGE = join(ROOT, "storage", "ipa-exemption");
const OUTPUT = join(STORAGE, "qa-v2");
const CANDIDATES_DIR = process.env.QA_CANDIDATES_DIR ?? "candidates-v2";
const DEFAULT_SESSIONS = ["2026-06", "2026-07"];

function issueList(candidate: Candidate) {
  const issues: string[] = [];
  const expectedNumber = /^Q(?:0?[1-9]|[1-7][0-9]|80)$/u.test(candidate.questionNumber);
  if (!expectedNumber) issues.push("invalid_question_number");
  if (!/^\d+$/u.test(candidate.sourcePage)) issues.push("invalid_source_page");
  if (candidate.bodyJa.trim().length < 20) issues.push("short_body");
  if (candidate.choices.length !== 4) issues.push("choice_count");
  if (candidate.choices.some((choice, index) => choice.key !== ["A", "B", "C", "D"][index] || choice.order !== index)) {
    issues.push("choice_order");
  }
  if (candidate.choices.some((choice) => choice.textJa.trim().length < 4)) issues.push("short_choice");
  if (!/^[ABCD]$/u.test(candidate.correctAnswer)) issues.push("invalid_answer");
  if (candidate.bodyJa.includes("|") || candidate.bodyJa.includes("<") || candidate.bodyJa.includes(">")) issues.push("diagram_noise");
  if (candidate.needsVisualReview) issues.push("visual_review");
  return [...new Set(issues)];
}

async function main() {
  await mkdir(OUTPUT, { recursive: true });
  const reports: unknown[] = [];
  const requested = process.env.QA_SESSIONS?.split(",").map((value) => value.trim()).filter(Boolean);
  const sessions = requested?.length ? requested : process.env.FULL_QA === "1"
    ? (await readFile(join(STORAGE, process.env.QA_MANIFEST ?? "batch1-manifest.json"), "utf8").then((value) => JSON.parse(value) as { session: string }[])).map((item) => item.session)
    : DEFAULT_SESSIONS;
  for (const session of sessions) {
    const current = JSON.parse(await readFile(join(STORAGE, CANDIDATES_DIR, `${session}.json`), "utf8")) as { expected?: number; candidates: Candidate[] };
    let previous: { candidates: Candidate[] } = { candidates: [] };
    try {
      previous = JSON.parse(await readFile(join(STORAGE, "candidates", `${session}.json`), "utf8")) as { candidates: Candidate[] };
    } catch {}
    const expected = current.expected ?? 60;
    const byNumber = new Map(current.candidates.map((candidate) => [candidate.questionNumber, candidate]));
    const missing = Array.from({ length: expected }, (_, index) => `Q${String(index + 1).padStart(2, "0")}`).filter((number) => !byNumber.has(number));
    const issues = current.candidates.flatMap((candidate) => issueList(candidate).map((issue) => ({ questionNumber: candidate.questionNumber, issue })));
    const answerValues = current.candidates.map((candidate) => candidate.correctAnswer).filter(Boolean);
    const report = {
      session,
      parserVersion: "layout-v2-1",
      expected,
      parsed: current.candidates.length,
      missing,
      duplicateQuestionNumbers: current.candidates.map((candidate) => candidate.questionNumber).filter((number, index, all) => all.indexOf(number) !== index),
      clean: current.candidates.filter((candidate) => candidate.mappingStatus === "CLEAN").length,
      reviewRequired: current.candidates.filter((candidate) => candidate.mappingStatus === "REVIEW_REQUIRED").length,
      ocrFailed: current.candidates.filter((candidate) => candidate.mappingStatus === "OCR_FAILED").length,
      manualVisualOverrides: current.candidates.filter((candidate) => candidate.manualVisualOverride).length,
      answerCoverage: `${answerValues.length}/${expected}`,
      structuralIssues: issues,
      changedFromV1: current.candidates.filter((candidate) => {
        const old = previous.candidates.find((item) => item.questionNumber === candidate.questionNumber);
        return !old || old.bodyJa !== candidate.bodyJa || JSON.stringify(old.choices) !== JSON.stringify(candidate.choices);
      }).length,
      candidates: current.candidates.map((candidate) => ({
        questionNumber: candidate.questionNumber,
        sourcePage: candidate.sourcePage,
        mappingStatus: candidate.mappingStatus,
        parseConfidence: candidate.parseConfidence,
        issues: issueList(candidate),
      })),
    };
    reports.push(report);
    console.log(`${session}: ${current.candidates.length}/${expected} parsed; clean=${report.clean}; review=${report.reviewRequired}; failed=${report.ocrFailed}; answers=${report.answerCoverage}; issues=${issues.length}`);
  }
  const reportName = process.env.QA_SESSIONS ? `report-${process.env.QA_SESSIONS.replace(/[^a-zA-Z0-9_-]+/g, "_")}.json` : "pilot-report.json";
  await writeFile(join(OUTPUT, reportName), JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2), "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
