import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { countQuestions } from "@/lib/questions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilterSelectClient } from "@/components/question/filter-select-client";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Sparkle, Timer } from "@phosphor-icons/react/ssr";

export default async function PracticePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const sp = await searchParams;
  const section = sp.section as "A" | "B" | undefined;
  const topicId = sp.topicId || undefined;
  const difficulty = sp.difficulty as "EASY" | "MEDIUM" | "HARD" | undefined;
  const hideObsolete = sp.hideObsolete !== "false";

  const filters = { section, topicId, difficulty, hideObsolete };
  const [topics, available] = await Promise.all([
    prisma.topic.findMany({
      where: section ? { section } : undefined,
      orderBy: { nameJa: "asc" },
      select: { id: true, nameJa: true, nameVi: true },
    }),
    countQuestions(filters),
  ]);

  const sessionQuery = new URLSearchParams();
  if (section) sessionQuery.set("section", section);
  if (topicId) sessionQuery.set("topicId", topicId);
  if (difficulty) sessionQuery.set("difficulty", difficulty);
  sessionQuery.set("hideObsolete", String(hideObsolete));
  sessionQuery.set("count", "10");

  const baseParams = Object.fromEntries(Object.entries(sp).filter(([, value]) => value !== undefined) as [string, string][]);
  const toggleQuery = new URLSearchParams(baseParams);
  toggleQuery.set("hideObsolete", String(!hideObsolete));

  return (
    <div className="mx-auto max-w-[1180px] space-y-7 px-4 py-6 md:px-8 md:py-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#171c3a] px-6 py-8 text-white shadow-2xl shadow-indigo-950/15 md:px-9 md:py-10">
        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 size-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-200"><Sparkle className="size-4" weight="fill" /><span className="text-xs font-bold uppercase tracking-[0.2em]">{t("nav.practice")}</span></div>
            <h1 className="font-heading text-3xl font-bold tracking-[-0.04em] md:text-5xl">{t("practice.title")}</h1>
            <p className="text-sm leading-6 text-indigo-100/70 md:text-base">{t("practice.chooseFilters")}</p>
          </div>
          <Link href="/mock-exam" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-200 transition-colors hover:text-white"><Timer className="size-4" weight="bold" />{t("nav.mockExam")}<ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <Card className="border-0 bg-white shadow-xl shadow-slate-200/45 dark:bg-card dark:shadow-none">
        <CardContent className="space-y-7 p-5 md:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{t("question.section")}</p><h2 className="mt-1 font-heading text-xl font-bold tracking-tight">{t("practice.chooseFilters")}</h2></div>
            <Badge variant="secondary" className="w-fit rounded-full px-3 py-1.5 text-xs font-semibold">{available} {t("practice.availableQuestions")}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FilterSelectClient label={t("question.section")} allLabel={t("common.all")} current={section} options={[{ value: "A", label: "A" }, { value: "B", label: "B" }]} paramKey="section" baseParams={baseParams} basePath="/practice" />
            <FilterSelectClient label={t("question.topic")} allLabel={t("common.all")} current={topicId} options={topics.map((topic) => ({ value: topic.id, label: locale === "vi" ? topic.nameVi : topic.nameJa }))} paramKey="topicId" baseParams={baseParams} basePath="/practice" />
            <FilterSelectClient label={t("question.difficulty")} allLabel={t("common.all")} current={difficulty} options={[{ value: "EASY", label: t("question.difficultyEasy") }, { value: "MEDIUM", label: t("question.difficultyMedium") }, { value: "HARD", label: t("question.difficultyHard") }]} paramKey="difficulty" baseParams={baseParams} basePath="/practice" />
          </div>
          <div className="flex flex-col gap-5 border-t border-slate-100 pt-6 dark:border-border sm:flex-row sm:items-center sm:justify-between">
            <Link href={`/practice?${toggleQuery.toString()}`} aria-pressed={hideObsolete} className="group flex items-start gap-3 rounded-xl p-1 transition-colors hover:bg-muted/60">
              <span className={`mt-0.5 flex size-5 items-center justify-center rounded-md border transition-colors ${hideObsolete ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>{hideObsolete && <Check className="size-3.5" weight="bold" />}</span>
              <span><span className="block text-sm font-semibold">{t("practice.hideObsolete")}</span><span className="mt-0.5 block text-xs text-muted-foreground">{t("practice.legacyDescription")}</span></span>
            </Link>
            <div className="flex items-center gap-3 rounded-2xl bg-indigo-50 px-4 py-3 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100"><span className="text-2xl font-bold">10</span><span className="max-w-28 text-xs leading-4">{t("practice.sessionSummary")}</span></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-dashed border-slate-300 px-5 py-4 dark:border-border sm:flex-row sm:items-center">
        <div><p className="text-sm font-semibold">{t("practice.sessionSummary")}</p><p className="mt-1 text-xs text-muted-foreground">10 {t("practice.availableQuestions")}</p></div>
        {available === 0 ? <Button disabled className="rounded-xl">{t("practice.startSession")}</Button> : <Button nativeButton={false} render={<Link href={`/practice/session?${sessionQuery.toString()}`} />} className="rounded-xl shadow-lg shadow-primary/20"><ArrowRight className="size-4" weight="bold" />{t("practice.startSession")}</Button>}
      </div>
    </div>
  );
}
