import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Candidate = { id: string; session: string; questionNumber: string; correctAnswer: string };
const ROOT = process.cwd();

async function loadCandidates() {
  const sources = [
    { dir: join(ROOT, "storage", "ipa-exemption", "candidates-v2"), sessions: ["2020-06", "2020-07"] },
    { dir: join(ROOT, "storage", "ipa-classic", "candidates-v2-2014"), sessions: ["2014-autumn", "2014-spring"] },
    { dir: join(ROOT, "storage", "ipa-classic", "candidates-v2"), sessions: ["2015-autumn", "2015-spring", "2016-autumn", "2016-spring", "2017-autumn", "2017-spring", "2018-autumn", "2018-spring", "2019-autumn", "2019-spring"] },
  ];
  const all: Candidate[] = [];
  for (const source of sources) for (const session of source.sessions) {
    const report = JSON.parse(await readFile(join(source.dir, `${session}.json`), "utf8")) as { candidates: Candidate[] };
    all.push(...report.candidates);
  }
  return all;
}

async function main() {
  const candidates = await loadCandidates();
  const classicOverrides = JSON.parse(await readFile(join(ROOT, "storage", "ipa-classic", "qa-v2", "answer-overrides.json"), "utf8")) as Record<string, Record<string, string>>;
  const overrides: Record<string, Record<string, string>> = { ...classicOverrides };
  for (const session of ["2020-06", "2020-07"]) {
    const pages = JSON.parse(await readFile(join(ROOT, "storage", "ipa-exemption", "candidates", "pages", `${session}-answer.json`), "utf8")) as { text: string }[];
    const text = pages.map((page) => page.text).join("\n");
    const map: Record<string, string> = {};
    for (const match of text.matchAll(/問\s*([0-9]{1,2})\s*([アイウエ])/gu)) map[`Q${String(Number(match[1])).padStart(2, "0")}`] = ({ ア: "A", イ: "B", ウ: "C", エ: "D" }[match[2]]!);
    overrides[session] = map;
  }
  const importedIds = new Set((JSON.parse(await readFile(join(ROOT, "storage", "review", "pending-review-candidates.json"), "utf8")) as Candidate[]).map((candidate) => candidate.id));
  const relevant = candidates.filter((candidate) => importedIds.has(candidate.id));
  const mismatches = relevant.filter((candidate) => overrides[candidate.session]?.[candidate.questionNumber] !== candidate.correctAnswer).map((candidate) => ({ id: candidate.id, expected: overrides[candidate.session]?.[candidate.questionNumber], actual: candidate.correctAnswer }));
  const coverage = Object.fromEntries([...new Set(relevant.map((candidate) => candidate.session))].sort().map((session) => [session, { candidate: relevant.filter((candidate) => candidate.session === session).length, answerMap: Object.keys(overrides[session] ?? {}).length, mismatch: mismatches.filter((item) => item.id.includes(`-${session}-`)).length }]));
  const result = { total: relevant.length, mismatchCount: mismatches.length, mismatches, coverage };
  await writeFile(join(ROOT, "storage", "review", "answer-map-audit.json"), JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
