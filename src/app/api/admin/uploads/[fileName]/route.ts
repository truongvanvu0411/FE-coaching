import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { requireApiRole } from "@/lib/api-auth";
import { resolveUploadPath } from "@/lib/file-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileName: string }> },
) {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;

  const { fileName } = await params;
  if (fileName.includes("..") || fileName.includes("/")) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  try {
    const buffer = await readFile(resolveUploadPath(fileName));
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": "application/octet-stream" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
