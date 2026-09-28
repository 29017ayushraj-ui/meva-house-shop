import {
  ArrowLeft,
  Box,
  Database,
  Leaf,
  LogOut,
  Plus,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { fallbackProducts, getProducts } from "@/lib/catalog";
import { logout } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { archiveProduct, createProduct, updateOrderStatus } from "./actions";

type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  total: unknown;
  paymentMethod: string;
  status: string;
  createdAt: Date;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--forest)] px-6 text-center text-white">
        <div className="max-w-md rounded-3xl bg-white/10 p-10 backdrop-blur-md border border-white/20">
          <Leaf className="mx-auto text-[var(--gold)]" size={40} />
          <p className="display mt-4 text-3xl font-bold">Admin Portal Protected</p>
          <p className="mt-2 text-xs leading-6 text-white/70">
            Sign in with your administrator email OTP code to manage the store catalog and orders.
          </p>
          <Link
            href="/admin/login"
            className="mt-6 inline-flex rounded-full bg-[var(--gold)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--forest)] hover:bg-white transition"
          >
            Go to Admin Login
          </Link>
        </div>
      </main>
    );
  }

  const params = await searchParams;
  const products = await getProducts();
  const dbReady = Boolean(process.env.DATABASE_URL);

  let orders: AdminOrder[] = [];
  try {
    if (dbReady) {
      orders = (await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      })) as unknown as AdminOrder[];
    }
  } catch (e) {
    console.error("Failed to load orders for admin:", e);
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <main className="min-h-screen bg-[var(--background)] selection:bg-[var(--leaf)] selection:text-[var(--forest)]">
      {/* Admin Top Navigation */}
      <header className="border-b border-[var(--card-border)] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--forest)] transition"
            >
              <ArrowLeft size={15} />
              <span>Back to Storefront</span>
            </Link>
            <div className="flex items-center gap-2 mt-2">
              <Leaf size={20} className="text-[var(--forest)]" />
              <h1 className="display text-3xl font-bold text-[var(--forest)]">
                Shop Control Center
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-[var(--muted)] sm:inline">
              Signed in as <strong>{session.email}</strong>
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full border border-[var(--card-border)] px-4 py-2 text-xs font-bold text-[var(--forest)] hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {/* Metric Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--forest)] p-6 text-white shadow-xs">
            <div className="flex items-center justify-between">
              <Box size={20} className="text-[var(--gold)]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Catalog</span>
            </div>
            <p className="mt-4 text-3xl font-bold">{products.length}</p>
            <p className="mt-1 text-xs text-white/70">Active dry fruit products</p>
          </div>

          <div className="rounded-3xl border border-[var(--card-border)] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <ShoppingBag size={20} className="text-[var(--clay)]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Orders</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[var(--forest)]">{orders.length}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Recent orders recorded</p>
          </div>

          <div className="rounded-3xl border border-[var(--card-border)] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <TrendingUp size={20} className="text-emerald-700" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Volume</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[var(--forest)]">₹{totalRevenue}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Logged sales total</p>
          </div>

          <div className="rounded-3xl border border-[var(--card-border)] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <Database size={20} className="text-[var(--clay)]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">PostgreSQL</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[var(--forest)]">{dbReady ? "Connected" : "Fallback"}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Port 5433 (Transactional)</p>
          </div>
        </div>

        {/* Notifications */}
        {params.error === "database" && (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-xs font-semibold text-amber-800 border border-amber-200">
            Connect PostgreSQL with DATABASE_URL before saving products.
          </div>
        )}
        {params.saved && (
          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200">
            Product saved and published successfully!
          </div>
        )}

        {/* Recent Orders Section */}
        <section className="mt-10 rounded-3xl border border-[var(--card-border)] bg-white p-6 shadow-xs sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--clay)]">
                Live Store Registry
              </span>
              <h2 className="display text-2xl font-bold text-[var(--forest)]">
                Recent Customer Orders ({orders.length})
              </h2>
            </div>
            <span className="text-xs text-[var(--muted)]">
              Transactional Postgres Records
            </span>
          </div>

          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[var(--muted)] font-bold">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Address</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[var(--background)]/30 transition">
                      <td className="py-3 font-extrabold text-[var(--forest)]">
                        #{order.orderNumber || order.id.slice(0, 10)}
                      </td>
                      <td className="py-3 text-[var(--muted)]">
                        {new Intl.DateTimeFormat("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(order.createdAt))}
                      </td>
                      <td className="py-3 font-semibold text-[var(--forest)]">
                        {order.customerName}
                      </td>
                      <td className="py-3 text-[var(--muted)]">{order.phone}</td>
                      <td className="py-3 text-[var(--muted)] truncate max-w-[180px]">
                        {order.address}
                      </td>
                      <td className="py-3 font-bold text-[var(--forest)]">
                        ₹{Number(order.total)}
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-[#fbe7dd] px-2 py-0.5 text-[10px] font-bold text-[var(--clay)]">
                          {order.paymentMethod || "COD"}
                        </span>
                      </td>
                      <td className="py-3">
                        <form action={updateOrderStatus} className="flex items-center gap-1.5">
                          <input type="hidden" name="id" value={order.id} />
                          <select
                            name="status"
                            defaultValue={order.status}
                            className={`rounded-lg px-2 py-1 text-[11px] font-bold border outline-none cursor-pointer ${
                              order.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : order.status === "CANCELLED"
                                ? "bg-red-50 text-red-800 border-red-300"
                                : order.status === "CONFIRMED"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : order.status === "PACKED"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-gray-50 text-gray-800 border-gray-300"
                            }`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PACKED">PACKED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg bg-[var(--forest)] px-2 py-1 text-[10px] font-bold text-white hover:bg-[var(--clay)] transition cursor-pointer"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-[var(--muted)]">
              No orders placed yet. Orders created via storefront checkout will appear here in real time.
            </p>
          )}
        </section>

        {/* Collection & Add Product Form Grid */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Current Products */}
          <section className="rounded-3xl border border-[var(--card-border)] bg-white p-6 shadow-xs sm:p-8">
            <h2 className="display text-2xl font-bold text-[var(--forest)]">
              Current Dry Fruit Catalog
            </h2>
            <div className="mt-6 divide-y divide-[var(--card-border)]">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="h-14 w-14 rounded-2xl object-cover bg-[#eae7df] mix-blend-multiply shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-sm text-[var(--forest)]">{product.name}</p>
                      <p className="text-xs font-semibold text-[var(--clay)]">
                        ₹{product.price} / {product.unit} &bull; {product.category}
                      </p>
                    </div>
                  </div>

                  {dbReady && !fallbackProducts.some((item) => item.id === product.id) && (
                    <form action={archiveProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        Archive
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Add a Product Form */}
          <section className="rounded-3xl border border-[var(--card-border)] bg-white p-6 shadow-xs sm:p-8">
            <h2 className="display text-2xl font-bold text-[var(--forest)]">Add New Product</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Add products to the active PostgreSQL database catalog.
            </p>

            <form action={createProduct} className="mt-6 space-y-3.5">
              {[
                ["name", "Product Name (e.g. Royal Kashmiri Walnuts)"],
                ["hindiName", "Hindi Name (e.g. Akhrot Giri)"],
                ["description", "Short Description"],
                ["price", "Base Price (INR)"],
                ["unit", "Base Pack Size (e.g. 250g or 100g)"],
                ["badge", "Badge (e.g. Premium, Superfood, Organic)"],
                ["category", "Category (Walnuts, Nuts, Dried fruit, Seeds)"],
                ["imageUrl", "Image URL"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="block text-[11px] font-bold text-[var(--forest)] mb-1">
                    {label.split("(")[0].trim()}
                  </label>
                  <input
                    name={name}
                    required
                    type={name === "price" ? "number" : name === "imageUrl" ? "url" : "text"}
                    placeholder={label}
                    className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-2.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
                  />
                </div>
              ))}

              <label className="flex items-center gap-2 pt-2 text-xs font-bold text-[var(--forest)] cursor-pointer">
                <input name="featured" type="checkbox" className="rounded text-[var(--forest)]" />
                <span>Feature this product on homepage</span>
              </label>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--clay)] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--clay-hover)] cursor-pointer"
              >
                <Plus size={16} />
                <span>Publish to Store Catalog</span>
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}