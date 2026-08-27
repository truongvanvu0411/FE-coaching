import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/file-storage";
import { requireApiRole } from "@/lib/api-auth";

const sourceTypeSchema = z.enum([
  "IPA_PUBLIC",
  "IPA_EXEMPTION",
  "LEGACY_MORNING",
  "ORIGINAL_PRACTICE",
]);

export async function GET(request: Request) {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(url.searchParams.get("pageSize")) || 20));
  const where = status ? { status: status as never } : {};

  const [jobs, total] = await Promise.all([
    prisma.ingestJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { questions: true } } },
    }),
    prisma.ingestJob.count({ where }),
  ]);
  return NextResponse.json({
    jobs,
    pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
  });
}

export async function POST(request: Request) {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;

  const formData = await request.formData();
  const file = formData.get("file");
  const sourceType = formData.get("sourceType");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "file must be smaller than 50 MB" }, { status: 413 });
  }
  const parsedSourceType = sourceTypeSchema.safeParse(sourceType);
  if (!parsedSourceType.success) {
    return NextResponse.json({ error: "invalid sourceType" }, { status: 400 });
  }

  const { fileName, fileUrl } = await saveUploadedFile(file);

  const job = await prisma.ingestJob.create({
    data: {
      fileName,
      fileUrl,
      sourceType: parsedSourceType.data,
      status: "UPLOADED",
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
