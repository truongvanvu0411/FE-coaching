import { PDFParse } from "pdf-parse";
import { readFile, writeFile } from "fs/promises";

const [,, inPath, outPath] = process.argv;
const buffer = await readFile(inPath);
const parser = new PDFParse({ data: buffer });
const result = await parser.getText();
await parser.destroy();
await writeFile(outPath, result.text, "utf-8");
console.log(`wrote ${result.text.length} chars to ${outPath}`);
