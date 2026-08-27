"use client";

import { useCallback, useEffect, useState, use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowClockwise, FileText } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Job = {
  id: string;
  fileName: string;
  fileUrl: string;
  sourceType: string;
  status: string;
  ocrText: string | null;
  questions: { id: string; reviewStatus: string }[];
};

type Topic = { id: string; nameJa: string; section: string };

const emptyChoice = { key: "", textJa: "" };

export default function IngestJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations();
  const [job, setJob] = useState<Job | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [runningOcr, setRunningOcr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [form, setForm] = useState({
    id: "",
    section: "A",
    topicId: "",
    difficulty: "MEDIUM",
    year: "",
    sourceUrl: "",
    sourcePage: "",
    questionNumber: "",
    bodyJa: "",
    correctAnswer: "",
    explanationJa: "",
    choices: [
      { ...emptyChoice, key: "A" },
      { ...emptyChoice, key: "B" },
      { ...emptyChoice, key: "C" },
      { ...emptyChoice, key: "D" },
    ],
  });
  const [saving, setSaving] = useState(false);

  const loadJob = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(`/api/admin/ingest-jobs/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJob(data.job ?? null);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadJob();
    fetch("/api/admin/topics")
      .then((r) => r.json())
      .then((d) => setTopics(d.topics ?? []));
  }, [loadJob]);

  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const runOcr = async () => {
    setRunningOcr(true);
    try {
      const res = await fetch(`/api/admin/ingest-jobs/${id}/ocr`, { method: "POST" });
      if (!res.ok) throw new Error();
      await loadJob();
      toast.success("OCR complete");
    } catch {
      toast.error("OCR failed");
    } finally {
      setRunningOcr(false);
    }
  };

  const submitQuestion = async () => {
    if (!job) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: form.year ? Number(form.year) : undefined,
          ingestJobId: job.id,
          sourceType: job.sourceType,
          choices: form.choices.filter((c) => c.key && c.textJa),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Question ${data.question.id} created (pending review)`);
      await loadJob();
      setForm((f) => ({ ...f, id: "", bodyJa: "", correctAnswer: "", explanationJa: "" }));
      setDirty(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-live="polite">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-[32rem] rounded-2xl" />
      </div>
    );
  }

  if (loadError) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="space-y-4 p-10 text-center">
          <p className="font-medium">Unable to load this ingest job.</p>
          <Button variant="outline" onClick={() => void loadJob()}>
            <ArrowClockwise className="size-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!job) return <p className="text-sm text-muted-foreground">Job not found.</p>;

  const completeChoices = form.choices.filter((choice) => choice.key.trim() && choice.textJa.trim()).length;
  const canSubmit = Boolean(form.id.trim() && form.bodyJa.trim() && form.topicId && form.correctAnswer && completeChoices >= 2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link href="/admin/ingest" onClick={(event) => { if (dirty && !window.confirm("Discard unsaved changes?")) event.preventDefault(); }} className="inline-flex items-center gap-1 text-sm font-medium text-primary"><ArrowLeft className="size-4" /> Back to ingest jobs</Link>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight"><FileText className="size-6 text-primary" weight="duotone" />{job.fileName}</h1>
          <p className="text-sm text-muted-foreground">{job.sourceType} · {job.questions.length} questions extracted</p>
        </div>
        <Badge variant="outline" className="w-fit">{job.status}</Badge>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">OCR / PDF Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={runOcr} disabled={runningOcr}>
            {runningOcr ? t("common.loading") : "Run OCR / Extract Text"}
          </Button>
          {!job.ocrText && <p className="text-sm text-muted-foreground">Run OCR to extract text from this source file.</p>}
          {job.ocrText && (
            <Textarea readOnly value={job.ocrText} rows={12} className="font-mono text-xs" />
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Split into a question (human verification)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Question ID</Label>
              <Input
                value={form.id}
                onChange={(e) => { setDirty(true); setForm((f) => ({ ...f, id: e.target.value })); }}
                placeholder="FE-A-2025-PUBLIC-001"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("question.section")}</Label>
              <Select
                value={form.section}
                onValueChange={(v) => { setDirty(true); setForm((f) => ({ ...f, section: v ?? f.section })); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("question.topic")}</Label>
              <Select
                value={form.topicId}
                onValueChange={(v) => { setDirty(true); setForm((f) => ({ ...f, topicId: v ?? f.topicId })); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics
                    .filter((topic) => topic.section === form.section)
                    .map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.nameJa}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("question.difficulty")}</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) => { setDirty(true); setForm((f) => ({ ...f, difficulty: v ?? f.difficulty })); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">{t("question.difficultyEasy")}</SelectItem>
                  <SelectItem value="MEDIUM">{t("question.difficultyMedium")}</SelectItem>
                  <SelectItem value="HARD">{t("question.difficultyHard")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input value={form.year} onChange={(e) => { setDirty(true); setForm((f) => ({ ...f, year: e.target.value })); }} />
            </div>
            <div className="space-y-1.5">
              <Label>Question #</Label>
              <Input
                value={form.questionNumber}
                onChange={(e) => { setDirty(true); setForm((f) => ({ ...f, questionNumber: e.target.value })); }}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Source URL</Label>
              <Input
                value={form.sourceUrl}
                onChange={(e) => { setDirty(true); setForm((f) => ({ ...f, sourceUrl: e.target.value })); }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Question body (JA)</Label>
            <Textarea
              value={form.bodyJa}
              onChange={(e) => { setDirty(true); setForm((f) => ({ ...f, bodyJa: e.target.value })); }}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Choices</Label>
            {form.choices.map((choice, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  className="w-16"
                  value={choice.key}
                  onChange={(e) => {
                    const choices = [...form.choices];
                    choices[i] = { ...choice, key: e.target.value };
                    setDirty(true);
                    setForm((f) => ({ ...f, choices }));
                  }}
                />
                <Input
                  value={choice.textJa}
                  onChange={(e) => {
                    const choices = [...form.choices];
                    choices[i] = { ...choice, textJa: e.target.value };
                    setDirty(true);
                    setForm((f) => ({ ...f, choices }));
                  }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Correct answer (from official answer key)</Label>
            <Input
              value={form.correctAnswer}
              onChange={(e) => { setDirty(true); setForm((f) => ({ ...f, correctAnswer: e.target.value })); }}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("question.explanation")}</Label>
            <Textarea
              value={form.explanationJa}
              onChange={(e) => { setDirty(true); setForm((f) => ({ ...f, explanationJa: e.target.value })); }}
              rows={3}
            />
          </div>

          <Button onClick={submitQuestion} disabled={saving || !canSubmit}>
            {saving ? t("common.loading") : `${t("common.save")} · ${t("admin.reviewQueue")}`}
          </Button>
        </CardContent>
      </Card>

      {job.questions.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Questions from this job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {job.questions.map((q) => (
              <div key={q.id} className="flex justify-between text-sm">
                <span>{q.id}</span>
                <Badge variant="outline">{q.reviewStatus}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
