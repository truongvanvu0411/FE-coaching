import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ questionId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { questionId } = parsed.data;
  const userId = session.user.id;

  const question = await prisma.question.findFirst({
    where: { id: questionId, verified: true, reviewStatus: "VERIFIED" },
    select: { id: true },
  });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_questionId: { userId, questionId } },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_questionId: { userId, questionId } },
    });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.bookmark.create({ data: { userId, questionId } });
  return NextResponse.json({ bookmarked: true });
}
