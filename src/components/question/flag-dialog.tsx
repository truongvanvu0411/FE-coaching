"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Flag } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FlagDialog({ questionId }: { questionId: string }) {
  const t = useTranslations();
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, reason }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("common.submit"));
      setReason("");
      setOpen(false);
    } catch {
      toast.error("Error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Flag className="h-4 w-4" />
        {t("question.flagQuestion")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("question.flagQuestion")}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("question.flagReason")}
          rows={4}
        />
        <DialogFooter>
          <Button
            onClick={submit}
            disabled={submitting || reason.trim().length === 0}
          >
            {t("common.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
