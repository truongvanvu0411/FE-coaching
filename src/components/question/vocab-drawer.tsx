"use client";

import { useTranslations } from "next-intl";
import { BookOpenText } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { SafeQuestion } from "@/lib/questions";

export function VocabDrawer({ vocabulary }: { vocabulary: SafeQuestion["vocabulary"] }) {
  const t = useTranslations();

  if (vocabulary.length === 0) return null;

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        <BookOpenText className="h-4 w-4" />
        {t("question.vocabulary")} ({vocabulary.length})
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("question.vocabulary")}</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 overflow-y-auto px-4 pb-4">
          {vocabulary.map((item) => (
            <div key={item.id} className="border-b pb-2">
              <p className="font-medium">
                {item.termJa}
                {item.reading && (
                  <span className="ml-1 text-sm text-muted-foreground">
                    ({item.reading})
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{item.meaningVi}</p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
