import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import { resolveUploadPath } from "@/lib/file-storage";
import { extractTextFromFile } from "@/lib/ocr";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;

  const { id } = await params;
  const job = await prisma.ingestJob.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.ingestJob.update({
    where: { id },
    data: { status: "OCR_RUNNING" },
  });

  try {
    const fileName = job.fileUrl.split("/").pop()!;
    const mimeHint = job.fileName.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : "image";
    const text = await extractTextFromFile(resolveUploadPath(fileName), mimeHint);

    const updated = await prisma.ingestJob.update({
      where: { id },
      data: { status: "OCR_DONE", ocrText: text },
    });

    return NextResponse.json({ job: updated });
  } catch (err) {
    await prisma.ingestJob.update({
      where: { id },
      data: {
        status: "FAILED",
        parseErrors: err instanceof Error ? err.message : "OCR failed",
      },
    });
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}
