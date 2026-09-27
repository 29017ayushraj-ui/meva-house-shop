import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().min(10).max(20),
  address: z.string().trim().min(8).max(240),
  items: z.array(z.object({ id: z.string(), name: z.string(), unit: z.string(), quantity: z.number().int().positive(), price: z.number().nonnegative() })).min(1),
  total: z.number().positive(),
});

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please complete the order details." }, { status: 400 });
  const order = await prisma.order.create({ data: { ...parsed.data, customerEmail: parsed.data.customerEmail || null } });
  const itemLines = parsed.data.items.map((item) => `- ${item.name} (${item.unit}) x${item.quantity}: Rs ${item.price * item.quantity}`).join("\n");
  const message = [`*The Meva House order*`, `Order ID: ${order.id}`, "", itemLines, "", `Total: Rs ${parsed.data.total}`, "Payment: Cash on delivery", `Customer: ${parsed.data.customerName}`, `Phone: ${parsed.data.phone}`, `Address: ${parsed.data.address}`].join("\n");
  return NextResponse.json({ orderId: order.id, whatsappUrl: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || "919142833856"}?text=${encodeURIComponent(message)}` }, { status: 201 });
}