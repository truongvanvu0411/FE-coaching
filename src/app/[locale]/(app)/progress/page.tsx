import { getTranslations, getLocale } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function ProgressPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const userId = (await requireUser(locale)).id;

  const recentStart = new Date();
  recentStart.setDate(recentStart.getDate() - 400);

  const [totalAttempts, totalCorrect, groupedAttempts, recentAttempts] =
    await Promise.all([
      prisma.attempt.count({ where: { userId } }),
      prisma.attempt.count({ where: { userId, isCorrect: true } }),
      prisma.attempt.groupBy({
        by: ["questionId", "isCorrect"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.attempt.findMany({
        where: { userId, createdAt: { gte: recentStart } },
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const questionIds = groupedAttempts.map((attempt) => attempt.questionId);
  const questions = questionIds.length
    ? await prisma.question.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, topicId: true, topic: { select: { nameJa: true, nameVi: true } } },
      })
    : [];
  const questionById = new Map(questions.map((question) => [question.id, question]));

  const byTopic = new Map<string, { name: string; total: number; correct: number }>();
  for (const a of groupedAttempts) {
    const question = questionById.get(a.questionId);
    if (!question) continue;
    const key = question.topicId;
    const name = locale === "vi" ? question.topic.nameVi : question.topic.nameJa;
    const entry = byTopic.get(key) ?? { name, total: 0, correct: 0 };
    entry.total += a._count._all;
    if (a.isCorrect) entry.correct += a._count._all;
    byTopic.set(key, entry);
  }

  const topicStats = [...byTopic.values()]
    .map((entry) => ({ ...entry, accuracy: Math.round((entry.correct / entry.total) * 100) }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const weakTopics = topicStats.filter((entry) => entry.total >= 3).slice(0, 5);

  const dayKeys = new Set(
    recentAttempts.map((a) => a.createdAt.toISOString().slice(0, 10)),
  );
  let streak = 0;
  const cursor = new Date();
  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-8 md:py-10">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{t("nav.progress")}</p>
        <h1 className="font-heading text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-2 p-5">
            <p className="text-2xl font-bold">{totalAttempts}</p>
            <p className="text-xs text-muted-foreground">{t("dashboard.totalAttempts")}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-2 p-5">
            <p className="text-2xl font-bold">
              {totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">{t("dashboard.accuracyByTopic")}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-2 p-5">
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground">{t("dashboard.streak")}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("dashboard.weakTopics")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {weakTopics.length === 0 && <p className="text-sm text-muted-foreground">{t("dashboard.noWeakTopics")}</p>}
          {weakTopics.map((topic) => (
            <div key={topic.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{topic.name}</span>
                <span className="text-muted-foreground">
                  {topic.correct}/{topic.total} ({topic.accuracy}%)
                </span>
              </div>
              <Progress aria-label={`${topic.name} accuracy`} value={topic.accuracy} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
