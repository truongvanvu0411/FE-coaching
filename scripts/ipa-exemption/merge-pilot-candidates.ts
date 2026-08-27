import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Choice = { key: string; order: number; textJa: string };
type Candidate = {
  id: string;
  session: string;
  sourceUrl: string;
  sourcePage: string;
  questionNumber: string;
  bodyJa: string;
  choices: Choice[];
  correctAnswer: string;
  mappingStatus: "CLEAN" | "REVIEW_REQUIRED" | "OCR_FAILED";
  parseConfidence: number;
  needsVisualReview: boolean;
  manualVisualOverride?: boolean;
};

const ROOT = process.cwd();
const SESSIONS = ["2020-06", "2020-07"];
const OUTPUT = join(ROOT, "storage", "ipa-exemption", "candidates-v4-merged");

function rank(candidate: Candidate) {
  const mapping = candidate.mappingStatus === "CLEAN" ? 300 : candidate.mappingStatus === "REVIEW_REQUIRED" ? 100 : 0;
  const shape = candidate.choices.length === 4 && candidate.choices.every((choice) => choice.textJa.trim()) ? 80 : 0;
  const visual = candidate.needsVisualReview && !candidate.manualVisualOverride ? -80 : 40;
  return mapping + shape + visual + candidate.parseConfidence * 10 + Math.min(candidate.bodyJa.length, 400) / 100;
}

async function load(dir: string, session: string) {
  return JSON.parse(await readFile(join(ROOT, "storage", "ipa-exemption", dir, `${session}.json`), "utf8")) as { expected: number; candidates: Candidate[] };
}

async function main() {
  await mkdir(OUTPUT, { recursive: true });
  for (const session of SESSIONS) {
    const [oldReport, v4Report] = await Promise.all([load("candidates-v2", session), load("candidates-v4", session)]);
    const byNumber = new Map<string, Candidate>();
    for (const candidate of [...oldReport.candidates, ...v4Report.candidates]) {
      const previous = byNumber.get(candidate.questionNumber);
      if (!previous || rank(candidate) > rank(previous)) byNumber.set(candidate.questionNumber, candidate);
    }
    const candidates = [...byNumber.values()].sort((a, b) => Number(a.questionNumber.slice(1)) - Number(b.questionNumber.slice(1)));
    await writeFile(join(OUTPUT, `${session}.json`), JSON.stringify({ session, expected: oldReport.expected, parsed: candidates.length, parserVersion: "layout-v2-pilot-merged-v4", candidates }, null, 2), "utf8");
    console.log(`${session}: ${candidates.length}/${oldReport.expected} clean=${candidates.filter((candidate) => candidate.mappingStatus === "CLEAN").length} review=${candidates.filter((candidate) => candidate.mappingStatus === "REVIEW_REQUIRED").length} failed=${candidates.filter((candidate) => candidate.mappingStatus === "OCR_FAILED").length}`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
