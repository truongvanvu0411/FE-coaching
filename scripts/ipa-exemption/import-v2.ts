import "dotenv/config";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type ManifestItem = {
  session: string;
  questionUrl: string;
  questionFile: string;
};

type Candidate = {
  id: string;
  session: string;
  sourceUrl: string;
  sourcePage: string;
  questionNumber: string;
  bodyJa: string;
  choices: { key: string; order: number; textJa: string }[];
  correctAnswer: string;
  mappingStatus: "CLEAN" | "REVIEW_REQUIRED" | "OCR_FAILED";
};

type CandidateReport = { expected: number; candidates: Candidate[] };

const STORAGE = process.env.IMPORT_STORAGE ? join(process.cwd(), process.env.IMPORT_STORAGE) : join(process.cwd(), "storage", "ipa-exemption");
const CANDIDATES_DIR = process.env.IMPORT_CANDIDATES_DIR ?? "candidates-v2";

function selectedSessions(manifest: ManifestItem[]) {
  const requested = process.env.IMPORT_V2_SESSIONS?.split(",").map((value) => value.trim()).filter(Boolean);
  return requested?.length ? manifest.filter((item) => requested.includes(item.session)) : manifest;
}

function validateCandidate(candidate: Candidate) {
  return (candidate.mappingStatus !== "OCR_FAILED" || process.env.IMPORT_ALLOW_OCR === "1")
    && candidate.choices.length === 4
    && candidate.choices.every((choice, index) => choice.key === ["A", "B", "C", "D"][index] && choice.order === index && choice.textJa.trim().length > 0)
    && /^[ABCD]$/u.test(candidate.correctAnswer)
    && candidate.bodyJa.trim().length >= 10;
}

async function loadReports(items: ManifestItem[]) {
  const reports = [] as { item: ManifestItem; report: CandidateReport; valid: Candidate[]; invalid: Candidate[] }[];
  for (const item of items) {
    const report = JSON.parse(await readFile(join(STORAGE, CANDIDATES_DIR, `${item.session}.json`), "utf8")) as CandidateReport;
    const valid = report.candidates.filter(validateCandidate);
    const invalid = report.candidates.filter((candidate) => !validateCandidate(candidate));
    if (report.candidates.length !== report.expected) {
      throw new Error(`${item.session}: parsed ${report.candidates.length}/${report.expected}`);
    }
    reports.push({ item, report, valid, invalid });
  }
  return reports;
}

async function importReports(reports: Awaited<ReturnType<typeof loadReports>>) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for --import");
  const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) });
  let imported = 0;
  try {
    const topics = await prisma.topic.findMany({ where: { section: "A" } });
    const fallback = topics.find((topic) => topic.nameJa === "基本情報技術者") ?? topics[0];
    if (!fallback) throw new Error("No Section A topic found. Run prisma seed first.");
    for (const { item, valid } of reports) {
      const job = await prisma.ingestJob.upsert({
        where: { id: `ipa-exemption-${item.session}` },
        update: { fileName: item.questionFile, fileUrl: item.questionUrl, sourceType: "IPA_EXEMPTION", status: "PARSED", ocrText: null, parseErrors: null },
        create: { id: `ipa-exemption-${item.session}`, fileName: item.questionFile, fileUrl: item.questionUrl, sourceType: "IPA_EXEMPTION", status: "PARSED" },
      });
      for (const candidate of valid) {
        await prisma.question.upsert({
          where: { id: candidate.id },
          update: {
            sourceUrl: candidate.sourceUrl,
            sourcePage: candidate.sourcePage,
            questionNumber: candidate.questionNumber,
            bodyJa: candidate.bodyJa,
            correctAnswer: candidate.correctAnswer,
            isObsolete: process.env.IMPORT_LEGACY === "1",
            reviewStatus: "PENDING_REVIEW",
            verified: false,
            ingestJobId: job.id,
            choices: { deleteMany: {}, create: candidate.choices },
          },
          create: {
            id: candidate.id,
            section: "A",
            year: Number(candidate.session.slice(0, 4)),
            sourceType: "IPA_EXEMPTION",
            sourceUrl: candidate.sourceUrl,
            sourcePage: candidate.sourcePage,
            questionNumber: candidate.questionNumber,
            topicId: fallback.id,
            difficulty: "MEDIUM",
            bodyJa: candidate.bodyJa,
            correctAnswer: candidate.correctAnswer,
            isObsolete: process.env.IMPORT_LEGACY === "1",
            verified: false,
            reviewStatus: "PENDING_REVIEW",
            ingestJobId: job.id,
            choices: { create: candidate.choices },
          },
        });
        imported++;
      }
    }
  } finally {
    await prisma.$disconnect();
  }
  console.log(`Imported/upserted v2 candidates: ${imported}`);
}

async function main() {
  const manifest = JSON.parse(await readFile(join(STORAGE, process.env.IMPORT_MANIFEST ?? "batch1-manifest.json"), "utf8")) as ManifestItem[];
  const items = selectedSessions(manifest);
  if (!items.length) throw new Error("No sessions selected");
  const reports = await loadReports(items);
  const total = reports.reduce((sum, entry) => sum + entry.valid.length, 0);
  const invalid = reports.flatMap(({ item, invalid: candidates }) => candidates.map((candidate) => ({
    session: item.session,
    questionNumber: candidate.questionNumber,
    sourcePage: candidate.sourcePage,
    mappingStatus: candidate.mappingStatus,
    choices: candidate.choices.map((choice) => choice.textJa),
  })));
  await import("node:fs/promises").then(({ writeFile }) => writeFile(
    join(STORAGE, "qa-v2", "import-v2-dry-run.json"),
    JSON.stringify({ sessions: items.length, totalCandidates: total + invalid.length, ready: total, invalid }, null, 2),
    "utf8",
  ));
  console.log(`v2 import validation: ${items.length} sessions, ${total} candidates ready`);
  for (const { item, report, valid } of reports) {
    const review = valid.filter((candidate) => candidate.mappingStatus === "REVIEW_REQUIRED").length;
    console.log(`${item.session}: ${valid.length}/${report.expected} valid; review_required=${review}`);
  }
  if (invalid.length && process.env.IMPORT_ALLOW_PARTIAL !== "1") {
    const grouped = new Map<string, number>();
    for (const candidate of invalid) grouped.set(candidate.session, (grouped.get(candidate.session) ?? 0) + 1);
    throw new Error(`Dry-run blocked: ${invalid.length} candidates need choice repair (${[...grouped].map(([session, count]) => `${session}=${count}`).join(", ")})`);
  }
  if (invalid.length && process.env.IMPORT_ALLOW_PARTIAL === "1") console.log(`Partial import mode: skipping ${invalid.length} structurally invalid candidates`);
  if (process.argv.includes("--import")) await importReports(reports);
  else console.log("Dry run only. Pass --import to upsert into DATABASE_URL.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
