type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
const TIMEOUT_MS = 60_000;

export class DeepSeekError extends Error {}

export async function chatCompletion(
  messages: ChatMessage[],
  opts?: { temperature?: number; responseJson?: boolean },
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new DeepSeekError("DEEPSEEK_API_KEY is not configured");
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      // Without a deadline a stalled upstream holds a server connection open
      // indefinitely; the app runs in a 512 MB container next to three other
      // projects, so a handful of those is enough to matter.
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: opts?.temperature ?? 0.4,
        ...(opts?.responseJson ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  } catch (cause) {
    // A timeout or a network failure would otherwise escape as a raw
    // DOMException and surface to the client as a 500. Callers already map
    // DeepSeekError to 502, which is what an upstream failure actually is.
    const reason =
      cause instanceof Error && cause.name === "TimeoutError"
        ? `timed out after ${TIMEOUT_MS / 1000}s`
        : "could not be reached";
    throw new DeepSeekError(`DeepSeek ${reason}`, { cause });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new DeepSeekError(`DeepSeek API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new DeepSeekError("Unexpected DeepSeek response shape");
  }
  return content;
}

/**
 * System prompt hard-pins the verified answer/explanation as read-only ground
 * truth. The model is explicitly forbidden from overriding it — official
 * correctness always comes from the database, never from the AI.
 */
export function buildGroundedSystemPrompt(question: {
  bodyJa: string;
  choicesText: string;
  correctAnswer: string;
  explanationJa?: string | null;
}) {
  return [
    "あなたはFE(基本情報技術者試験)受験者向けの日本語チューターです。",
    "回答はベトナム語話者にもわかりやすく、必要に応じて日本語とベトナム語を併記してください。",
    "以下は検証済みデータベースからの確定情報です。これを絶対に変更・否定しないでください:",
    `問題文: ${question.bodyJa}`,
    `選択肢: ${question.choicesText}`,
    `正解: ${question.correctAnswer}`,
    question.explanationJa ? `公式解説: ${question.explanationJa}` : "",
    "あなたの役割は「説明・翻訳・指導・類題生成」のみです。正解を変更したり、出典情報を捏造したりしてはいけません。",
  ]
    .filter(Boolean)
    .join("\n");
}
