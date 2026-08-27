import { getLocale } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pickRandomQuestions, type QuestionFilters } from "@/lib/questions";
import { SessionRunner } from "@/components/practice/session-runner";

export default async function PracticeSessionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const user = await requireUser(locale);

  const filters: QuestionFilters = {
    section: sp.section as "A" | "B" | undefined,
    topicId: sp.topicId || undefined,
    difficulty: sp.difficulty as "EASY" | "MEDIUM" | "HARD" | undefined,
    hideObsolete: sp.hideObsolete !== "false",
  };
  const count = Math.min(Number(sp.count) || 10, 50);

  const questions = await pickRandomQuestions(filters, count);
  const ids = questions.map((question) => question.id);

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id, questionId: { in: ids } },
    select: { questionId: true },
  });

  return (
    <SessionRunner
      questions={questions}
      bookmarkedIds={new Set(bookmarks.map((b) => b.questionId))}
      mode="practice"
    />
  );
}
