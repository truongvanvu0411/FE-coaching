import "dotenv/config";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";

type ClassicItem = {
  session: string;
  year: number;
  term: "spring" | "autumn";
  pageUrl: string;
  questionUrl: string;
  answerUrl: string;
  questionFile: string;
  answerFile: string;
  expected: 80;
};

const ROOT = join(process.cwd(), "storage", "ipa-classic");
const YEARS = [2014, 2015, 2016, 2017, 2018, 2019];
const ARCHIVE_PAGES: Record<number, string> = {
  2014: "2014h26.html",
  2015: "2015h27.html",
  2016: "2016h28.html",
  2017: "2017h29.html",
  2018: "2018h30.html",
  2019: "2019h31.html",
};

function sha256(data: Uint8Array) { return createHash("sha256").update(data).digest("hex"); }

async function discover() {
  const items: ClassicItem[] = [];
  for (const year of YEARS) {
    const pageUrl = `https://www.ipa.go.jp/shiken/mondai-kaiotu/${ARCHIVE_PAGES[year]}`;
    const html = await fetch(pageUrl).then(async (response) => {
      if (!response.ok) throw new Error(`${pageUrl}: ${response.status}`);
      return response.text();
    });
    const links = [...html.matchAll(/href=["']([^"']+\.pdf)/gi)].map((match) => match[1]);
    const absolute = links.map((href) => href.startsWith("http") ? href : `https://www.ipa.go.jp${href}`);
    const pairs = new Map<string, { question?: string; answer?: string }>();
    for (const url of absolute) {
      const file = url.split("/").pop() ?? "";
      const match = file.match(/^(.+)_fe_am_(qs|ans)\.pdf$/i);
      if (!match) continue;
      const base = match[1];
      const pair = pairs.get(base) ?? {};
      if (match[2].toLowerCase() === "qs") pair.question = url;
      else pair.answer = url;
      pairs.set(base, pair);
    }
    for (const [base, pair] of pairs) {
      if (!pair.question || !pair.answer) continue;
      const term: "spring" | "autumn" = /(?:h|r)\d+h$/i.test(base) ? "spring" : "autumn";
      items.push({
        session: `${year}-${term}`,
        year,
        term,
        pageUrl,
        questionUrl: pair.question,
        answerUrl: pair.answer,
        questionFile: pair.question.split("/").pop()!,
        answerFile: pair.answer.split("/").pop()!,
        expected: 80,
      });
    }
  }
  items.sort((a, b) => a.session.localeCompare(b.session));
  if (items.length !== YEARS.length * 2) throw new Error(`Expected ${YEARS.length * 2} classic sessions, found ${items.length}`);
  await mkdir(ROOT, { recursive: true });
  await writeFile(join(ROOT, "manifest.json"), JSON.stringify(items, null, 2), "utf8");
  console.log(items.map((item) => `${item.session}: ${item.questionFile} + ${item.answerFile}`).join("\n"));
  return items;
}

async function download(items: ClassicItem[]) {
  for (const item of items) {
    const dir = join(ROOT, item.session);
    await mkdir(dir, { recursive: true });
    for (const [kind, url, file] of [["question", item.questionUrl, item.questionFile], ["answer", item.answerUrl, item.answerFile]] as const) {
      const target = join(dir, file);
      try {
        const cached = await readFile(target);
        console.log(`${item.session} ${kind}: cached ${cached.byteLength} bytes sha=${sha256(cached).slice(0, 12)}`);
        continue;
      } catch {}
      const response = await fetch(url, { headers: { "user-agent": "FE-Coach-source-ingest/1.0" } });
      if (!response.ok) throw new Error(`${item.session} ${kind}: ${response.status}`);
      const data = new Uint8Array(await response.arrayBuffer());
      if (data.byteLength < (kind === "question" ? 50_000 : 10_000)) throw new Error(`${item.session} ${kind}: suspicious PDF size ${data.byteLength}`);
      await writeFile(target, data);
      console.log(`${item.session} ${kind}: downloaded ${data.byteLength} bytes sha=${sha256(data).slice(0, 12)}`);
    }
  }
}

async function buildAnswerOverrides(items: ClassicItem[]) {
  const overrides: Record<string, Record<string, string>> = {};
  const keyMap: Record<string, string> = { ア: "A", イ: "B", ウ: "C", エ: "D" };
  for (const item of items) {
    const data = await readFile(join(ROOT, item.session, item.answerFile));
    const parser = new PDFParse({ data });
    try {
      const result = await parser.getText();
      const map: Record<string, string> = {};
      for (const match of result.text.matchAll(/問\s*([0-9]{1,2})\s*([アイウエ])/gu)) {
        const number = Number(match[1]);
        if (number >= 1 && number <= 80) map[`Q${String(number).padStart(2, "0")}`] = keyMap[match[2]];
      }
      if (Object.keys(map).length !== 80) throw new Error(`${item.session}: answer map ${Object.keys(map).length}/80`);
      overrides[item.session] = map;
      console.log(`${item.session}: answer map ${Object.keys(map).length}/80`);
    } finally { await parser.destroy(); }
  }
  await mkdir(join(ROOT, "qa-v2"), { recursive: true });
  await writeFile(join(ROOT, "qa-v2", "answer-overrides.json"), JSON.stringify(overrides, null, 2), "utf8");
}

async function main() {
  const items = await discover();
  await download(items);
  await buildAnswerOverrides(items);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
