"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({ name: z.string().min(2), hindiName: z.string().min(2), description: z.string().min(5), price: z.coerce.number().positive(), unit: z.string().min(1), badge: z.string().min(1), imageUrl: z.string().url(), category: z.string().min(2) });

export async function createProduct(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin/login");
  if (!process.env.DATABASE_URL) redirect("/admin?error=database");
  const result = productSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) redirect("/admin?error=validation");
  await prisma.product.create({ data: { ...result.data, featured: formData.get("featured") === "on" } });
  revalidatePath("/"); revalidatePath("/admin"); redirect("/admin?saved=1");
}

export async function archiveProduct(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin/login");
  if (process.env.DATABASE_URL) await prisma.product.update({ where: { id: String(formData.get("id")) }, data: { isActive: false } });
  revalidatePath("/"); revalidatePath("/admin");
}