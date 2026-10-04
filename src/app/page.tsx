import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Leaf,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import HeroScene from "@/components/hero-scene";
import HeroReveal from "@/components/hero-reveal";
import CrumbTrail from "@/components/crumb-trail";
import Storefront from "@/components/storefront";
import { getProducts } from "@/lib/catalog";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const products = await getProducts();
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-[var(--leaf)] selection:text-[var(--forest)]">
      {/* Top Announcement Bar */}
      <div className="bg-[var(--forest)] px-4 py-2 text-center text-xs font-medium text-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <Sparkles size={13} className="text-[var(--gold)]" />
          <span>
            A fresher pantry, close to home <strong className="text-[var(--gold-light)]">Free society delivery within 60 minutes</strong>
          </span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--card-border)] bg-[#fffefa]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-10">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--forest)] text-[var(--gold)] transition group-hover:scale-105">
              <Leaf size={20} />
            </div>
            <div>
              <span className="display text-[22px] font-bold text-[var(--forest)] block leading-none">
                meva<span className="text-[var(--clay)]">.</span>house
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.17em] text-[var(--muted)] block mt-1">
                A good daily handful
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 text-sm font-semibold text-[var(--muted)] md:flex">
            <Link href="#categories" className="hover:text-[var(--forest)] transition">
              Shop by type
            </Link>
            <Link href="#collection" className="hover:text-[var(--forest)] transition">
              Best sellers
            </Link>
            <Link href="#promise" className="hover:text-[var(--forest)] transition">
              Our promise
            </Link>
          </nav>

          {/* Account & Admin Action Buttons */}
          <div className="flex items-center gap-3">
            {session?.role === "USER" ? (
              <Link
                href="/account"
                className="flex items-center gap-1.5 rounded-full bg-[var(--background)] px-4 py-2 text-xs font-bold text-[var(--forest)] hover:bg-[var(--leaf)]/50 transition"
              >
                <UserCheck size={15} />
                <span>My Account</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-xs font-bold text-[var(--muted)] transition hover:text-[var(--forest)] sm:block"
              >
                Sign In
              </Link>
            )}

            <Link
              href="#collection"
              className="flex items-center gap-2 rounded-full bg-[var(--forest)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--clay)]"
            >
              <ShoppingBag size={14} />
              <span className="hidden sm:inline">Shop pantry</span>
              <span className="sm:hidden">Shop</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-band relative overflow-hidden">
          <div className="hero-inner relative mx-auto grid max-w-[1500px] items-center gap-3 px-5 py-5 sm:min-h-[600px] sm:gap-4 sm:px-8 sm:py-8 lg:min-h-[620px] lg:grid-cols-[0.92fr_1.08fr] lg:px-14 lg:py-10">
            {/* Left Column: Hero Copy */}
            <div className="relative z-10 flex flex-col justify-center py-3 sm:py-8 lg:py-12">
              <div className="rise-in mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--forest)]/10 bg-white/80 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--forest)] shadow-sm sm:mb-6">
                <span className="h-2 w-2 rounded-full bg-[#66a66b] shadow-[0_0_0_4px_rgba(102,166,107,0.13)]" />
                <span>Small batches, big goodness</span>
              </div>

              <h1 className="display rise-in max-w-[700px] text-[clamp(2.5rem,6vw,5.4rem)] font-normal leading-[0.99] text-[var(--forest)]">
                A little joy in <span className="relative inline-block text-[var(--clay)] italic">every handful.</span>
              </h1>

              <p className="rise-in mt-4 max-w-lg text-[14px] leading-6 text-[var(--muted)] sm:mt-6 sm:text-base sm:leading-7">
                Meet your new pantry staples: handpicked walnuts, crisp almonds, sun-sweet fruit and little everyday superfoods.
              </p>

              {/* CTAs */}
              <div className="rise-in mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
                <Link
                  href="#collection"
                  className="bounce-cta flex items-center gap-2 rounded-lg bg-[#5b9b55] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(52,105,50,0.18)] hover:bg-[var(--forest)]"
                >
                  <span className="cta-bounce-icon"><ShoppingBag size={16} /></span>
                  <span>Shop the pantry</span>
                  <ArrowUpRight size={15} className="cta-bounce-arrow" />
                </Link>
                <Link
                  href="#promise"
                  className="hidden items-center gap-2 rounded-lg border border-[var(--forest)]/15 bg-white/65 px-5 py-3.5 text-sm font-bold text-[var(--forest)] transition hover:border-[var(--forest)]/35 hover:bg-white sm:flex"
                >
                  Why Meva House <ArrowUpRight size={15} />
                </Link>
              </div>

              {/* Compact dashboard-style pantry indicators */}
              <div className="rise-in mt-10 hidden max-w-[560px] grid-cols-3 border-y border-[var(--forest)]/10 py-4 text-xs sm:grid">
                <div>
                  <div className="flex items-center gap-1.5 text-[var(--forest)] font-bold text-sm">
                    <Star size={14} className="fill-[#edb93b] text-[#edb93b]" />
                    <span>4.9 rated</span>
                  </div>
                  <p className="mt-1.5 text-[var(--muted)]">By local homes</p>
                </div>
                <div className="border-l border-[var(--forest)]/10 pl-4">
                  <div className="font-bold text-sm text-[var(--forest)]">100% raw</div>
                  <p className="mt-1.5 text-[var(--muted)]">Nothing unnecessary</p>
                </div>
                <div className="border-l border-[var(--forest)]/10 pl-4">
                  <div className="font-bold text-sm text-[var(--forest)]">&lt; 60 min</div>
                  <p className="mt-1.5 text-[var(--muted)]">Society delivery</p>
                </div>
              </div>
            </div>

            {/* Right Column: product-led still life with the interactive 3D bowl */}
            <div className="hero-art relative mx-auto min-h-[190px] w-full max-w-[720px] overflow-hidden sm:min-h-[430px] lg:min-h-[560px]">
              <div className="hero-art-wash absolute inset-[8%_4%_7%_4%] rounded-[48%_52%_43%_57%/46%_43%_57%_54%] bg-[#dce9cf]" />
              <img
                src="https://the-meva-house.vercel.app/PHOTO-2026-05-05-08-46-52.jpg"
                alt="Premium hand-sorted Kashmiri walnuts"
                className="hero-art-photo absolute inset-[9%_7%_8%_8%] h-[82%] w-[85%] rounded-[48%_52%_46%_54%/43%_44%_56%_57%] object-cover opacity-30 mix-blend-multiply"
              />
              <div className="absolute inset-0 z-[1]" aria-hidden="true">
                <HeroScene />
              </div>

              <HeroReveal
                delay={0.16}
                className="absolute left-1 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--forest)] shadow-[0_10px_30px_rgba(32,61,38,0.1)] backdrop-blur-sm sm:left-5 sm:top-10"
              >
                <Leaf size={13} className="text-[#5b9b55]" /> Kashmiri harvest
              </HeroReveal>

              {/* Animated pantry-status widget inspired by the dashboard reference */}
              <HeroReveal
                delay={0.4}
                className="hero-status-panel absolute bottom-4 right-0 z-10 w-[min(100%,330px)] rounded-xl border border-white/80 bg-[#fffefa]/95 p-4 text-[var(--forest)] shadow-[0_18px_50px_rgba(31,61,39,0.17)] backdrop-blur-md sm:bottom-8 sm:right-2 sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">The daily pantry</span>
                    <p className="display mt-1 text-xl font-semibold">Good things, close by.</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6f0df] text-[#4f8d4d]">
                    <Sparkles size={16} />
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-[#eff4e9] px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]"><span className="h-1.5 w-1.5 rounded-full bg-[#5b9b55]" /> Carefully sorted</span>
                    <p className="mt-1 text-xs font-bold">Small-batch picks</p>
                  </div>
                  <div className="rounded-lg bg-[#fbefd2] px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]"><Truck size={11} /> At your door</span>
                    <p className="mt-1 text-xs font-bold">Within 60 minutes</p>
                  </div>
                </div>
              </HeroReveal>
            </div>
          </div>
        </section>

        <CrumbTrail />

        {/* Trust & Promise Pillars Section */}
        <section id="promise" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[.22em] text-[var(--clay)]">
              The Meva House Standard
            </span>
            <h2 className="display mt-2 text-3xl font-normal text-[var(--forest)] sm:text-5xl">
              Honest ingredients.<br />Handled with <em className="italic">care.</em>
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)] leading-6">
              We started with a simple belief: daily nutrition should be pure, unadulterated, and easily accessible to our neighborhood community.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-[var(--card-border)] bg-white p-7 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--leaf)]/40 text-[var(--forest)]">
                <Leaf size={22} />
              </div>
              <h3 className="mt-5 text-base font-bold text-[var(--forest)]">Single-Origin Crunch</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Authentic Kashmiri snow-white walnuts and select California almonds, vacuum-sealed for zero staleness.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--card-border)] bg-white p-7 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--gold-light)] text-[var(--forest)]">
                <Truck size={22} />
              </div>
              <h3 className="mt-5 text-base font-bold text-[var(--forest)]">Society Fast Delivery</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Packaged right here in the neighborhood and delivered direct to your flat door with zero transit delay.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--card-border)] bg-white p-7 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbe7dd] text-[var(--clay)]">
                <ShieldCheck size={22} />
              </div>
              <h3 className="mt-5 text-base font-bold text-[var(--forest)]">Transactional Continuity</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Every order is logged in our PostgreSQL system with a unique Order ID before WhatsApp dispatch.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--card-border)] bg-white p-7 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--leaf)]/40 text-[var(--forest)]">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="mt-5 text-base font-bold text-[var(--forest)]">Pay on Delivery</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Complete peace of mind: inspect your dry fruits at the door and pay with Cash or instant UPI QR.
              </p>
            </div>
          </div>
        </section>

        {/* Curated Varieties / Moods Section */}
        <section id="categories" className="bg-[#fffefa] px-5 py-14 lg:px-10 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#5b9b55]">
                  A little something for everyone
                </span>
                <h2 className="display mt-1 text-3xl font-normal text-[var(--forest)] sm:text-4xl">
                  Shop by good mood.
                </h2>
              </div>
              <p className="text-xs text-[var(--muted)] max-w-xs leading-5 sm:text-right">
                Pick a pantry favourite and find your new everyday ritual.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-5">
              {[
                { title: "Walnuts", category: "Walnuts", note: "Kashmiri harvest", tone: "#e8efd9" },
                { title: "Nuts", category: "Nuts", note: "A daily handful", tone: "#faedcf" },
                { title: "Dried fruit", category: "Dried fruit", note: "Naturally sweet", tone: "#f6e1d8" },
                { title: "Seeds", category: "Seeds", note: "Tiny powerhouses", tone: "#e2ece6" },
              ].map((item, index) => {
                const product = products.find((entry) => entry.category === item.category);
                return (
                  <Link
                    key={item.category}
                    href="#collection"
                    className="category-orbit group flex min-h-[176px] flex-col items-center justify-center rounded-xl border border-[var(--card-border)] px-3 py-4 text-center transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(25,61,39,0.1)] sm:min-h-[210px]"
                    style={{ backgroundColor: item.tone, animationDelay: `${index * 90}ms` }}
                  >
                    <span className="category-orbit-image relative mb-3 flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-full border-[5px] border-white/80 bg-white shadow-sm sm:h-[112px] sm:w-[112px]">
                      {product && <img src={product.imageUrl} alt="" className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-110" loading="lazy" />}
                      <span className="absolute -right-0.5 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[var(--forest)] shadow-sm"><ArrowUpRight size={13} /></span>
                    </span>
                    <span className="display text-lg font-bold text-[var(--forest)] sm:text-xl">{item.title}</span>
                    <span className="mt-1 text-[10px] font-semibold text-[var(--muted)] sm:text-[11px]">{item.note}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Storefront Products Collection */}
        <section id="collection" className="px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-[#5b9b55]">
                  <Sparkles size={14} />
                  <span>Picked for your pantry</span>
                </div>
                <h2 className="display mt-1 text-4xl font-normal text-[var(--forest)] sm:text-5xl">
                  Today&apos;s good stuff.
                </h2>
              </div>
              <p className="text-xs text-[var(--muted)] max-w-sm leading-5">
                Every packet is hand-checked for weight, crispness, and sealed right before society dispatch.
              </p>
            </div>

            {/* Interactive Client Storefront Component */}
            <Storefront products={products} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="border-t border-white/10 bg-[var(--forest)] px-6 py-16 text-white lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Leaf size={22} className="text-[var(--gold)]" />
              <span className="display text-3xl font-bold">
                The Meva House<span className="text-[var(--gold)]">.</span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-6 text-white/70">
              Pure, single-origin dry fruits and nutrition essentials delivered directly to society residents.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-[var(--gold)]">
              <Clock size={15} />
              <span>Society Express Delivery Hours: 9:00 AM – 9:00 PM</span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:gap-16">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
                Direct WhatsApp Dispatch
              </h4>
              <p className="mt-3 text-xs text-white/70 leading-5">
                Have custom gifting requirements or large family orders?
              </p>
              <a
                href="https://wa.me/919142833856"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[var(--gold)] transition"
              >
                <PhoneCall size={16} />
                <span>+91 91428 33856</span>
              </a>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
                Store Portal
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-white/70">
                <li>
                  <Link href="/login" className="hover:text-white transition">
                    Customer Account Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-white transition">
                    Admin Management Console
                  </Link>
                </li>
                <li>
                  <Link href="#promise" className="hover:text-white transition">
                    Quality Promise & Returns
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-[11px] text-white/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} The Meva House. All rights reserved.</p>
          <p>Hand-packed with care &bull; Society-local distribution</p>
        </div>
      </footer>
    </div>
  );
}
