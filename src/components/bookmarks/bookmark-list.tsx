"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { BookmarkSimple, Trash } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Bookmark = {
  question: {
    id: string;
    section: string;
    bodyJa: string;
    bodyVi: string | null;
    difficulty: string;
    topic: { nameJa: string; nameVi: string };
  };
};

export function BookmarkList({ initialBookmarks }: { initialBookmarks: Bookmark[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [removing, setRemoving] = useState<string | null>(null);

  const remove = async (questionId: string) => {
    setRemoving(questionId);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      if (!res.ok) throw new Error();
      setBookmarks((items) => items.filter((item) => item.question.id !== questionId));
    } catch {
      toast.error("Unable to remove bookmark");
    } finally {
      setRemoving(null);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="space-y-4 p-10 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent text-primary"><BookmarkSimple className="size-6" weight="duotone" /></span>
          <div><p className="font-medium">No saved questions yet</p><p className="mt-1 text-sm text-muted-foreground">Save questions during practice to review them here.</p></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map(({ question }) => (
        <Card key={question.id} className="border-0 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{question.section}</Badge>
                <Badge variant="outline">{locale === "vi" ? question.topic.nameVi : question.topic.nameJa}</Badge>
                <Badge variant="secondary">{question.difficulty}</Badge>
              </div>
              <Button variant="ghost" size="icon" aria-label={t("question.bookmark")} disabled={removing === question.id} onClick={() => void remove(question.id)}>
                <Trash className="size-4 text-muted-foreground" />
              </Button>
            </div>
            <p className="line-clamp-3 text-sm leading-6">{locale === "vi" && question.bodyVi ? question.bodyVi : question.bodyJa}</p>
            <p className="text-xs text-muted-foreground">{question.id}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
