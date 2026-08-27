import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getReviewArtifact, reviewPagePath } from "@/lib/admin-review-artifacts";
import { requireApiRole } from "@/lib/api-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requireApiRole(["REVIEWER", "ADMIN"]);
  if ("error" in authz) return authz.error;
  const { id } = await params;
  const artifact = await getReviewArtifact(id);
  const path = artifact && reviewPagePath(artifact);
  if (!path) return NextResponse.json({ error: "Review source not found" }, { status: 404 });
  try {
    const image = await readFile(path);
    return new NextResponse(image, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Review source page is not rendered" }, { status: 404 });
  }
}
