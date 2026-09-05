"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkle, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { TutorPanel } from "@/components/tutor/tutor-panel";
import { cn } from "@/lib/utils";

/**
 * The reference's floating circular button, bottom-right.
 *
 * It renders nothing until `enabled` — the tutor must stay unreachable before
 * the learner has committed to an answer, which is a correctness rule rather
 * than a layout choice: being able to read the explanation and then pick would
 * make every attempt meaningless. The caller owns that condition, exactly as the
 * inline panel it replaces did.
 */
export function TutorFab({
  questionId,
  enabled,
  remaining,
}: {
  questionId: string;
  enabled: boolean;
  remaining?: number;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  if (!enabled) return null;

  // /api/tutor allows 30 calls an hour. Surfacing the number only near the limit
  // keeps it out of the way until it starts to matter.
  const showQuota = typeof remaining === "number" && remaining < 5;

  return (
    <>
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-card p-4 shadow-sheet md:inset-auto md:bottom-24 md:right-6 md:w-[420px] md:rounded-3xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-title font-bold">{t("tutor.title")}</p>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label={t("common.close")}>
              <X className="size-4" weight="bold" />
            </Button>
          </div>
          <TutorPanel questionId={questionId} bare />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={t("tutor.title")}
        className={cn(
          // Clears the mobile bottom navigation, which is 4.5rem plus the safe area.
          "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-50 flex size-14 items-center justify-center",
          "rounded-full bg-primary text-primary-foreground shadow-fab transition-transform",
          "hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "md:bottom-6 md:right-6",
        )}
      >
        {open ? <X className="size-6" weight="bold" /> : <Sparkle className="size-6" weight="fill" />}
        {showQuota && !open && (
          <span className="absolute -right-1 -top-1 flex min-w-6 items-center justify-center rounded-full bg-state-bookmark px-1.5 text-caption font-bold text-background">
            {remaining}
          </span>
        )}
      </button>
    </>
  );
}
