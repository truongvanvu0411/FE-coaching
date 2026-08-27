import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

export async function saveUploadedFile(file: File) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(UPLOAD_DIR, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return { fileName: file.name, fileUrl: `/api/admin/uploads/${safeName}` };
}

export function resolveUploadPath(safeName: string) {
  return path.join(UPLOAD_DIR, safeName);
}
