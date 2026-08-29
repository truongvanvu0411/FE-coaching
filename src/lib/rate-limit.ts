import { prisma } from "@/lib/prisma";

/**
 * Per-user cap on calls that cost money.
 *
 * Every DeepSeek call already writes to AiChatLog, which is indexed on
 * [userId, createdAt] — so the log doubles as the counter. That keeps the limit
 * accurate across container restarts and needs no extra table or dependency,
 * unlike an in-memory window that resets on every deploy.
 *
 * Only `role: "user"` rows are counted: a chat turn writes two rows (the prompt
 * and the reply) and a generated question writes one, so counting everything
 * would price the same action differently depending on the endpoint.
 */
export const AI_CALLS_PER_HOUR = 30;

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; remaining: 0; retryAfterSeconds: number };

export async function checkAiRateLimit(
  userId: string,
  limit = AI_CALLS_PER_HOUR,
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - 60 * 60 * 1000);

  const used = await prisma.aiChatLog.count({
    where: { userId, role: "user", createdAt: { gte: windowStart } },
  });

  if (used < limit) return { allowed: true, remaining: limit - used };

  // Retry when the oldest call in the window ages out, not a flat hour — the
  // caller gets a usable number instead of being told to wait the maximum.
  const oldest = await prisma.aiChatLog.findFirst({
    where: { userId, role: "user", createdAt: { gte: windowStart } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  const freesAt = (oldest?.createdAt.getTime() ?? Date.now()) + 60 * 60 * 1000;
  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: Math.max(1, Math.ceil((freesAt - Date.now()) / 1000)),
  };
}

export function rateLimitResponse(result: Extract<RateLimitResult, { allowed: false }>) {
  return Response.json(
    {
      error: `AI request limit reached (${AI_CALLS_PER_HOUR}/hour). Try again in ${Math.ceil(
        result.retryAfterSeconds / 60,
      )} minutes.`,
    },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}
