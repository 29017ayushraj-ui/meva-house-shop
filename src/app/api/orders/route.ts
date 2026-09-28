import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const orderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

const orderSchema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().min(10, "Phone number must have at least 10 digits").max(20),
  address: z.string().trim().min(6, "Please provide complete delivery address").max(240),
  notes: z.string().trim().max(200).optional().or(z.literal("")),
  paymentMethod: z.enum(["COD", "ONLINE", "UPI"]).default("COD"),
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
  total: z.number().positive("Total must be positive"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = orderSchema.safeParse(json);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Please check your order details.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { customerName, customerEmail, phone, address, notes, paymentMethod, items, total } = parsed.data;

    // Transactional order creation in PostgreSQL
    const order = await prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear();
      const randomPart = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `MH-${year}-${randomPart}`;

      return await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerEmail: customerEmail || null,
          phone,
          address,
          notes: notes || null,
          items,
          subtotal: total,
          deliveryFee: 0,
          total,
          paymentMethod,
          paymentStatus: "PENDING",
          status: "PENDING",
        },
      });
    });

    // Format rich WhatsApp message
    const dateFormatted = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    const itemLines = items
      .map(
        (item, index) =>
          `${index + 1}. *${item.name}* (${item.unit})\n   ▫️ Qty: ${item.quantity} × ₹${item.price} = *₹${item.price * item.quantity}*`
      )
      .join("\n");

    const messageLines = [
      `🛒 *NEW ORDER — THE MEVA HOUSE*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📋 *Order ID:* \`#${order.orderNumber || order.id}\``,
      `📅 *Date:* ${dateFormatted}`,
      `💳 *Payment:* ${paymentMethod === "COD" ? "Cash on Delivery (Pay at Doorstep)" : "Online / UPI (Integration Ready)"}`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🛍️ *ITEMS ORDERED:*`,
      itemLines,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `💰 *BILL SUMMARY:*`,
      `▫️ Subtotal: ₹${total}`,
      `▫️ Society Delivery: *FREE*`,
      `👉 *Grand Total: ₹${total}*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📍 *DELIVERY DETAILS:*`,
      `👤 *Customer:* ${customerName}`,
      `📞 *Phone:* ${phone}`,
      ...(customerEmail ? [`✉️ *Email:* ${customerEmail}`] : []),
      `🏠 *Address:* ${address}`,
      ...(notes ? [`📝 *Instructions:* ${notes}`] : []),
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `✨ _Thank you for ordering with The Meva House! Your fresh dry fruits are being carefully packed._`,
    ];

    const message = messageLines.join("\n");
    const whatsappRecipient = process.env.NEXT_PUBLIC_WHATSAPP || "919142833856";
    const whatsappUrl = `https://wa.me/${whatsappRecipient}?text=${encodeURIComponent(message)}`;

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          phone: order.phone,
          address: order.address,
          items: order.items,
          total: Number(order.total),
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          status: order.status,
          createdAt: order.createdAt,
        },
        whatsappUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ORDER_API_ERROR]", error);
    return NextResponse.json(
      { error: "We could not process your order at the moment. Please try again." },
      { status: 500 }
    );
  }
}