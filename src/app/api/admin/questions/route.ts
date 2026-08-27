import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import { getReviewArtifact } from "@/lib/admin-review-artifacts";
import type { Prisma } from "@/generated/prisma/client";

const schema = z.object({
  id: z.string().min(1),
  section: z.enum(["A", "B"]),
  sourceType: z.enum([
    "IPA_PUBLIC",
    "IPA_EXEMPTION",
    "LEGACY_MORNING",
    "ORIGINAL_PRACTICE",
  ]),
  year: z.number().int().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  sourcePage: z.string().optional(),
  questionNumber: z.string().optional(),
  topicId: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  bodyJa: z.string().min(1),
  correctAnswer: z.string().min(1),
  explanationJa: z.string().optional(),
  choices: z.array(z.object({ key: z.string(), textJa: z.string() })).min(2),
  ingestJobId: z.string().optional(),
});

export async function GET(request: Request) {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;

  const url = new URL(request.url);
  const status = url.searchParams.get("reviewStatus");
  const sourceType = url.searchParams.get("sourceType") || "IPA_EXEMPTION";
  const risk = url.searchParams.get("risk");
  const issue = url.searchParams.get("issue");
  const search = url.searchParams.get("q")?.trim();
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(url.searchParams.get("pageSize")) || 20));
  const where: Prisma.QuestionWhereInput = {
    sourceType: sourceType as never,
    ...(status ? { reviewStatus: status as never } : {}),
    ...(search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" as const } },
            { bodyJa: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const scopedIds = risk || issue
    ? (await prisma.question.findMany({ where, select: { id: true } }))
        .map((question) => question.id)
    : null;
  // Risk is calculated from the immutable review report, so resolve the
  // complete candidate set before applying pagination (never filter a page
  // after it has already been sliced).
  let scopedWhere: Prisma.QuestionWhereInput = where;
  if (risk || issue) {
    const artifacts = await Promise.all((scopedIds ?? []).map((id) => getReviewArtifact(id)));
    const matchingIds = (scopedIds ?? []).filter((_, index) => {
      const artifact = artifacts[index];
      return (!risk || artifact?.risk === risk) && (!issue || artifact?.issues.includes(issue));
    });
    scopedWhere = { ...where, id: { in: matchingIds } };
  }
  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where: scopedWhere,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { topic: true, choices: { orderBy: { order: "asc" } } },
    }),
    prisma.question.count({ where: scopedWhere }),
  ]);
  const enriched = await Promise.all(questions.map(async (question) => {
    const artifact = await getReviewArtifact(question.id);
    return {
      ...question,
      reviewAudit: artifact
        ? {
            session: artifact.session,
            questionNumber: artifact.questionNumber,
            mappingStatus: artifact.mappingStatus,
            parseConfidence: artifact.parseConfidence,
            needsVisualReview: artifact.needsVisualReview,
            issues: artifact.issues,
            risk: artifact.risk,
            duplicate: artifact.duplicate ?? false,
            sourceImageUrl: `/api/admin/questions/${encodeURIComponent(question.id)}/source`,
          }
        : null,
    };
  }));
  return NextResponse.json({
    questions: enriched,
    pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
  });
}

export async function POST(request: Request) {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const question = await prisma.question.create({
    data: {
      id: data.id,
      section: data.section,
      sourceType: data.sourceType,
      year: data.year,
      sourceUrl: data.sourceUrl || undefined,
      sourcePage: data.sourcePage,
      questionNumber: data.questionNumber,
      topicId: data.topicId,
      difficulty: data.difficulty,
      bodyJa: data.bodyJa,
      correctAnswer: data.correctAnswer,
      explanationJa: data.explanationJa,
      ingestJobId: data.ingestJobId,
      verified: false,
      reviewStatus: "PENDING_REVIEW",
      choices: {
        create: data.choices.map((c, i) => ({ key: c.key, textJa: c.textJa, order: i })),
      },
    },
  });

  return NextResponse.json({ question }, { status: 201 });
}
