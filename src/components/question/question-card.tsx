"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Bookmark, CheckCircle, XCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SourceFooter } from "./source-footer";
import { VocabDrawer } from "./vocab-drawer";
import { FlagDialog } from "./flag-dialog";
import { TutorPanel } from "@/components/tutor/tutor-panel";
import type { SafeQuestion } from "@/lib/questions";

export type AnswerResult = {
  isCorrect: boolean;
  correctAnswer: string;
  explanationJa: string | null;
  explanationVi: string | null;
};

export function QuestionCard({
  question,
  mode = "practice",
  initialBookmarked = false,
  showTutor = true,
  initialChosen = null,
  initialResult = null,
  onAnswered,
}: {
  question: SafeQuestion;
  mode?: "practice" | "mock_exam";
  initialBookmarked?: boolean;
  showTutor?: boolean;
  initialChosen?: string | null;
  initialResult?: AnswerResult | null;
  onAnswered?: (result: AnswerResult & { chosenAnswer: string }) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [chosen, setChosen] = useState<string | null>(initialChosen);
  const [result, setResult] = useState<AnswerResult | null>(initialResult);
  const [submitting, setSubmitting] = useState(false);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const body = locale === "vi" && question.bodyVi ? question.bodyVi : question.bodyJa;

  const submit = async (key: string) => {
    if (result) return;
    setChosen(key);
    setSubmitting(true);
    try {
      const res = await fetch("/api/practice/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, chosenAnswer: key, mode }),
      });
      const data: AnswerResult = await res.json();
      if (!res.ok) throw new Error();
      setResult(data);
      onAnswered?.({ ...data, chosenAnswer: key });
    } catch {
      toast.error("Error submitting answer");
      setChosen(null);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBookmark = async () => {
    setBookmarked((b) => !b);
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id }),
    });
    if (!res.ok) setBookmarked((b) => !b);
  };

  const explanation = locale === "vi" && question.bodyViStatus
    ? result?.explanationVi ?? result?.explanationJa
    : result?.explanationJa;

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b bg-muted/20">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{question.section}</Badge>
            <Badge variant="outline">
              {locale === "vi" ? question.topic.nameVi : question.topic.nameJa}
            </Badge>
            <Badge variant="outline">{t(`question.difficulty${capitalize(question.difficulty)}` as never)}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <VocabDrawer vocabulary={question.vocabulary} />
            <Button variant="ghost" size="icon" onClick={toggleBookmark} aria-label={t("question.bookmark")} aria-pressed={bookmarked}>
              <Bookmark
                className={cn("h-4 w-4", bookmarked && "text-primary")}
                weight={bookmarked ? "fill" : "regular"}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-[0.98rem] leading-7 md:text-base md:leading-7">{body}</p>

          <div className="space-y-2">
            {question.choices.map((choice) => {
              const isChosen = chosen === choice.key;
              const isCorrectChoice = result && choice.key === result.correctAnswer;
              const isWrongChosen = result && isChosen && !result.isCorrect;

              return (
                <button
                  key={choice.id}
                  type="button"
                  disabled={!!result || submitting}
                  onClick={() => submit(choice.key)}
                  className={cn(
                    "flex w-full min-h-14 items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-sm leading-6 transition-all",
                    !result && "hover:border-primary/40 hover:bg-muted",
                    isChosen && !result && "border-primary ring-1 ring-primary/30",
                    isCorrectChoice && "border-success bg-success/10",
                    isWrongChosen && "border-destructive bg-destructive/10",
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted font-semibold">{choice.key}</span>
                  <span>{locale === "vi" && choice.textVi ? choice.textVi : choice.textJa}</span>
                </button>
              );
            })}
          </div>

          {result && (
            <div className="space-y-2 rounded-xl bg-muted p-4">
              <p className="flex items-center gap-2 font-medium">
                  {result.isCorrect ? (
                  <CheckCircle weight="fill" className="h-5 w-5 text-success" />
                ) : (
                  <XCircle weight="fill" className="h-5 w-5 text-destructive" />
                )}
                <span>{result.isCorrect ? t("question.correctAnswer") : t("question.yourAnswer")}: {result.isCorrect ? result.correctAnswer : chosen}</span>
              </p>
              {explanation && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("question.explanation")}
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{explanation}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <FlagDialog questionId={question.id} />
          </div>

          <SourceFooter question={question} />
        </CardContent>
      </Card>

      {showTutor && result && <TutorPanel questionId={question.id} />}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}
