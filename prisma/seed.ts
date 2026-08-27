import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const TOPICS: { section: "A" | "B"; nameJa: string; nameVi: string }[] = [
  { section: "A", nameJa: "基礎理論", nameVi: "Lý thuyết cơ bản" },
  { section: "A", nameJa: "アルゴリズムとプログラミング", nameVi: "Thuật toán và lập trình" },
  { section: "A", nameJa: "コンピュータ構成要素", nameVi: "Thành phần máy tính" },
  { section: "A", nameJa: "システム構成要素", nameVi: "Thành phần hệ thống" },
  { section: "A", nameJa: "ソフトウェア", nameVi: "Phần mềm" },
  { section: "A", nameJa: "データベース", nameVi: "Cơ sở dữ liệu" },
  { section: "A", nameJa: "ネットワーク", nameVi: "Mạng máy tính" },
  { section: "A", nameJa: "セキュリティ", nameVi: "Bảo mật" },
  { section: "A", nameJa: "システム開発技術", nameVi: "Kỹ thuật phát triển hệ thống" },
  { section: "A", nameJa: "マネジメント系", nameVi: "Quản lý" },
  { section: "A", nameJa: "ストラテジ系", nameVi: "Chiến lược" },
  { section: "B", nameJa: "アルゴリズム（擬似言語）", nameVi: "Thuật toán (giả mã)" },
  { section: "B", nameJa: "情報セキュリティ", nameVi: "An toàn thông tin" },
];

async function main() {
  console.log("Seeding topics...");
  const topics: Record<string, string> = {};
  for (const topic of TOPICS) {
    const created = await prisma.topic.upsert({
      where: { id: `topic-${topic.nameJa}` },
      update: {},
      create: {
        id: `topic-${topic.nameJa}`,
        section: topic.section,
        nameJa: topic.nameJa,
        nameVi: topic.nameVi,
      },
    });
    topics[topic.nameJa] = created.id;
  }

  console.log("Seeding admin user...");
  const adminEmail = "admin@fecoach.local";
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log("Seeding sample original-practice questions...");
  await prisma.question.upsert({
    where: { id: "FE-A-SAMPLE-000001" },
    update: {},
    create: {
      id: "FE-A-SAMPLE-000001",
      section: "A",
      sourceType: "ORIGINAL_PRACTICE",
      topicId: topics["基礎理論"],
      difficulty: "EASY",
      bodyJa:
        "2進数の 1010 を10進数に変換した値として、正しいものはどれか。",
      correctAnswer: "B",
      verified: true,
      reviewStatus: "VERIFIED",
      explanationJa:
        "1010(2) = 1×2^3 + 0×2^2 + 1×2^1 + 0×2^0 = 8 + 0 + 2 + 0 = 10。よって正解は10。",
      choices: {
        create: [
          { key: "A", textJa: "8", order: 0 },
          { key: "B", textJa: "10", order: 1 },
          { key: "C", textJa: "12", order: 2 },
          { key: "D", textJa: "20", order: 3 },
        ],
      },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
