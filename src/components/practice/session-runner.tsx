"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionCard, type AnswerResult } from "@/components/question/question-card";
import { TutorPanel } from "@/components/tutor/tutor-panel";
import type { SafeQuestion } from "@/lib/questions";
import { cn } from "@/lib/utils";

type StoredAnswer = { chosenAnswer: string; result: AnswerResult };
type StoredSession = {
  index: number;
  maxVisited: number;
  secondsLeft: number;
  answers: Record<string, StoredAnswer>;
  updatedAt: number;
};

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function SessionRunner({
  questions,
  bookmarkedIds,
  mode,
  showTutor = true,
  timeLimitSeconds,
}: {
  questions: SafeQuestion[];
  bookmarkedIds: Set<string>;
  mode: "practice" | "mock_exam";
  showTutor?: boolean;
  timeLimitSeconds?: number;
}) {
  const t = useTranslations();
  const [index, setIndex] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StoredAnswer>>({});
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds ?? 0);
  const [hydrated, setHydrated] = useState(false);
  const sessionKey = useMemo(
    () => `fe-coach:session:${mode}:${questions.map((question) => question.id).join(",")}`,
    [mode, questions],
  );

  const question = questions[index];
  const currentAnswer = question ? answers[question.id] : undefined;
  const answered = Boolean(currentAnswer);
  const score = Object.values(answers).filter((answer) => answer.result.isCorrect).length;
  const timeExpired = timeLimitSeconds != null && secondsLeft <= 0;
  const done = finished || timeExpired;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(sessionKey);
      if (raw) {
        const saved = JSON.parse(raw) as StoredSession;
        if (Date.now() - saved.updatedAt < SESSION_TTL_MS) {
          setIndex(Math.min(Math.max(saved.index, 0), Math.max(questions.length - 1, 0)));
          setMaxVisited(Math.min(Math.max(saved.maxVisited, 0), Math.max(questions.length - 1, 0)));
          setAnswers(saved.answers ?? {});
          if (timeLimitSeconds != null && saved.secondsLeft > 0) setSecondsLeft(saved.secondsLeft);
        } else {
          window.localStorage.removeItem(sessionKey);
        }
      }
    } catch {
      window.localStorage.removeItem(sessionKey);
    } finally {
      setHydrated(true);
    }
  }, [questions.length, sessionKey, timeLimitSeconds]);

  useEffect(() => {
    if (!timeLimitSeconds || timeExpired || done) return;
    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [done, timeExpired, timeLimitSeconds]);

  useEffect(() => {
    if (!hydrated || done || questions.length === 0) return;
    const payload: StoredSession = {
      index,
      maxVisited,
      secondsLeft,
      answers,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(sessionKey, JSON.stringify(payload));
  }, [answers, done, hydrated, index, maxVisited, questions.length, secondsLeft, sessionKey]);

  useEffect(() => {
    if (done && typeof window !== "undefined") window.localStorage.removeItem(sessionKey);
  }, [done, sessionKey]);

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl p-4 md:p-10">
        <Card className="border-0 shadow-xl"><CardContent className="p-10 text-center text-sm text-muted-foreground">No questions available.</CardContent></Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-4 md:p-10">
        <Card className="overflow-hidden border-0 shadow-2xl shadow-indigo-950/10">
          <CardContent className="space-y-5 bg-[#171c3a] p-10 text-center text-white">
            <h2 className="text-xl font-bold">{t("practice.sessionComplete")}</h2>
            <p className="text-5xl font-bold tracking-tight text-indigo-200">{score} / {questions.length}</p>
            <p className="text-indigo-100/65">{t("practice.score")}</p>
            <Button nativeButton={false} render={<Link href={mode === "mock_exam" ? "/mock-exam" : "/practice"} />}>{t("common.back")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const goTo = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex > maxVisited) return;
    setIndex(nextIndex);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setMaxVisited((value) => Math.max(value, index + 1));
    setIndex((value) => value + 1);
  };

  const resetSession = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset this session and clear your answers?")) return;
    window.localStorage.removeItem(sessionKey);
    setIndex(0);
    setMaxVisited(0);
    setAnswers({});
    setSecondsLeft(timeLimitSeconds ?? 0);
  };

  return (
    <div className="mx-auto max-w-[1320px] space-y-5 px-4 py-5 md:px-8 md:py-8">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-border dark:bg-card md:px-5">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-[0.16em] text-primary">{mode === "mock_exam" ? t("nav.mockExam") : t("nav.practice")}</p>
          <p className="mt-1 text-sm font-semibold">{index + 1} / {questions.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={resetSession} aria-label="Reset session"><ArrowClockwise className="size-4" /></Button>
          <div className={cn("rounded-xl px-3 py-2 text-xs font-bold", timeLimitSeconds && secondsLeft < 60 ? "bg-destructive/10 text-destructive" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200")}>
            {timeLimitSeconds ? `${t("mockExam.timeRemaining")}: ${formatTime(secondsLeft)}` : `${t("practice.score")}: ${score}`}
          </div>
        </div>
      </div>
      <Progress aria-label="Practice progress" value={((index + (answered ? 1 : 0)) / questions.length) * 100} className="h-2" />

      <QuestionNavigator questions={questions} index={index} maxVisited={maxVisited} answers={answers} onSelect={goTo} compact />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="min-w-0">
          <QuestionCard
            key={question.id}
            question={question}
            mode={mode}
            initialBookmarked={bookmarkedIds.has(question.id)}
            initialChosen={currentAnswer?.chosenAnswer}
            initialResult={currentAnswer?.result}
            showTutor={false}
            onAnswered={(result) => {
              setAnswers((current) => ({ ...current, [question.id]: { chosenAnswer: result.chosenAnswer, result } }));
              setMaxVisited((value) => Math.max(value, index));
            }}
          />

          {showTutor && answered && <div className="mt-4 lg:hidden"><TutorPanel questionId={question.id} /></div>}

          {answered && (
            <div className="sticky bottom-20 z-10 mt-4 flex justify-end md:static">
              <Button size="lg" className="w-full shadow-lg sm:w-auto" onClick={next}>{t("common.next")}</Button>
            </div>
          )}
        </div>

        <aside className="hidden space-y-5 lg:sticky lg:top-6 lg:block">
          {showTutor && answered && <TutorPanel questionId={question.id} />}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-border dark:bg-card">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Progress</p>
            <QuestionNavigator questions={questions} index={index} maxVisited={maxVisited} answers={answers} onSelect={goTo} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function QuestionNavigator({
  questions,
  index,
  maxVisited,
  answers,
  onSelect,
  compact = false,
}: {
  questions: SafeQuestion[];
  index: number;
  maxVisited: number;
  answers: Record<string, StoredAnswer>;
  onSelect: (index: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex gap-2", compact ? "overflow-x-auto pb-1 lg:hidden" : "grid grid-cols-5 gap-2")} aria-label="Question navigator">
      {questions.map((item, itemIndex) => {
        const isCurrent = itemIndex === index;
        const isDone = Boolean(answers[item.id]);
        const disabled = itemIndex > maxVisited;
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            aria-current={isCurrent ? "step" : undefined}
            aria-label={`Question ${itemIndex + 1}${isDone ? ", answered" : ""}`}
            onClick={() => onSelect(itemIndex)}
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              isCurrent && "bg-primary text-primary-foreground",
              !isCurrent && isDone && "bg-success/15 text-success",
              !isCurrent && !isDone && "bg-muted text-muted-foreground",
            )}
          >
            {itemIndex + 1}
          </button>
        );
      })}
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
