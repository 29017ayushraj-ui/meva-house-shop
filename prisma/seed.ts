import { PrismaClient } from "@prisma/client";
import { fallbackProducts } from "../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  await prisma.admin.upsert({ where: { email: process.env.ADMIN_EMAIL || "admin@mevahouse.local" }, update: {}, create: { email: process.env.ADMIN_EMAIL || "admin@mevahouse.local", passwordHash: "otp-managed", name: "Meva House Admin" } });
  for (const product of fallbackProducts) {
    await prisma.product.upsert({ where: { id: product.id }, update: product, create: product });
  }
}

main().finally(() => prisma.$disconnect());
