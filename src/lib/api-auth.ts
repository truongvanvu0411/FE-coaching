import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

export async function requireApiRole(roles: Role[]) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!roles.includes(session.user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user: session.user };
}
