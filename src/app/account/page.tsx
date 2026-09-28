import { ArrowLeft, Leaf, LogOut, Package, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type OrderItem = {
  name: string;
  unit: string;
  quantity: number;
  price: number;
};

type CustomerOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  phone: string;
  address: string;
  items: unknown;
  total: unknown;
  status: string;
  createdAt: Date;
};

export default async function AccountPage() {
  const session = await getSession();

  if (!session || session.role !== "USER") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--forest)] px-6 text-center text-white">
        <div className="max-w-md rounded-3xl bg-white/10 p-10 backdrop-blur-md border border-white/20">
          <UserRound className="mx-auto text-[var(--gold)]" size={44} />
          <h1 className="display mt-5 text-4xl font-normal">Customer Account</h1>
          <p className="mt-3 text-xs leading-6 text-white/70">
            Please sign in to view your orders and society delivery history.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-[var(--gold)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--forest)] hover:bg-white transition"
          >
            Sign In Now
          </Link>
        </div>
      </main>
    );
  }

  // Fetch customer orders matching email
  let orders: CustomerOrder[] = [];
  try {
    if (process.env.DATABASE_URL) {
      orders = (await prisma.order.findMany({
        where: { customerEmail: session.email },
        orderBy: { createdAt: "desc" },
        take: 10,
      })) as unknown as CustomerOrder[];
    }
  } catch (e) {
    console.error("Failed to load customer orders:", e);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] selection:bg-[var(--leaf)] selection:text-[var(--forest)]">
      {/* Top Header */}
      <header className="border-b border-[var(--card-border)] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--forest)] transition"
          >
            <ArrowLeft size={16} />
            <span>Storefront</span>
          </Link>

          <div className="flex items-center gap-2">
            <Leaf size={18} className="text-[var(--forest)]" />
            <span className="display font-bold text-lg text-[var(--forest)]">
              The Meva House<span className="text-[var(--clay)]">.</span>
            </span>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full border border-[var(--card-border)] px-4 py-2 text-xs font-bold text-[var(--forest)] hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Profile Card */}
        <div className="rounded-3xl border border-[var(--card-border)] bg-white p-8 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--leaf)]/40 text-[var(--forest)]">
                <UserRound size={28} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--clay)]">
                  Customer Profile
                </span>
                <h1 className="display text-3xl font-bold text-[var(--forest)]">
                  Welcome back!
                </h1>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{session.email}</p>
              </div>
            </div>

            <Link
              href="/#collection"
              className="flex items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--clay)] transition w-fit"
            >
              <ShoppingBag size={14} />
              <span>Shop Fresh Dry Fruits</span>
            </Link>
          </div>
        </div>

        {/* Order History Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="display text-2xl font-bold text-[var(--forest)]">
              Your Order History
            </h2>
            <span className="text-xs font-semibold text-[var(--muted)]">
              {orders.length} {orders.length === 1 ? "order" : "orders"} on file
            </span>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const itemsList = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
                const formattedDate = new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(order.createdAt));

                return (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-[var(--card-border)] bg-white p-6 shadow-xs transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--card-border)] pb-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                          Order Number
                        </span>
                        <p className="font-extrabold text-[var(--forest)] text-base">
                          #{order.orderNumber || order.id}
                        </p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">{formattedDate}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[#edf4e8] px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                          {order.status}
                        </span>
                        <span className="text-lg font-bold text-[var(--forest)]">
                          ₹{Number(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs">
                      <div>
                        <span className="font-bold text-[var(--forest)] block mb-1">
                          Delivery Destination:
                        </span>
                        <p className="text-[var(--muted)]">{order.address}</p>
                        <p className="text-[var(--muted)] mt-1">Phone: {order.phone}</p>
                      </div>

                      <div>
                        <span className="font-bold text-[var(--forest)] block mb-1">
                          Items Ordered ({itemsList.length}):
                        </span>
                        <ul className="space-y-1 text-[var(--muted)]">
                          {itemsList.map((item, idx) => (
                            <li key={idx}>
                              &bull; {item.name} ({item.unit}) &times; {item.quantity} &mdash; ₹{item.price * item.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-[var(--card-border)] bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--background)] text-[var(--muted)]">
                <Package size={26} className="text-[var(--gold)]" />
              </div>
              <h3 className="display mt-4 text-2xl font-bold text-[var(--forest)]">
                No orders yet
              </h3>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)] max-w-sm mx-auto">
                When you place an order with your email address, your order details and delivery status will appear here.
              </p>
              <Link
                href="/#collection"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--forest)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--clay)] transition"
              >
                <span>Browse The Collection</span>
                <ArrowLeft className="rotate-180" size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
