import { prisma } from "@/lib/prisma";

export type Product = { id: string; name: string; hindiName: string; description: string; price: number; unit: string; badge: string; imageUrl: string; category: string; featured: boolean };

export const fallbackProducts: Product[] = [
  { id: "walnut-snow", name: "Walnut Kernels - Snow White", hindiName: "Akhrot Giri (Snow White)", description: "Butter-soft, pale walnut kernels with a clean finish.", price: 220, unit: "250g", badge: "Premium", imageUrl: "https://the-meva-house.vercel.app/PHOTO-2026-05-05-08-46-41.jpg", category: "Walnuts", featured: true },
  { id: "walnut-orchid", name: "Walnut Kernels - Orchid", hindiName: "Akhrot Giri (Orchid)", description: "A balanced everyday walnut with a gentle crunch.", price: 230, unit: "250g", badge: "Popular", imageUrl: "https://the-meva-house.vercel.app/PHOTO-2026-05-05-08-46-52.jpg", category: "Walnuts", featured: true },
  { id: "almonds", name: "Almonds (Badam)", hindiName: "Badam", description: "Crisp, nourishing almonds for your daily handful.", price: 180, unit: "250g", badge: "Superfood", imageUrl: "https://the-meva-house.vercel.app/PHOTO-2026-05-05-08-46-58.jpg", category: "Nuts", featured: true },
  { id: "apricot", name: "Dried Apricot", hindiName: "Sukhi Khubani", description: "Naturally sweet, sun-kissed apricots.", price: 180, unit: "250g", badge: "Healthy", imageUrl: "https://the-meva-house.vercel.app/PHOTO-2026-05-05-08-46-53.jpg", category: "Dried fruit", featured: true },
  { id: "black-raisins", name: "Kali Drakh", hindiName: "Kali Draksh", description: "Plump black raisins with a deep, rich sweetness.", price: 130, unit: "250g", badge: "Organic", imageUrl: "https://the-meva-house.vercel.app/PHOTO-2026-05-05-08-46-57.jpg", category: "Dried fruit", featured: false },
  { id: "pumpkin-seeds", name: "Pumpkin Seeds", hindiName: "Kaddu ke Beej", description: "Toasty, protein-rich seeds for salads and snacking.", price: 80, unit: "100g", badge: "Protein", imageUrl: "https://the-meva-house.vercel.app/PHOTO-2026-05-05-08-46-59%20(1).jpg", category: "Seeds", featured: false },
];

export async function getProducts(): Promise<Product[]> {
  if (!process.env.DATABASE_URL) return fallbackProducts;
  try {
    const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }] }) as unknown as Array<Product & { price: unknown }>;
    return products.map((product: Product & { price: unknown }) => ({ ...product, price: Number(product.price) }));
  } catch { return fallbackProducts; }
}