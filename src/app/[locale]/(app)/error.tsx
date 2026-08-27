"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations();

  return (
    <div className="mx-auto max-w-xl p-4 py-16 md:p-10">
      <Card className="border-dashed shadow-none">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="font-heading text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">Please try loading this page again.</p>
          <Button onClick={reset}>{t("admin.retry")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
