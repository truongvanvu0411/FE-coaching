import { requireUser } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireUser(locale);

  return (
    <AppShell role={user.role} name={user.name} email={user.email}>
      {children}
    </AppShell>
  );
}
