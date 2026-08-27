import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import { getReviewArtifact, reviewPagePath } from "@/lib/admin-review-artifacts";

const schema = z.object({
  action: z.enum(["verify", "reject", "update"]),
  bodyJa: z.string().trim().min(1).optional(),
  choices: z.array(z.object({
    key: z.enum(["A", "B", "C", "D"]),
    textJa: z.string().trim().min(1),
  })).length(4).optional(),
  topicId: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  correctAnswer: z.enum(["A", "B", "C", "D"]).optional(),
  explanationJa: z.string().optional(),
  isObsolete: z.boolean().optional(),
  duplicateOfId: z.string().nullable().optional(),
  sourceChecked: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: { topic: true, choices: { orderBy: { order: "asc" } } },
  });
  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const artifact = await getReviewArtifact(id);
  return NextResponse.json({ question, reviewAudit: artifact ? {
    ...artifact,
    sourceImageUrl: `/api/admin/questions/${encodeURIComponent(id)}/source`,
  } : null });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;

  const { id } = await params;
  const current = await prisma.question.findUnique({
    where: { id },
    select: { sourceType: true, reviewStatus: true },
  });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (current.sourceType !== "IPA_EXEMPTION" || current.reviewStatus !== "PENDING_REVIEW") {
    return NextResponse.json({ error: "Only quarantined IPA exemption questions can be reviewed" }, { status: 409 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { action, sourceChecked, choices, ...fields } = parsed.data;
  if (choices) {
    const keys = choices.map((choice) => choice.key);
    if (new Set(keys).size !== 4 || !["A", "B", "C", "D"].every((key) => keys.includes(key as typeof keys[number]))) {
      return NextResponse.json({ error: "Choices must contain exactly one A, B, C and D" }, { status: 400 });
    }
  }

  if (action === "verify" && sourceChecked !== true) {
    return NextResponse.json({ error: "Source page must be checked before verification" }, { status: 400 });
  }
  if (action === "verify" && (!fields.bodyJa || !choices || !fields.correctAnswer)) {
    return NextResponse.json({ error: "Verification requires corrected body, four choices and official answer" }, { status: 400 });
  }
  if (action === "verify") {
    const artifact = await getReviewArtifact(id);
    const sourcePath = artifact && reviewPagePath(artifact);
    if (!artifact || !sourcePath || !existsSync(sourcePath)) {
      return NextResponse.json({ error: "Source artifact is unavailable; verification is blocked" }, { status: 409 });
    }
  }

  const baseUpdate = {
    bodyJa: fields.bodyJa,
    topicId: fields.topicId,
    difficulty: fields.difficulty,
    correctAnswer: fields.correctAnswer,
    explanationJa: fields.explanationJa,
    isObsolete: fields.isObsolete,
    duplicateOfId: fields.duplicateOfId,
  };
  const updateData = choices
    ? { ...baseUpdate, choices: { deleteMany: {}, create: choices.map((choice, order) => ({ ...choice, order })) } }
    : baseUpdate;

  if (action === "verify") {
    const question = await prisma.question.update({
      where: { id },
      data: {
        ...updateData,
        verified: true,
        reviewStatus: "VERIFIED",
        isObsolete: false,
        reviewedById: authz.user.id,
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ question });
  }

  if (action === "reject") {
    const question = await prisma.question.update({
      where: { id },
      data: {
        ...updateData,
        verified: false,
        reviewStatus: "REJECTED",
        isObsolete: true,
        reviewedById: authz.user.id,
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ question });
  }

  const question = await prisma.question.update({ where: { id }, data: updateData });
  return NextResponse.json({ question });
}
