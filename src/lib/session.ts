import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { cache } from "react";
import type { Role } from "@/generated/prisma/enums";

const getSession = cache(() => auth());

export async function requireUser(locale: string) {
  const session = await getSession();
  if (session?.user) return session.user;
  // redirect() throws; the throw below only satisfies the type checker.
  redirect({ href: "/login", locale });
  throw new Error("unreachable: redirect() did not throw");
}

export async function requireRole(locale: string, roles: Role[]) {
  const user = await requireUser(locale);
  if (!roles.includes(user.role)) {
    redirect({ href: "/", locale });
  }
  return user;
}
