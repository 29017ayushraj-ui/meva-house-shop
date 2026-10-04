"use client";

import {
  ArrowRight,
  Banknote,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Flame,
  LoaderCircle,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";

type CartItem = Product & {
  unit: string;
  price: number;
  quantity: number;
};

type CheckoutForm = {
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: "COD" | "ONLINE";
};

type OrderSuccessData = {
  orderId: string;
  orderNumber: string;
  whatsappUrl: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  items: Array<{ name: string; unit: string; quantity: number; price: number }>;
};

const CATEGORIES = ["All", "Walnuts", "Nuts", "Dried fruit", "Seeds"];

const weightsFor = (product: Product) => {
  return product.unit === "100g"
    ? ["100g", "250g", "500g"]
    : ["250g", "500g", "1kg"];
};

const priceFor = (product: Product, weight: string) => {
  const baseWeightVal = parseInt(product.unit, 10);
  const targetWeightVal = parseInt(weight, 10);
  if (weight === "1kg") {
    return Math.round(product.price * (1000 / baseWeightVal));
  }
  return Math.round(product.price * (targetWeightVal / baseWeightVal));
};

export default function Storefront({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessData | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [selectedWeights, setSelectedWeights] = useState<Record<string, string>>({});
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [checkout, setCheckout] = useState<CheckoutForm>({
    customerName: "",
    customerEmail: "",
    phone: "",
    address: "",
    notes: "",
    paymentMethod: "COD",
  });

  // Category item counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    for (const cat of CATEGORIES) {
      if (cat !== "All") {
        counts[cat] = products.filter((p) => p.category === cat).length;
      }
    }
    return counts;
  }, [products]);

  // Dynamic filtered and sorted list
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesQuery = `${product.name} ${product.hindiName} ${product.category} ${product.description}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesCategory = category === "All" || product.category === category;
        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "name") return a.name.localeCompare(b.name);
        return Number(b.featured) - Number(a.featured);
      });
  }, [category, products, query, sort]);

  // Cart operations
  const addToBag = (product: Product) => {
    const unit = selectedWeights[product.id] || product.unit;
    const price = priceFor(product, unit);
    const itemKey = `${product.id}-${unit}`;

    setCart((current) => {
      const exists = current.some((item) => item.id === product.id && item.unit === unit);
      if (exists) {
        return current.map((item) =>
          item.id === product.id && item.unit === unit
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, unit, price, quantity: 1 }];
    });

    setRecentlyAddedId(itemKey);
    setAddedItemNotice(`Added ${product.name} (${unit}) to your bag`);
    setTimeout(() => setRecentlyAddedId(null), 1800);
    setTimeout(() => setAddedItemNotice(null), 2500);
  };

  const updateQuantity = (id: string, unit: string, changeBy: number) => {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.id === id && item.unit === unit) {
          const nextQty = item.quantity + changeBy;
          return nextQty > 0 ? [{ ...item, quantity: nextQty }] : [];
        }
        return [item];
      })
    );
  };

  const removeItem = (id: string, unit: string) => {
    setCart((current) => current.filter((item) => !(item.id === id && item.unit === unit)));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Submit order to transactional backend
  const handleOrderSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cart.length === 0) return;

    setIsSubmittingOrder(true);
    setSubmitError(null);

    try {
      const payload = {
        customerName: checkout.customerName,
        customerEmail: checkout.customerEmail,
        phone: checkout.phone,
        address: checkout.address,
        notes: checkout.notes,
        paymentMethod: checkout.paymentMethod,
        items: cart.map(({ id, name, unit, quantity, price }) => ({
          id,
          name,
          unit,
          quantity,
          price,
        })),
        total: cartSubtotal,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order. Please try again.");
      }

      // Order created successfully in Postgres transactionally!
      setOrderSuccess({
        orderId: data.orderId,
        orderNumber: data.orderNumber || data.orderId,
        whatsappUrl: data.whatsappUrl,
        customerName: checkout.customerName,
        phone: checkout.phone,
        address: checkout.address,
        total: cartSubtotal,
        items: cart.map((i) => ({ name: i.name, unit: i.unit, quantity: i.quantity, price: i.price })),
      });

      // Clear the cart
      setCart([]);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const copyOrderReference = () => {
    if (!orderSuccess) return;
    navigator.clipboard.writeText(orderSuccess.orderNumber || orderSuccess.orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  return (
    <div className="relative">
      {/* Toast Notice */}
      {addedItemNotice && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white shadow-2xl transition-all"
        >
          <Sparkles size={16} className="text-[var(--gold)]" />
          <span>{addedItemNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar Header */}
      <div className="mt-10 flex flex-col gap-5 border-y border-[var(--card-border)] py-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat;
            const count = categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`group flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[var(--forest)] text-white shadow-sm"
                    : "bg-white/80 text-[var(--muted)] hover:bg-white hover:text-[var(--forest)] border border-[var(--card-border)]"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--background)] text-[var(--muted)] group-hover:bg-[var(--leaf)]/50"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex min-w-0 flex-1 items-center rounded-full border border-[var(--card-border)] bg-white px-4 py-2 text-sm text-[var(--muted)] shadow-xs transition focus-within:border-[var(--clay)] focus-within:ring-2 focus-within:ring-[var(--clay)]/10 sm:w-72">
            <Search size={16} className="text-[var(--muted)] shrink-0 mr-2" />
            <input
              type="text"
              aria-label="Search collection"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dry fruits, seeds..."
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--muted-light)] text-[var(--foreground)]"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="ml-1 text-[var(--muted)] hover:text-[var(--forest)] p-0.5 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative flex items-center rounded-full border border-[var(--card-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--forest)] shadow-xs">
            <span className="sr-only">Sort products</span>
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-transparent pr-6 outline-none cursor-pointer"
            >
              <option value="featured">Featured Picks</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name (A to Z)</option>
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 text-[var(--muted)]" />
          </div>
        </div>
      </div>

      {/* Results summary bar */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">
          Showing <strong className="font-bold text-[var(--forest)]">{filteredProducts.length}</strong> of{" "}
          {products.length} handpicked selections
          {query && <span> for &ldquo;{query}&rdquo;</span>}
        </p>
        <div className="hidden items-center gap-4 text-xs font-semibold text-[var(--clay)] sm:flex">
          <span className="flex items-center gap-1.5">
            <Truck size={14} /> Free Society Delivery
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} /> Pay on Delivery
          </span>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const activeWeight = selectedWeights[product.id] || product.unit;
            const currentPrice = priceFor(product, activeWeight);
            const itemKey = `${product.id}-${activeWeight}`;
            const isJustAdded = recentlyAddedId === itemKey;

            return (
              <article
                key={product.id}
                className="product-card group relative flex flex-col justify-between rounded-3xl border border-[var(--card-border)] bg-white p-4 shadow-sm"
              >
                <div>
                  {/* Image Container with Badge */}
                  <div className="relative aspect-[1/0.95] overflow-hidden rounded-2xl bg-[#eae7df]">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image h-full w-full object-cover mix-blend-multiply"
                      loading="lazy"
                    />
                    {/* Badge */}
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--clay)] shadow-xs backdrop-blur-xs">
                      {product.badge === "Popular" && <Flame size={12} className="text-[var(--clay)]" />}
                      <span>{product.badge}</span>
                    </div>

                    {/* Quick Add Button on Image */}
                    <button
                      aria-label={`Add ${product.name} to cart`}
                      onClick={() => addToBag(product)}
                      className={`absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-200 active:scale-95 ${
                        isJustAdded
                          ? "bg-emerald-600 scale-105"
                          : "bg-[var(--forest)] hover:bg-[var(--clay)] hover:scale-105"
                      }`}
                    >
                      {isJustAdded ? <Check size={20} className="animate-in zoom-in" /> : <Plus size={20} />}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="display text-2xl font-normal leading-tight text-[var(--forest)]">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-[var(--clay)]">
                          {product.hindiName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-[var(--muted-light)] block">Price</span>
                        <span className="text-xl font-bold text-[var(--forest)]">₹{currentPrice}</span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-[var(--muted)] line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Weight Selector Tabs */}
                <div className="mt-4 pt-3 border-t border-[var(--card-border)]">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted)] mb-2">
                    <span>Select Pack Size:</span>
                    <span className="text-[var(--forest)] font-bold">{activeWeight}</span>
                  </div>
                  <div className="flex gap-1.5 rounded-xl bg-[var(--background)] p-1">
                    {weightsFor(product).map((wt) => {
                      const isSelected = activeWeight === wt;
                      return (
                        <button
                          key={wt}
                          type="button"
                          onClick={() =>
                            setSelectedWeights((prev) => ({ ...prev, [product.id]: wt }))
                          }
                          className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-white text-[var(--forest)] shadow-xs"
                              : "text-[var(--muted)] hover:text-[var(--forest)]"
                          }`}
                        >
                          {wt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add To Bag Action */}
                  <button
                    onClick={() => addToBag(product)}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                      isJustAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-[var(--forest)] text-white hover:bg-[var(--clay)] shadow-xs"
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check size={14} /> Added to Bag
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} /> Add to Bag · ₹{currentPrice}
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-[var(--card-border)] bg-white px-6 py-16 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--background)] text-[var(--muted)]">
            <Search size={24} />
          </div>
          <h3 className="display mt-4 text-3xl text-[var(--forest)]">No items found</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Try adjusting your search terms or explore other categories.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-6 rounded-full bg-[var(--forest)] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--clay)] transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Floating Bag Pill Button */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-[var(--clay)] px-5 py-3.5 text-sm font-bold text-white shadow-2xl transition hover:bg-[var(--clay-hover)] hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="View shopping bag"
        >
          <ShoppingBag size={19} />
          <span>View Bag</span>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-extrabold text-[var(--clay)]">
            {cartCount}
          </span>
          <span className="border-l border-white/25 pl-2 text-xs font-semibold">
            ₹{cartSubtotal}
          </span>
        </button>
      )}

      {/* Slide-over Cart Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--clay)]">
                  Your Selection
                </span>
                <h2 className="display mt-0.5 text-2xl font-bold text-[var(--forest)]">
                  Shopping Bag ({cartCount})
                </h2>
              </div>
              <button
                aria-label="Close cart"
                onClick={() => setCartDrawerOpen(false)}
                className="rounded-full p-2 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--forest)] transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Delivery Banner */}
            <div className="flex items-center gap-2.5 bg-[#edf4e8] px-6 py-3 text-xs font-semibold text-[var(--forest)]">
              <Truck size={16} className="text-emerald-700 shrink-0" />
              <span>
                <strong>Free Society Delivery</strong> included on this order!
              </span>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--background)] text-[var(--muted)]">
                    <ShoppingBag size={30} className="text-[var(--gold)]" />
                  </div>
                  <h3 className="display mt-4 text-2xl text-[var(--forest)]">Your bag is empty</h3>
                  <p className="mt-2 text-xs text-[var(--muted)] max-w-xs">
                    Explore our hand-sorted walnuts, raw almonds, and premium seeds.
                  </p>
                  <button
                    onClick={() => setCartDrawerOpen(false)}
                    className="mt-6 rounded-full bg-[var(--forest)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--clay)] transition"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--card-border)]">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.unit}`} className="flex gap-4 py-4">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-20 w-20 rounded-2xl object-cover bg-[#eae7df] mix-blend-multiply shrink-0"
                      />
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm text-[var(--forest)] truncate">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id, item.unit)}
                              aria-label={`Remove ${item.name}`}
                              className="text-[var(--muted-light)] hover:text-red-500 p-1"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <span className="text-xs font-semibold text-[var(--clay)]">
                            {item.unit} &bull; ₹{item.price} each
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity stepper */}
                          <div className="flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                            <button
                              onClick={() => updateQuantity(item.id, item.unit, -1)}
                              aria-label="Decrease quantity"
                              className="p-1.5 text-[var(--muted)] hover:text-[var(--forest)]"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-[var(--forest)]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.unit, 1)}
                              aria-label="Increase quantity"
                              className="p-1.5 text-[var(--muted)] hover:text-[var(--forest)]"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <span className="text-sm font-bold text-[var(--forest)]">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-[var(--card-border)] bg-[var(--paper-soft)] p-6">
                <div className="space-y-2 text-xs text-[var(--muted)]">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-[var(--forest)]">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Society Hand Delivery</span>
                    <span className="font-bold text-emerald-700">FREE</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--card-border)] pt-3 text-base font-bold text-[var(--forest)]">
                  <span>Grand Total</span>
                  <span className="text-2xl">₹{cartSubtotal}</span>
                </div>

                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    setCheckoutModalOpen(true);
                  }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--clay)] active:scale-98 cursor-pointer"
                >
                  <span>Proceed to Delivery & Checkout</span>
                  <ArrowRight size={17} />
                </button>

                <p className="mt-3 text-center text-[11px] text-[var(--muted)] flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  <span>Order ID created first &bull; Pay with Cash/UPI on delivery</span>
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Checkout Details Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8 animate-in zoom-in-95 duration-200">
            {/* Modal Close Button */}
            <button
              onClick={() => {
                if (!isSubmittingOrder) {
                  setCheckoutModalOpen(false);
                  setSubmitError(null);
                }
              }}
              aria-label="Close checkout"
              disabled={isSubmittingOrder}
              className="absolute right-5 top-5 rounded-full p-2 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--forest)] transition"
            >
              <X size={20} />
            </button>

            {/* Checkout Form */}
            {!orderSuccess ? (
              <form onSubmit={handleOrderSubmit}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-[.2em] text-[var(--clay)]">
                    Secure Order Checkout
                  </span>
                  <h2 className="display mt-1 text-3xl font-bold text-[var(--forest)]">
                    Where should we deliver?
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                    We create your official order in our database first, then format your WhatsApp dispatch summary.
                  </p>
                </div>

                {submitError && (
                  <div className="mt-4 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-200">
                    {submitError}
                  </div>
                )}

                {/* Form Fields */}
                <div className="mt-6 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[var(--forest)] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Shubham Kumar"
                      value={checkout.customerName}
                      onChange={(e) => setCheckout({ ...checkout, customerName: e.target.value })}
                      className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-[var(--forest)] mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={checkout.phone}
                        onChange={(e) => setCheckout({ ...checkout, phone: e.target.value })}
                        className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--forest)] mb-1">
                        Email Address <span className="text-[var(--muted-light)]">(optional)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="For receipts & tracking"
                        value={checkout.customerEmail}
                        onChange={(e) => setCheckout({ ...checkout, customerEmail: e.target.value })}
                        className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--forest)] mb-1">
                      Society & Complete Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Flat/House No., Tower, Society Name, Landmark..."
                      value={checkout.address}
                      onChange={(e) => setCheckout({ ...checkout, address: e.target.value })}
                      className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--forest)] mb-1">
                      Delivery Instructions <span className="text-[var(--muted-light)]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Leave with guard / deliver between 5-7 PM"
                      value={checkout.notes}
                      onChange={(e) => setCheckout({ ...checkout, notes: e.target.value })}
                      className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
                    />
                  </div>

                  {/* Payment Method Selector (Future Payment Integration Ready) */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-[var(--forest)] mb-2">
                      Payment Method
                    </label>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {/* Cash on Delivery Card */}
                      <label
                        className={`flex items-start gap-3 rounded-2xl border p-3.5 cursor-pointer transition ${
                          checkout.paymentMethod === "COD"
                            ? "border-[var(--forest)] bg-[#edf4e8]/50"
                            : "border-[var(--card-border)] bg-white opacity-80"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="COD"
                          checked={checkout.paymentMethod === "COD"}
                          onChange={() => setCheckout({ ...checkout, paymentMethod: "COD" })}
                          className="mt-1 text-[var(--forest)]"
                        />
                        <div>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--forest)]">
                            <Banknote size={15} /> Cash on Delivery
                          </span>
                          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                            Pay via Cash or UPI at your doorstep.
                          </p>
                        </div>
                      </label>

                      {/* Online Payment Card (Integration Ready) */}
                      <div className="flex items-start gap-3 rounded-2xl border border-[var(--card-border)] p-3.5 bg-gray-50/70 opacity-80 relative overflow-hidden">
                        <input
                          type="radio"
                          name="paymentMethod"
                          disabled
                          className="mt-1"
                        />
                        <div>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                            Instant UPI / Cards
                            <span className="rounded-full bg-[var(--gold)]/20 px-2 py-0.5 text-[9px] font-extrabold uppercase text-[var(--clay)]">
                              Coming Soon
                            </span>
                          </span>
                          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                            Online payment gateway ready for Razorpay.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill Summary in Checkout */}
                <div className="mt-6 border-t border-[var(--card-border)] pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[var(--muted)]">
                      Order Total ({cart.reduce((a, b) => a + b.quantity, 0)} items)
                    </span>
                    <span className="text-xl font-bold text-[var(--forest)]">₹{cartSubtotal}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--clay)] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--clay-hover)] disabled:opacity-60 cursor-pointer"
                >
                  {isSubmittingOrder ? (
                    <>
                      <LoaderCircle className="animate-spin" size={17} />
                      <span>Creating Order in Database...</span>
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      <span>Confirm Order &bull; ₹{cartSubtotal}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Order Confirmed View (With Continuity & WhatsApp Handover) */
              <div className="py-2 text-center animate-in zoom-in-95">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check size={32} />
                </div>

                <span className="mt-4 inline-block text-xs font-bold uppercase tracking-[.2em] text-emerald-700">
                  Order Successfully Created
                </span>
                <h2 className="display mt-1 text-3xl font-bold text-[var(--forest)]">
                  Your Order is Confirmed!
                </h2>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)] max-w-sm mx-auto">
                  Your order has been recorded in our store registry with transactional safety.
                </p>

                {/* Prominent Order Number Card */}
                <div className="mt-6 rounded-2xl border border-[var(--gold)]/30 bg-[#faf7f0] p-4 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        Store Order Reference
                      </span>
                      <p className="text-lg font-extrabold text-[var(--forest)] tracking-wide">
                        #{orderSuccess.orderNumber}
                      </p>
                    </div>
                    <button
                      onClick={copyOrderReference}
                      className="flex items-center gap-1.5 rounded-full border border-[var(--card-border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--forest)] hover:bg-[var(--leaf)]/40 transition cursor-pointer"
                    >
                      {copiedOrderId ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
                      <span>{copiedOrderId ? "Copied!" : "Copy ID"}</span>
                    </button>
                  </div>

                  <div className="mt-3 divide-y divide-[var(--card-border)]/60 text-xs">
                    <div className="py-2 flex justify-between">
                      <span className="text-[var(--muted)]">Customer:</span>
                      <span className="font-semibold text-[var(--forest)]">{orderSuccess.customerName}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-[var(--muted)]">Deliver To:</span>
                      <span className="font-semibold text-[var(--forest)] truncate max-w-[220px]">
                        {orderSuccess.address}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-[var(--muted)]">Payment Mode:</span>
                      <span className="font-semibold text-emerald-700">Cash on Delivery</span>
                    </div>
                    <div className="pt-2 flex justify-between font-bold text-sm text-[var(--forest)]">
                      <span>Total Amount:</span>
                      <span>₹{orderSuccess.total}</span>
                    </div>
                  </div>
                </div>

                {/* Primary WhatsApp Action */}
                <div className="mt-6 space-y-3">
                  <a
                    href={orderSuccess.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-xl transition hover:bg-[#20ba59] active:scale-98 cursor-pointer"
                  >
                    <span>Send Order to WhatsApp Dispatch</span>
                    <ExternalLink size={16} />
                  </a>

                  <p className="text-[11px] text-[var(--muted)] leading-4">
                    Tapping the green button will open WhatsApp with your formatted order summary for our packing team.
                  </p>

                  <button
                    onClick={() => {
                      setCheckoutModalOpen(false);
                      setOrderSuccess(null);
                      setCheckout({
                        customerName: "",
                        customerEmail: "",
                        phone: "",
                        address: "",
                        notes: "",
                        paymentMethod: "COD",
                      });
                    }}
                    className="w-full rounded-full border border-[var(--card-border)] py-2.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--forest)] hover:bg-[var(--background)] transition cursor-pointer"
                  >
                    Done &bull; Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
