import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  questionId: z.string().min(1),
  reason: z.string().min(1).max(1000),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const question = await prisma.question.findFirst({
    where: { id: parsed.data.questionId, verified: true, reviewStatus: "VERIFIED" },
    select: { id: true },
  });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const flag = await prisma.questionFlag.create({
    data: {
      userId: session.user.id,
      questionId: parsed.data.questionId,
      reason: parsed.data.reason,
    },
  });

  return NextResponse.json({ flag }, { status: 201 });
}
