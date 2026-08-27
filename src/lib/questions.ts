import { prisma } from "@/lib/prisma";
import type { Difficulty, Section, SourceType } from "@/generated/prisma/enums";

export type QuestionFilters = {
  section?: Section;
  topicId?: string;
  difficulty?: Difficulty;
  sourceType?: SourceType;
  hideObsolete?: boolean;
};

const SAFE_QUESTION_SELECT = {
  id: true,
  section: true,
  year: true,
  sourceType: true,
  sourceUrl: true,
  sourcePage: true,
  questionNumber: true,
  difficulty: true,
  bodyJa: true,
  bodyVi: true,
  bodyViStatus: true,
  isObsolete: true,
  verified: true,
  topic: { select: { id: true, nameJa: true, nameVi: true } },
  choices: {
    select: { id: true, key: true, textJa: true, textVi: true, order: true },
    orderBy: { order: "asc" as const },
  },
  vocabulary: {
    select: { id: true, termJa: true, reading: true, meaningVi: true },
  },
  assets: { select: { id: true, type: true, url: true, alt: true } },
} as const;

export type SafeQuestion = NonNullable<
  Awaited<ReturnType<typeof getQuestionById>>
>;

export type SafeQuestionList = Array<SafeQuestion>;

// Learner-facing queries only ever serve verified, published questions —
// draft/pending-review/rejected rows must never reach practice or mock exam,
// regardless of any other filter. This is enforced here, not left to callers.
function buildWhere(filters: QuestionFilters) {
  return {
    verified: true,
    reviewStatus: "VERIFIED" as const,
    section: filters.section,
    topicId: filters.topicId,
    difficulty: filters.difficulty,
    sourceType: filters.sourceType,
    isObsolete: filters.hideObsolete ? false : undefined,
  };
}

export async function listQuestionIds(
  filters: QuestionFilters,
  take: number,
) {
  const rows = await prisma.question.findMany({
    where: buildWhere(filters),
    select: { id: true },
    take,
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => r.id);
}

export async function countQuestions(filters: QuestionFilters) {
  return prisma.question.count({ where: buildWhere(filters) });
}

export async function getQuestionById(id: string) {
  return prisma.question.findUnique({
    where: { id },
    select: SAFE_QUESTION_SELECT,
  });
}

/**
 * Fetch a random window of complete questions in one database round-trip.
 *
 * The previous implementation loaded up to 2,000 IDs, shuffled them in
 * JavaScript, and then queried each question separately. A random offset keeps
 * the work bounded while the final query includes all learner-facing fields.
 */
export async function pickRandomQuestions(
  filters: QuestionFilters,
  count: number,
): Promise<SafeQuestionList> {
  const safeCount = Math.max(0, Math.min(count, 50));
  if (safeCount === 0) return [];

  const total = await prisma.question.count({ where: buildWhere(filters) });
  if (total === 0) return [];

  const maxSkip = Math.max(0, total - safeCount);
  const skip = maxSkip > 0 ? Math.floor(Math.random() * (maxSkip + 1)) : 0;
  const questions = await prisma.question.findMany({
    where: buildWhere(filters),
    select: SAFE_QUESTION_SELECT,
    orderBy: { createdAt: "asc" },
    skip,
    take: safeCount,
  });

  // Shuffle only the bounded result set so consecutive sessions do not always
  // present the same chronological order.
  return questions.sort(() => Math.random() - 0.5);
}

export async function pickRandomQuestionIds(
  filters: QuestionFilters,
  count: number,
) {
  const questions = await pickRandomQuestions(filters, count);
  return questions.map((question) => question.id);
}
