"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { ArrowClockwise, CaretLeft, CaretRight, UploadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  sourceType: string;
  status: string;
  createdAt: string;
  _count: { questions: number };
};

const SOURCE_TYPES = ["IPA_PUBLIC", "IPA_EXEMPTION", "LEGACY_MORNING"];
const STATUSES = ["ALL", "UPLOADED", "OCR_RUNNING", "OCR_DONE", "PARSED", "FAILED"];

export default function IngestPage() {
  const t = useTranslations();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState(SOURCE_TYPES[0]);
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    const query = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (status !== "ALL") query.set("status", status);

    fetch(`/api/admin/ingest-jobs?${query.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setJobs(data.jobs ?? []);
        setTotal(data.pagination?.total ?? 0);
        setPageCount(data.pagination?.pageCount ?? 1);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, status, refresh]);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sourceType", sourceType);
    try {
      const res = await fetch("/api/admin/ingest-jobs", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      setFile(null);
      setPage(1);
      setRefresh((value) => value + 1);
      toast.success("Uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Admin</p>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("admin.ingestJobs")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} jobs</p>
        </div>
        <Button variant="outline" onClick={() => setRefresh((value) => value + 1)} disabled={loading}>
          <ArrowClockwise className="size-4" />
          Refresh
        </Button>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">{t("admin.uploadPdf")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("question.source")}</label>
            <Select value={sourceType} onValueChange={(value) => value && setSourceType(value)}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOURCE_TYPES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground">
            <UploadSimple className="size-4" />
            <span className="max-w-52 truncate">{file?.name ?? "Choose PDF or image"}</span>
            <input type="file" accept="application/pdf,image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="sr-only" />
          </label>
          <Button onClick={upload} disabled={!file || uploading}>
            {uploading ? t("common.loading") : t("admin.uploadPdf")}
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Select value={status} onValueChange={(value) => { setStatus(value ?? "ALL"); setPage(1); }}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map((value) => <SelectItem key={value} value={value}>{value === "ALL" ? t("common.all") : value}</SelectItem>)}</SelectContent>
        </Select>
        {pageCount > 1 && <p className="text-sm text-muted-foreground">Page {page} / {pageCount}</p>}
      </div>

      {loading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-2xl" />)}</div>}

      {!loading && error && (
        <Card className="border-dashed shadow-none">
          <CardContent className="space-y-3 p-8 text-center">
            <p className="text-sm text-muted-foreground">Unable to load ingest jobs.</p>
            <Button variant="outline" onClick={() => setRefresh((value) => value + 1)}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && jobs.length === 0 && (
        <Card className="border-dashed shadow-none">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">No ingest jobs found.</CardContent>
        </Card>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/admin/ingest/${job.id}`} className="block">
              <Card className="border-0 shadow-card transition-colors hover:bg-muted/60">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{job.fileName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{job.sourceType} · {job._count.questions} question(s)</p>
                  </div>
                  <Badge variant={job.status === "FAILED" ? "destructive" : "outline"}>{job.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && pageCount > 1 && (
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><CaretLeft className="size-4" /></Button>
          <Button variant="outline" size="icon" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}><CaretRight className="size-4" /></Button>
        </div>
      )}
    </div>
  );
}
