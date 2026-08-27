import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatCompletion, buildGroundedSystemPrompt, DeepSeekError } from "@/lib/deepseek";

const schema = z.object({
  questionId: z.string().min(1),
  action: z.enum(["explain", "translate", "chat"]),
  message: z.string().max(2000).optional(),
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
  const { questionId, action, message } = parsed.data;

  const question = await prisma.question.findFirst({
    where: { id: questionId, verified: true, reviewStatus: "VERIFIED" },
    select: {
      bodyJa: true,
      correctAnswer: true,
      explanationJa: true,
      choices: { select: { key: true, textJa: true }, orderBy: { order: "asc" } },
    },
  });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const choicesText = question.choices
    .map((c) => `${c.key}: ${c.textJa}`)
    .join(" / ");

  const systemPrompt = buildGroundedSystemPrompt({
    bodyJa: question.bodyJa,
    choicesText,
    correctAnswer: question.correctAnswer,
    explanationJa: question.explanationJa,
  });

  const userPrompt =
    action === "explain"
      ? "この問題をベトナム語話者向けにわかりやすく解説してください。なぜその選択肢が正解で、他が誤りなのかを説明してください。"
      : action === "translate"
        ? "問題文・選択肢・解説をベトナム語に翻訳してください。"
        : (message ?? "");

  if (action === "chat" && !message) {
    return NextResponse.json({ error: "message is required for chat" }, { status: 400 });
  }

  try {
    const content = await chatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    await prisma.aiChatLog.createMany({
      data: [
        {
          userId: session.user.id,
          questionId,
          action,
          role: "user",
          content: userPrompt,
        },
        {
          userId: session.user.id,
          questionId,
          action,
          role: "assistant",
          content,
        },
      ],
    });

    return NextResponse.json({ content });
  } catch (err) {
    if (err instanceof DeepSeekError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    throw err;
  }
}
