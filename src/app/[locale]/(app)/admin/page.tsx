import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChartLineUp,
  FileArrowUp,
  Flag,
  ShieldCheck,
} from "@phosphor-icons/react/ssr";

const TARGETS: Record<string, { label: string; target: number }> = {
  IPA_PUBLIC: { label: "Official FE CBT Public", target: 200 },
  IPA_EXEMPTION: { label: "FE Exemption", target: 1250 },
  LEGACY_MORNING: { label: "Legacy Morning", target: 1750 },
  ORIGINAL_PRACTICE: { label: "Original Practice", target: 350 },
};

export default async function AdminDashboardPage() {
  const t = await getTranslations();

  const [counts, pendingReview, flagCount] = await Promise.all([
    Promise.all(
      Object.keys(TARGETS).map(async (sourceType) => ({
        sourceType,
        count: await prisma.question.count({
          where: { sourceType: sourceType as never, verified: true },
        }),
      })),
    ),
    prisma.question.count({ where: { reviewStatus: "PENDING_REVIEW" } }),
    prisma.questionFlag.count({ where: { resolved: false } }),
  ]);

  const verifiedTotal = counts.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-7 px-4 py-6 md:px-8 md:py-10">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#171c3a] px-6 py-8 text-white shadow-2xl shadow-indigo-950/15 md:px-9 md:py-10">
        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Admin workspace</p>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-[-0.04em] md:text-4xl">{t("admin.title")}</h1>
            <p className="mt-2 max-w-xl text-sm text-indigo-100/70">Monitor the question bank and keep the review pipeline moving.</p>
          </div>
          <Badge className="w-fit gap-2 border border-white/15 bg-white/10 px-3 py-2 text-white hover:bg-white/15">
            <ShieldCheck className="size-4 text-emerald-300" weight="fill" />
            {verifiedTotal} verified questions
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminAction href="/admin/ingest" icon={FileArrowUp} title={t("admin.ingestJobs")} description="Upload and process source files" />
        <AdminAction href="/admin/review" icon={ShieldCheck} title={t("admin.reviewQueue")} description={`${pendingReview} questions waiting for review`} badge={pendingReview} />
        <AdminAction href="/admin/topics" icon={ChartLineUp} title={t("admin.topics")} description="Manage the syllabus taxonomy" />
      </div>

      {flagCount > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5 shadow-none">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300"><Flag className="size-5" weight="fill" /></span>
              <div>
                <p className="font-medium">{flagCount} unresolved learner reports</p>
                <p className="text-sm text-muted-foreground">Review reported questions before the next publishing batch.</p>
              </div>
            </div>
            <Button variant="outline" nativeButton={false} render={<Link href="/admin/review" />}>Review reports <ArrowRight className="size-4" /></Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-end justify-between gap-4">
          <div>
            <CardTitle>{t("admin.stats")}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Verified coverage against the current target database.</p>
          </div>
          <ChartLineUp className="size-5 text-primary" weight="duotone" />
        </CardHeader>
        <CardContent className="space-y-5">
          {counts.map(({ sourceType, count }) => {
            const target = TARGETS[sourceType];
            const percentage = Math.min(100, Math.round((count / target.target) * 100));
            return (
              <div key={sourceType} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{target.label}</span>
                  <span className="text-muted-foreground">{count.toLocaleString()} / {target.target.toLocaleString()} ({percentage}%)</span>
                </div>
                <Progress aria-label="Import progress" value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminAction({
  href,
  icon: Icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  badge?: number;
}) {
  return (
    <Link href={href} className="group rounded-2xl border bg-background p-5 transition-colors hover:border-primary/40 hover:bg-accent/40">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary"><Icon className="size-5" weight="duotone" /></span>
        {typeof badge === "number" && <Badge variant="secondary">{badge}</Badge>}
      </div>
      <p className="mt-5 font-medium">{title}</p>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
    </Link>
  );
}
