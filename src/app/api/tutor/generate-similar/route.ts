import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatCompletion, DeepSeekError } from "@/lib/deepseek";

const schema = z.object({ questionId: z.string().min(1) });

const draftSchema = z.object({
  bodyJa: z.string().min(1),
  choices: z.array(z.object({ key: z.string(), textJa: z.string() })).min(2),
  correctAnswer: z.string(),
  explanationJa: z.string(),
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

  const source = await prisma.question.findFirst({
    where: { id: parsed.data.questionId, verified: true, reviewStatus: "VERIFIED" },
    select: {
      section: true,
      topicId: true,
      difficulty: true,
      bodyJa: true,
      choices: { select: { key: true, textJa: true }, orderBy: { order: "asc" } },
      correctAnswer: true,
    },
  });
  if (!source) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const prompt = [
    "以下のFE試験問題と同じ分野・同程度の難易度で、別の類題を1問作成してください。",
    "元の問題: " + source.bodyJa,
    "選択肢: " + source.choices.map((c) => `${c.key}: ${c.textJa}`).join(" / "),
    "出力は次のJSON形式のみで返してください（説明文などは不要）:",
    '{"bodyJa": "...", "choices": [{"key":"A","textJa":"..."}, ...], "correctAnswer": "A", "explanationJa": "..."}',
  ].join("\n");

  try {
    const raw = await chatCompletion(
      [
        {
          role: "system",
          content:
            "あなたはFE試験の練習問題作成アシスタントです。生成した問題は必ず「オリジナル練習問題」として扱われ、人によるレビューを経てから公開されます。",
        },
        { role: "user", content: prompt },
      ],
      { responseJson: true, temperature: 0.7 },
    );

    const parsedDraft = draftSchema.parse(JSON.parse(raw));

    const created = await prisma.question.create({
      data: {
        id: `FE-${source.section}-DRAFT-${Date.now()}`,
        section: source.section,
        sourceType: "ORIGINAL_PRACTICE",
        topicId: source.topicId,
        difficulty: source.difficulty,
        bodyJa: parsedDraft.bodyJa,
        correctAnswer: parsedDraft.correctAnswer,
        explanationJa: parsedDraft.explanationJa,
        verified: false,
        reviewStatus: "PENDING_REVIEW",
        choices: {
          create: parsedDraft.choices.map((c, i) => ({
            key: c.key,
            textJa: c.textJa,
            order: i,
          })),
        },
      },
      select: { id: true },
    });

    await prisma.aiChatLog.create({
      data: {
        userId: session.user.id,
        questionId: created.id,
        action: "generate_similar",
        role: "assistant",
        content: `Generated draft question ${created.id} from source ${parsed.data.questionId}, pending reviewer approval.`,
      },
    });

    return NextResponse.json({ draftId: created.id }, { status: 201 });
  } catch (err) {
    if (err instanceof DeepSeekError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: "Failed to generate a valid draft question" },
      { status: 502 },
    );
  }
}
