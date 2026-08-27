import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertProductionEnv } from "@/lib/env";

// Never cached: the whole point is the state of this container right now.
export const dynamic = "force-dynamic";

/**
 * Container healthcheck. Checks the two things that actually break a deploy —
 * required config and database reachability — and deliberately leaks nothing
 * about either on failure.
 */
export async function GET() {
  try {
    assertProductionEnv();
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "unhealthy" }, { status: 503 });
  }
}
