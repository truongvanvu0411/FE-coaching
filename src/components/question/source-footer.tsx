import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { SafeQuestion } from "@/lib/questions";

const SOURCE_LABEL_KEY: Record<string, string> = {
  IPA_PUBLIC: "question.sourceIpaPublic",
  IPA_EXEMPTION: "question.sourceIpaExemption",
  LEGACY_MORNING: "question.sourceLegacy",
  ORIGINAL_PRACTICE: "question.sourceOriginalPractice",
};

export function SourceFooter({ question }: { question: SafeQuestion }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="space-y-2 border-t pt-3 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{t(SOURCE_LABEL_KEY[question.sourceType] as never)}</Badge>
        {question.year && <Badge variant="outline">{question.year}</Badge>}
        {question.questionNumber && (
          <Badge variant="outline">#{question.questionNumber}</Badge>
        )}
        <Badge variant={question.verified ? "default" : "secondary"}>
          {t(question.verified ? "question.verifiedBadge" : "question.unverifiedBadge")}
        </Badge>
        {question.isObsolete && (
          <Badge variant="destructive">{t("question.obsoleteBadge")}</Badge>
        )}
      </div>

      {question.sourceType === "ORIGINAL_PRACTICE" && (
        <p className="font-medium text-foreground">
          {t("question.source")}: {t("question.sourceOriginalPractice")}
          <br />
          {t("question.sourceOriginalPracticeNotice")}
        </p>
      )}

      {question.sourceUrl && (
        <a
          href={question.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="underline"
        >
          {question.sourceUrl}
          {question.sourcePage ? ` (${question.sourcePage})` : ""}
        </a>
      )}

      <p className="text-xs">
        {locale === "vi" && question.bodyViStatus === "MT_DRAFT" && question.bodyVi
          ? "Bản dịch tiếng Việt: máy dịch nháp, chưa qua kiểm duyệt."
          : null}
      </p>
    </div>
  );
}
