import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  BookmarkSimple,
  ChartLineUp,
  CheckCircle,
  Fire,
  Timer,
} from "@phosphor-icons/react/ssr";

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const user = await requireUser(locale);
  const userId = user.id;

  const [totalAttempts, correctAttempts, bookmarkCount, latestAttempt, recentAttempts] = await Promise.all([
    prisma.attempt.count({ where: { userId } }),
    prisma.attempt.count({ where: { userId, isCorrect: true } }),
    prisma.bookmark.count({ where: { userId } }),
    prisma.attempt.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { question: { select: { topic: { select: { nameJa: true, nameVi: true } } } } },
    }),
    prisma.attempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
      take: 400,
    }),
  ]);

  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const latestTopic = latestAttempt
    ? locale === "vi"
      ? latestAttempt.question.topic.nameVi
      : latestAttempt.question.topic.nameJa
    : null;
  const dayKeys = new Set(recentAttempts.map((attempt) => attempt.createdAt.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-6 md:px-8 md:py-10">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{t("dashboard.welcomeBack")}</p>
          <h1 className="font-heading text-3xl font-bold tracking-[-0.04em] md:text-5xl">{user.name || t("common.appName")}</h1>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">{t("dashboard.todayPrompt")}</p>
        </div>
        <Button nativeButton={false} render={<Link href="/practice" />} size="lg" className="w-full rounded-2xl px-5 shadow-fab md:w-auto">
          <BookOpen className="size-4" weight="bold" />
          {t("practice.newSession")}
          <ArrowRight className="size-4" weight="bold" />
        </Button>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">
        {/* The reference's hero: light surface, big number, one primary action.
            Replaces a near-black #171c3a card that fought the rest of the page. */}
        <Card className="relative min-h-[330px] overflow-hidden border-0 bg-card shadow-card">
          <CardContent className="relative flex h-full flex-col justify-between gap-10 p-7 md:p-9">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-4">
                <Badge className="bg-accent text-accent-foreground hover:bg-accent">
                  {latestTopic ? t("practice.continueLearning") : t("practice.newSession")}
                </Badge>
                <div className="space-y-2">
                  <h2 className="max-w-xl font-heading text-3xl font-bold tracking-[-0.04em] md:text-4xl">
                    {latestTopic || t("practice.chooseFilters")}
                  </h2>
                  <p className="max-w-lg text-body text-muted-foreground">
                    {latestTopic ? `${t("dashboard.recentActivity")}: ${latestTopic}` : t("dashboard.startFirstSession")}
                  </p>
                </div>
              </div>
              <div
                className="hidden size-24 shrink-0 rounded-full p-2 sm:block"
                style={{ background: `conic-gradient(var(--primary) ${accuracy}%, var(--muted) 0)` }}
              >
                <div className="flex size-full items-center justify-center rounded-full bg-card text-center">
                  <span className="text-xl font-bold">{accuracy}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-label text-muted-foreground">
                <span>{t("dashboard.accuracyByTopic")}</span>
                <span>{totalAttempts} {t("dashboard.questionsCompleted")}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(accuracy, 4)}%` }} />
              </div>
              <Button nativeButton={false} render={<Link href="/practice" />} size="lg" className="rounded-xl shadow-fab">
                {latestTopic ? t("practice.continueLearning") : t("practice.startSession")}
                <ArrowRight className="size-4" weight="bold" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={CheckCircle} value={`${accuracy}%`} label={t("dashboard.accuracyByTopic")} tone="indigo" />
          <StatCard icon={BookOpen} value={totalAttempts} label={t("dashboard.questionsCompleted")} tone="blue" />
          <StatCard icon={Fire} value={streak} label={t("dashboard.streak")} tone="amber" />
          <StatCard icon={BookmarkSimple} value={bookmarkCount} label={t("dashboard.bookmarksSaved")} tone="violet" />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-0 bg-card shadow-card">
          <CardContent className="p-6 md:p-7">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{t("practice.quickPractice")}</p>
                <h2 className="mt-2 font-heading text-xl font-bold tracking-tight">{t("practice.chooseFilters")}</h2>
              </div>
              <Link href="/progress" className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex">
                {t("nav.progress")} <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <QuickAction href="/practice" icon={BookOpen} title={t("practice.quickPractice")} description="10 questions" />
              <QuickAction href="/mock-exam" icon={Timer} title={t("nav.mockExam")} description="Timed practice" />
              <QuickAction href="/progress" icon={ChartLineUp} title={t("nav.progress")} description={t("dashboard.weakTopics")} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-accent/60 shadow-card">
          <CardContent className="flex h-full flex-col justify-between gap-8 p-6 md:p-7">
            <div>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-card text-primary shadow-card"><ChartLineUp className="size-5" weight="duotone" /></span>
              <h2 className="mt-5 font-heading text-xl font-bold tracking-tight">{t("tutor.title")}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("tutor.disclaimer")}</p>
            </div>
            <Link href="/practice" className="inline-flex items-center gap-2 text-sm font-bold text-primary">{t("practice.startSession")} <ArrowRight className="size-4" /></Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, tone }: { icon: typeof CheckCircle; value: string | number; label: string; tone: "indigo" | "blue" | "amber" | "violet" }) {
  // Colour carries meaning, not decoration (spec §5): accuracy and completion
  // read as the app's own identity, streak and bookmarks as their own states.
  const tones = {
    indigo: "bg-accent text-accent-foreground",
    blue: "bg-section-a/12 text-section-a",
    amber: "bg-state-bookmark/15 text-state-bookmark",
    violet: "bg-section-b/12 text-section-b",
  };
  return (
    <Card className="border-0 bg-card shadow-card">
      <CardContent className="flex min-h-[152px] flex-col justify-between gap-4 p-5">
        <span className={`flex size-10 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="size-5" weight="duotone" /></span>
        <div><p className="font-heading text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs leading-4 text-muted-foreground">{label}</p></div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ href, icon: Icon, title, description }: { href: string; icon: typeof BookOpen; title: string; description: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-border bg-surface-sheet p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-card dark:bg-muted/30 dark:hover:bg-muted">
      <span className="flex size-10 items-center justify-center rounded-xl bg-card text-primary shadow-card"><Icon className="size-5" weight="duotone" /></span>
      <p className="mt-4 text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <ArrowRight className="mt-4 size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
