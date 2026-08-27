import type { Role } from "@/generated/prisma/enums";
import {
  House,
  BookOpen,
  Bookmark,
  ChartBar,
  ShieldCheck,
  type Icon,
} from "@phosphor-icons/react";

export type NavItem = {
  href: string;
  labelKey: string;
  icon: Icon;
  roles?: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "nav.home", icon: House },
  { href: "/practice", labelKey: "nav.practice", icon: BookOpen },
  { href: "/bookmarks", labelKey: "nav.bookmarks", icon: Bookmark },
  { href: "/progress", labelKey: "nav.progress", icon: ChartBar },
  {
    href: "/admin",
    labelKey: "nav.admin",
    icon: ShieldCheck,
    roles: ["REVIEWER", "ADMIN"],
  },
];
