"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { LocaleSwitcher } from "./locale-switcher";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import type { Role } from "@/generated/prisma/enums";

export function AppShell({
  role,
  name,
  email,
  children,
}: {
  role: Role;
  name?: string | null;
  email?: string | null;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
  const primaryItems = items.filter((item) => item.href !== "/admin");
  const adminItems = items.filter((item) => item.href === "/admin");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#f6f7fb] md:flex dark:bg-[#0b1020]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col bg-[#111827] text-white shadow-2xl shadow-slate-950/10 md:flex">
        <div className="flex h-24 items-center gap-3 px-7">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold shadow-lg shadow-indigo-500/30">
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-300 ring-2 ring-[#111827]" />
            FE
          </span>
          <div>
            <p className="font-heading text-sm font-bold tracking-tight text-white">{t("common.appName")}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{t("common.tagline")}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-5" aria-label="Primary navigation">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
          {primaryItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all",
                  active
                    ? "bg-white/12 text-white shadow-inner shadow-white/5"
                    : "text-slate-400 hover:bg-white/6 hover:text-white",
                )}
              >
                {active && (
                  <span className="absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-400" />
                )}
                <item.icon className="h-4 w-4" weight={active ? "fill" : "regular"} />
                {t(item.labelKey as never)}
              </Link>
            );
          })}
          {adminItems.length > 0 && (
            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Admin</p>
              {adminItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all",
                      active ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/6 hover:text-white",
                    )}
                  >
                    <item.icon className="h-4 w-4" weight={active ? "fill" : "regular"} />
                    {t(item.labelKey as never)}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
        <div className="mx-4 mb-5 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
          <LocaleSwitcher />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu name={name} email={email} />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex h-[4.5rem] items-center justify-between border-b bg-white px-4 shadow-sm dark:bg-[#111827] md:hidden">
        <span className="flex items-center gap-2 font-heading font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">FE</span>
          {t("common.appName")}
        </span>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <UserMenu name={name} email={email} />
        </div>
      </header>

      <main className="min-w-0 flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(4.5rem+env(safe-area-inset-bottom))] border-t bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_35px_rgba(15,23,42,0.1)] backdrop-blur dark:bg-[#111827]/95 md:hidden"
        style={{ gridTemplateColumns: `repeat(${primaryItems.length}, minmax(0, 1fr))` }}
        aria-label="Primary navigation"
      >
        {primaryItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" weight={active ? "fill" : "regular"} />
              <span className="truncate px-1">{t(item.labelKey as never)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
