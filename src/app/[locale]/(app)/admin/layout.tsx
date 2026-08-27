import { requireRole } from "@/lib/session";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(locale, ["REVIEWER", "ADMIN"]);

  return <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">{children}</div>;
}
