import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  questionId: z.string().min(1),
  chosenAnswer: z.string().min(1),
  mode: z.enum(["practice", "mock_exam"]).default("practice"),
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

  const { questionId, chosenAnswer, mode } = parsed.data;

  const question = await prisma.question.findFirst({
    where: { id: questionId, verified: true, reviewStatus: "VERIFIED" },
    select: {
      correctAnswer: true,
      explanationJa: true,
      explanationVi: true,
      choices: { select: { key: true } },
    },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  if (!question.choices.some((choice) => choice.key === chosenAnswer)) {
    return NextResponse.json({ error: "Invalid answer choice" }, { status: 400 });
  }

  // Official correctness always comes from the verified database record —
  // never recomputed or overridden client-side or by the AI tutor.
  const isCorrect = chosenAnswer === question.correctAnswer;

  await prisma.attempt.create({
    data: {
      userId: session.user.id,
      questionId,
      chosenAnswer,
      isCorrect,
      mode,
    },
  });

  return NextResponse.json({
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanationJa: question.explanationJa,
    explanationVi: question.explanationVi,
  });
}
