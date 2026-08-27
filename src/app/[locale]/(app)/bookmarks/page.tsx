import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { ArrowRight } from "@phosphor-icons/react/ssr";

export default async function BookmarksPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const user = await requireUser(locale);

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      question: {
        select: {
          id: true,
          section: true,
          bodyJa: true,
          bodyVi: true,
          difficulty: true,
          topic: { select: { nameJa: true, nameVi: true } },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-8 md:py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2"><p className="text-sm font-medium text-primary">{t("nav.bookmarks")}</p><h1 className="font-heading text-3xl font-bold tracking-tight">{t("nav.bookmarks")}</h1><p className="text-muted-foreground">{bookmarks.length} saved questions to revisit.</p></div>
        <Button nativeButton={false} render={<Link href="/practice" />} variant="outline">{t("practice.newSession")} <ArrowRight className="size-4" /></Button>
      </div>
      <BookmarkList initialBookmarks={bookmarks} />
    </div>
  );
}
