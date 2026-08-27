import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";

const SOURCE_TYPES = [
  "IPA_PUBLIC",
  "IPA_EXEMPTION",
  "LEGACY_MORNING",
  "ORIGINAL_PRACTICE",
] as const;

export async function GET() {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;

  const [bySection, bySourceType, pendingReview, verifiedTotal] = await Promise.all([
    prisma.question.groupBy({
      by: ["section"],
      where: { verified: true },
      _count: true,
    }),
    Promise.all(
      SOURCE_TYPES.map(async (sourceType) => ({
        sourceType,
        count: await prisma.question.count({ where: { sourceType, verified: true } }),
      })),
    ),
    prisma.question.count({ where: { reviewStatus: "PENDING_REVIEW" } }),
    prisma.question.count({ where: { verified: true } }),
  ]);

  return NextResponse.json({ bySection, bySourceType, pendingReview, verifiedTotal });
}
