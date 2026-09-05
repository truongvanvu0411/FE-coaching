"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkle, Translate, MagicWand, PaperPlaneTilt, CircleNotch, ChatsCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ChatEntry = { role: "user" | "assistant"; content: string };
type TutorAction = "explain" | "translate" | "chat";

export function TutorPanel({ questionId }: { questionId: string }) {
  const t = useTranslations();
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history, loading]);

  const run = async (action: TutorAction, userMessage?: string) => {
    setLoading(true);
    if (userMessage) {
      setHistory((h) => [...h, { role: "user", content: userMessage }]);
    }
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, action, message: userMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "error");
      setHistory((h) => [...h, { role: "assistant", content: data.content }]);
    } catch {
      toast.error("AI tutor error");
    } finally {
      setLoading(false);
    }
  };

  const generateSimilar = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tutor/generate-similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "error");
      toast.success(`Draft ${data.draftId} sent to reviewer queue`);
    } catch {
      toast.error("AI tutor error");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <TutorContent
      history={history}
      message={message}
      setMessage={setMessage}
      loading={loading}
      run={run}
      generateSimilar={generateSimilar}
      bottomRef={bottomRef}
    />
  );

  return (
    <>
      <div className="hidden md:block">
        <Card className="border-0 shadow-card lg:sticky lg:top-6 lg:min-h-[620px]">
          <CardHeader className="border-b bg-muted/20 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkle className="size-4 text-primary" weight="duotone" />
              {t("tutor.title")}
            </CardTitle>
          </CardHeader>
          {content}
        </Card>
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" className="w-full" />}>
            <ChatsCircle className="size-4" weight="duotone" />
            {t("tutor.title")}
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[88vh] rounded-t-3xl px-0">
            <SheetHeader className="border-b px-5 pb-4">
              <SheetTitle className="flex items-center gap-2">
                <Sparkle className="size-4 text-primary" weight="duotone" />
                {t("tutor.title")}
              </SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto px-5 pb-6 pt-4">{content}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function TutorContent({
  history,
  message,
  setMessage,
  loading,
  run,
  generateSimilar,
  bottomRef,
}: {
  history: ChatEntry[];
  message: string;
  setMessage: (message: string) => void;
  loading: boolean;
  run: (action: TutorAction, userMessage?: string) => void;
  generateSimilar: () => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  const t = useTranslations();

  return (
    <CardContent className="flex flex-col space-y-4 p-5 lg:min-h-[530px]">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" disabled={loading} onClick={() => run("explain")}>
          <Sparkle className="size-4" />
          {t("tutor.explain")}
        </Button>
        <Button size="sm" variant="secondary" disabled={loading} onClick={() => run("translate")}>
          <Translate className="size-4" />
          {t("tutor.translate")}
        </Button>
        <Button size="sm" variant="secondary" disabled={loading} onClick={generateSimilar}>
          <MagicWand className="size-4" />
          {t("tutor.generateSimilar")}
        </Button>
      </div>

      {history.length > 0 && (
        <ScrollArea className="max-h-[min(52vh,38rem)] rounded-xl border bg-muted/30 p-4 text-[0.98rem] leading-7">
          <div className="space-y-3">
            {history.map((entry, i) =>
              entry.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground">
                    {entry.content}
                  </p>
                </div>
              ) : (
                <div key={i} className="rounded-2xl rounded-bl-md border bg-background px-3 py-2">
                  <div
                    className={cn(
                      "prose dark:prose-invert max-w-none",
                      "prose-headings:mt-3 prose-headings:mb-1 prose-headings:font-semibold prose-headings:first:mt-0",
                      "prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5",
                      "prose-strong:font-semibold prose-strong:text-foreground",
                    )}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.content}</ReactMarkdown>
                  </div>
                </div>
              ),
            )}
            {loading && (
              <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm text-muted-foreground">
                <CircleNotch className="size-3.5 animate-spin" />
                {t("tutor.thinking")}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      )}

      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const value = message.trim();
              if (value && !loading) {
                setMessage("");
                void run("chat", value);
              }
            }
          }}
          placeholder={t("tutor.askPlaceholder")}
          rows={1}
          className="min-h-10 resize-none"
        />
        <Button
          size="icon"
          className="size-10"
          aria-label={t("common.submit")}
          disabled={loading || message.trim().length === 0}
          onClick={() => {
            const value = message.trim();
            setMessage("");
            void run("chat", value);
          }}
        >
          <PaperPlaneTilt className="size-4" />
        </Button>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">{t("tutor.disclaimer")}</p>
    </CardContent>
  );
}
