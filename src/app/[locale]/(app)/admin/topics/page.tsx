"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Topic = { id: string; section: string; nameJa: string; nameVi: string };

export default function TopicsPage() {
  const t = useTranslations();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [form, setForm] = useState({ section: "A", nameJa: "", nameVi: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/topics");
    const data = await res.json();
    setTopics(data.topics ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setForm({ section: "A", nameJa: "", nameVi: "" });
      await load();
      toast.success("Topic created");
    } catch {
      toast.error("Failed to create topic");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("admin.topics")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New topic</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label>{t("question.section")}</Label>
            <Select value={form.section} onValueChange={(v) => setForm((f) => ({ ...f, section: v ?? f.section }))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Name (JA)</Label>
            <Input value={form.nameJa} onChange={(e) => setForm((f) => ({ ...f, nameJa: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Name (VI)</Label>
            <Input value={form.nameVi} onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))} />
          </div>
          <Button onClick={create} disabled={saving || !form.nameJa || !form.nameVi}>
            {t("common.save")}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {topics.map((topic) => (
          <Card key={topic.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="font-medium">{topic.nameJa}</p>
                <p className="text-sm text-muted-foreground">{topic.nameVi}</p>
              </div>
              <Badge variant="outline">{topic.section}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
