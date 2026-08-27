import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";

const schema = z.object({
  section: z.enum(["A", "B"]),
  nameJa: z.string().min(1),
  nameVi: z.string().min(1),
  parentId: z.string().optional(),
});

export async function GET() {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;

  const topics = await prisma.topic.findMany({ orderBy: { nameJa: "asc" } });
  return NextResponse.json({ topics });
}

export async function POST(request: Request) {
  const authz = await requireApiRole(["ADMIN"]);
  if ("error" in authz) return authz.error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const topic = await prisma.topic.create({
    data: {
      id: `topic-${parsed.data.nameJa}-${Date.now()}`,
      ...parsed.data,
    },
  });
  return NextResponse.json({ topic }, { status: 201 });
}
