import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";

const root = join(process.cwd(), "storage", "ipa-classic-probe");
const urls = {
  question: "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf",
  answer: "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_ans.pdf",
};

async function get(url: string, name: string) {
  await mkdir(root, { recursive: true });
  const target = join(root, name);
  try { return await readFile(target); } catch {}
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const data = new Uint8Array(await response.arrayBuffer());
  await writeFile(target, data);
  return data;
}

async function text(data: Uint8Array) {
  const parser = new PDFParse({ data });
  try { return await parser.getText(); } finally { await parser.destroy(); }
}

async function main() {
  const q = await text(await get(urls.question, "q.pdf"));
  const a = await text(await get(urls.answer, "a.pdf"));
  await writeFile(join(root, "question-pages.json"), JSON.stringify(q.pages.map((page) => ({ page: page.num, text: page.text })), null, 2), "utf8");
  await writeFile(join(root, "answer-pages.json"), JSON.stringify(a.pages.map((page) => ({ page: page.num, text: page.text })), null, 2), "utf8");
  console.log(`question pages=${q.pages.length}, answer pages=${a.pages.length}`);
  console.log("QUESTION PAGE 1\n", q.pages[0]?.text.slice(0, 3000));
  console.log("ANSWER PAGE 1\n", a.pages[0]?.text.slice(0, 3000));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
