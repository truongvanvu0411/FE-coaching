import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import { diceSimilarity } from "@/lib/similarity";

const THRESHOLD = 0.6;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;

  const { id } = await params;
  const target = await prisma.question.findUnique({
    where: { id },
    select: { bodyJa: true, topicId: true, section: true },
  });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const candidates = await prisma.question.findMany({
    where: {
      id: { not: id },
      section: target.section,
      topicId: target.topicId,
    },
    select: { id: true, bodyJa: true, sourceType: true, verified: true },
    take: 500,
  });

  const scored = candidates
    .map((c) => ({ ...c, score: diceSimilarity(target.bodyJa, c.bodyJa) }))
    .filter((c) => c.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return NextResponse.json({ candidates: scored });
}
