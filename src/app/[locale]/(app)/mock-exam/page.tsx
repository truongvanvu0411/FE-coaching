import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { countQuestions } from "@/lib/questions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, GraduationCap } from "@phosphor-icons/react/ssr";

const PRESETS = [
  { section: "A" as const, count: 20, minutes: 30 },
  { section: "B" as const, count: 8, minutes: 40 },
];

export default async function MockExamPage() {
  const t = await getTranslations();

  const presets = await Promise.all(
    PRESETS.map(async (preset) => ({
      ...preset,
      available: await countQuestions({ section: preset.section, hideObsolete: true }),
    })),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-medium text-primary">{t("nav.mockExam")}</p>
        <h1 className="font-heading text-3xl font-bold tracking-tight">{t("mockExam.title")}</h1>
        <p className="text-muted-foreground">Practice under time pressure with verified questions from the current syllabus.</p>
      </div>

      <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-lg shadow-primary/15">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15"><GraduationCap className="size-6" weight="duotone" /></span>
            <div>
              <p className="font-heading text-xl font-semibold">A focused exam simulation</p>
              <p className="mt-1 max-w-lg text-sm leading-6 text-primary-foreground/75">Obsolete questions are hidden automatically. Review your score after submitting the full set.</p>
            </div>
          </div>
          <Badge className="w-fit border-0 bg-primary-foreground/15 text-primary-foreground">Timed mode</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {presets.map((preset) => {
          const questionCount = Math.min(preset.count, preset.available);
          const query = new URLSearchParams({ section: preset.section, count: String(questionCount), minutes: String(preset.minutes) });
          return (
            <Card key={preset.section} className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">{t("question.section")}</p>
                  <CardTitle className="mt-1 text-2xl">{preset.section}</CardTitle>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary"><Clock className="size-5" weight="duotone" /></span>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{questionCount} questions</Badge>
                  <Badge variant="secondary">{preset.minutes} min</Badge>
                  <Badge variant="secondary">{preset.available} available</Badge>
                </div>
                {preset.available === 0 ? (
                  <Button disabled className="w-full">{t("mockExam.start")}</Button>
                ) : (
                  <Button nativeButton={false} render={<Link href={`/mock-exam/session?${query.toString()}`} />} className="w-full">
                    {t("mockExam.start")} <ArrowRight className="size-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
