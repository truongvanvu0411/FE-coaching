import { getLocale } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pickRandomQuestions } from "@/lib/questions";
import { SessionRunner } from "@/components/practice/session-runner";

export default async function MockExamSessionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const user = await requireUser(locale);

  const section = sp.section as "A" | "B" | undefined;
  const count = Math.min(Number(sp.count) || 10, 50);
  const minutes = Math.min(Number(sp.minutes) || 30, 180);

  const questions = await pickRandomQuestions(
    { section, hideObsolete: true },
    count,
  );
  const ids = questions.map((question) => question.id);

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id, questionId: { in: ids } },
    select: { questionId: true },
  });

  return (
    <SessionRunner
      questions={questions}
      bookmarkedIds={new Set(bookmarks.map((b) => b.questionId))}
      mode="mock_exam"
      showTutor={false}
      timeLimitSeconds={minutes * 60}
    />
  );
}
