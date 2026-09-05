"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CaretLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

type ReviewAudit = {
  session: string;
  questionNumber: string;
  mappingStatus: string;
  parseConfidence: number;
  needsVisualReview: boolean;
  issues: string[];
  risk: "P0" | "P1" | "P2";
  duplicate: boolean;
  sourceImageUrl: string;
};
type ChoiceKey = "A" | "B" | "C" | "D";
type Question = {
  id: string;
  section: string;
  sourceType: string;
  bodyJa: string;
  correctAnswer: string;
  reviewStatus: string;
  topic: { nameJa: string };
  choices: { key: string; textJa: string }[];
  reviewAudit: ReviewAudit | null;
};
type Draft = { bodyJa: string; choices: Record<ChoiceKey, string>; correctAnswer: ChoiceKey };
type DuplicateCandidate = { id: string; bodyJa: string; score: number; verified: boolean };

export default function ReviewQueuePage() {
  const t = useTranslations();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [duplicates, setDuplicates] = useState<Record<string, DuplicateCandidate[]>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [risk, setRisk] = useState<"ALL" | "P0" | "P1">("ALL");
  const [issue, setIssue] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [sourceChecked, setSourceChecked] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    const riskParam = risk === "ALL" ? "" : `&risk=${risk}`;
    const issueParam = issue === "ALL" ? "" : `&issue=${encodeURIComponent(issue)}`;
    fetch(`/api/admin/questions?reviewStatus=PENDING_REVIEW&sourceType=IPA_EXEMPTION&page=${page}&pageSize=20&q=${encodeURIComponent(submittedSearch)}${riskParam}${issueParam}`)
      .then(async (res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => {
        if (cancelled) return;
        const nextQuestions = (data.questions ?? []) as Question[];
        const nextDrafts: Record<string, Draft> = {};
        for (const question of nextQuestions) {
          const choices = Object.fromEntries(question.choices.map((choice) => [choice.key, choice.textJa])) as Record<ChoiceKey, string>;
          nextDrafts[question.id] = { bodyJa: question.bodyJa, choices, correctAnswer: question.correctAnswer as ChoiceKey };
        }
        setQuestions(nextQuestions);
        setDrafts(nextDrafts);
        setSourceChecked(new Set());
        setTotal(data.pagination?.total ?? 0);
        setPageCount(data.pagination?.pageCount ?? 1);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, submittedSearch, risk, issue, refresh]);

  const checkDuplicates = async (id: string) => {
    const res = await fetch(`/api/admin/questions/${id}/duplicates`);
    const data = await res.json();
    setDuplicates((current) => ({ ...current, [id]: data.candidates ?? [] }));
  };

  const updateDraft = (id: string, patch: Partial<Draft>) => setDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }));

  const draftPayload = (draft?: Draft) => draft ? {
    bodyJa: draft.bodyJa,
    correctAnswer: draft.correctAnswer,
    choices: (Object.entries(draft.choices) as [ChoiceKey, string][]).map(([key, textJa]) => ({ key, textJa })),
  } : {};

  const saveDraft = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update", ...draftPayload(drafts[id]) }) });
      if (!res.ok) throw new Error();
      toast.success("Đã lưu bản sửa OCR");
    } catch { toast.error("Không thể lưu bản sửa"); }
    finally { setBusyId(null); }
  };

  const act = async (id: string, action: "verify" | "reject") => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sourceChecked: sourceChecked.has(id), ...draftPayload(drafts[id]) }),
      });
      if (!res.ok) throw new Error();
      toast.success(action === "verify" ? "Verified & published" : "Rejected");
      setRefresh((value) => value + 1);
    } catch { toast.error("Action failed"); }
    finally { setBusyId(null); }
  };

  const markSourceChecked = (id: string, checked: boolean) => setSourceChecked((current) => {
    const next = new Set(current);
    if (checked) next.add(id); else next.delete(id);
    return next;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Admin · IPA exemption</p>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("admin.reviewQueue")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} quarantined questions · source đối chiếu trước khi publish</p>
        </div>
        <form className="flex w-full flex-wrap gap-2 sm:max-w-xl" onSubmit={(event) => { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }}>
          <div className="relative min-w-0 flex-1"><MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("admin.searchPlaceholder")} className="pl-9" /></div>
          <select value={risk} onChange={(event) => { setRisk(event.target.value as "ALL" | "P0" | "P1"); setPage(1); }} className="h-9 rounded-md border bg-background px-2 text-sm"><option value="ALL">Tất cả mức độ</option><option value="P0">P0 · cần xử lý trước</option><option value="P1">P1 · cần đối chiếu</option></select>
          <select value={issue} onChange={(event) => { setIssue(event.target.value); setPage(1); }} className="h-9 rounded-md border bg-background px-2 text-sm"><option value="ALL">Tất cả lỗi</option><option value="duplicate">Duplicate</option><option value="mapping_review">Mapping</option><option value="visual_review">Visual</option><option value="low_confidence">Confidence</option><option value="short_body">Body ngắn</option></select>
          <Button type="submit" variant="outline">{t("common.search")}</Button>
        </form>
      </div>

      <Card className="border-state-bookmark/40 bg-state-bookmark/10 shadow-none"><CardContent className="p-4 text-sm text-foreground"><strong>Review rule:</strong> mở scan gốc, sửa body/4 choices nếu OCR sai, chọn đáp án chính thức, rồi mới verify. Không có bulk verification.</CardContent></Card>

      {loading && <div className="space-y-4" aria-live="polite">{Array.from({ length: 3 }).map((_, index) => <Card key={index}><CardContent className="space-y-4 p-6"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-16 w-full" /><Skeleton className="h-9 w-48" /></CardContent></Card>)}</div>}
      {!loading && error && <Card className="border-dashed shadow-none"><CardContent className="space-y-3 p-8 text-center"><p className="text-sm text-muted-foreground">Unable to load the review queue.</p><Button variant="outline" onClick={() => setRefresh((value) => value + 1)}>{t("admin.retry")}</Button></CardContent></Card>}
      {!loading && !error && questions.length === 0 && <Card className="border-dashed shadow-none"><CardContent className="p-10 text-center"><p className="font-medium">{t("admin.emptyQueue")}</p><p className="mt-1 text-sm text-muted-foreground">Try another search or check back later.</p></CardContent></Card>}

      {!loading && !error && questions.map((q) => {
        const audit = q.reviewAudit;
        const checked = sourceChecked.has(q.id);
        const draft = drafts[q.id];
        return <Card key={q.id} className="border-0 shadow-card">
          <CardHeader className="flex flex-col gap-3 border-b bg-muted/20 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="text-base">{q.id}</CardTitle><div className="flex flex-wrap gap-2"><Badge variant="outline">{q.section}</Badge><Badge variant="outline">{q.sourceType}</Badge><Badge variant="outline">{q.topic.nameJa}</Badge><Badge variant={audit?.risk === "P0" ? "destructive" : "secondary"}>{audit?.risk ?? "NO_AUDIT"}</Badge></div></CardHeader>
          <CardContent className="space-y-4 p-5">
            {audit && <div className="rounded-xl border bg-muted/30 p-3 text-xs"><div className="flex flex-wrap gap-x-4 gap-y-1"><span>Source: {audit.session} · {audit.questionNumber}</span><span>OCR: {Math.round(audit.parseConfidence * 100)}%</span><span>Mapping: {audit.mappingStatus}</span></div>{audit.issues.length > 0 && <p className="mt-2 text-destructive">Issues: {audit.issues.join(", ")}</p>}<details className="mt-3"><summary className="cursor-pointer font-medium">Mở scan gốc để đối chiếu</summary><div className="mt-3 overflow-auto rounded-lg border bg-background p-2"><img src={audit.sourceImageUrl} alt={`${audit.session} ${audit.questionNumber} original scan`} className="max-h-[560px] w-full object-contain" /></div><label className="mt-3 flex items-start gap-2 font-medium"><input type="checkbox" checked={checked} onChange={(event) => markSourceChecked(q.id, event.target.checked)} className="mt-0.5 size-4 accent-primary" />Đã đối chiếu scan, nội dung, đủ 4 lựa chọn và đáp án.</label></details></div>}
            {draft && <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4"><div><label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nội dung sau khi đối chiếu</label><Textarea value={draft.bodyJa} onChange={(event) => updateDraft(q.id, { bodyJa: event.target.value })} rows={4} className="mt-1 bg-background" /></div><div className="grid gap-2 sm:grid-cols-2">{(["A", "B", "C", "D"] as ChoiceKey[]).map((key) => <div key={key}><label className="text-xs font-semibold text-muted-foreground">{key}</label><Input value={draft.choices[key] ?? ""} onChange={(event) => updateDraft(q.id, { choices: { ...draft.choices, [key]: event.target.value } })} className="mt-1 bg-background" /></div>)}</div><label className="flex items-center gap-2 text-sm font-medium">Đáp án chính thức<select value={draft.correctAnswer} onChange={(event) => updateDraft(q.id, { correctAnswer: event.target.value as ChoiceKey })} className="rounded-md border bg-background px-2 py-1"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></label><Button size="sm" variant="outline" onClick={() => saveDraft(q.id)} disabled={busyId === q.id}>Lưu bản sửa</Button></div>}
            <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => act(q.id, "verify")} disabled={busyId === q.id || !checked}>{t("admin.markVerified")}</Button><Button size="sm" variant="destructive" onClick={() => act(q.id, "reject")} disabled={busyId === q.id}>{t("common.reject")}</Button><Button size="sm" variant="outline" onClick={() => checkDuplicates(q.id)} disabled={busyId === q.id}>{t("admin.duplicateCandidates")}</Button></div>
            {duplicates[q.id] && <div className="space-y-1 rounded-xl border bg-muted/30 p-3 text-xs">{duplicates[q.id].length === 0 && <p>No similar questions found.</p>}{duplicates[q.id].map((d) => <p key={d.id}>[{Math.round(d.score * 100)}%] {d.id}: {d.bodyJa.slice(0, 80)}...</p>)}</div>}
          </CardContent>
        </Card>;
      })}

      {!loading && !error && pageCount > 1 && <div className="flex items-center justify-between border-t pt-4"><p className="text-sm text-muted-foreground">{t("admin.pageOf", { page, total: pageCount })}</p><div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><CaretLeft className="size-4" /></Button><Button variant="outline" size="icon" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}><CaretRight className="size-4" /></Button></div></div>}
    </div>
  );
}
