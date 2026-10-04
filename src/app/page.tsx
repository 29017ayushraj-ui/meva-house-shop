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
            Society Express Delivery: <strong>Free doorstep delivery within 60 minutes</strong> &bull; Cash & UPI on Delivery
          </span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--card-border)] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--forest)] text-[var(--gold)] transition group-hover:scale-105">
              <Leaf size={20} />
            </div>
            <div>
              <span className="display text-2xl font-bold tracking-tight text-[var(--forest)] block leading-none">
                The Meva House<span className="text-[var(--clay)]">.</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block mt-0.5">
                Artisanal Dry Fruits
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 text-sm font-semibold text-[var(--muted)] md:flex">
            <Link href="#collection" className="hover:text-[var(--forest)] transition">
              Collection
            </Link>
            <Link href="#promise" className="hover:text-[var(--forest)] transition">
              Our Promise
            </Link>
            <Link href="#categories" className="hover:text-[var(--forest)] transition">
              Varieties
            </Link>
            <Link href="#contact" className="hover:text-[var(--forest)] transition">
              Contact & WhatsApp
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
              href="/admin/login"
              className="flex items-center gap-1.5 rounded-full border border-[var(--forest)]/20 px-3.5 py-2 text-xs font-semibold text-[var(--forest)] transition hover:bg-[var(--forest)] hover:text-white"
            >
              <ShoppingBag size={14} />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-4 mt-4 lg:mx-8">
          <div className="grain relative grid min-h-[600px] overflow-hidden rounded-[2.5rem] bg-[var(--forest)] text-white shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left Column: Hero Copy */}
            <div className="flex flex-col justify-center px-8 py-16 sm:px-14 lg:px-20 z-10">
              <div className="rise-in mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[.2em] text-[var(--gold)] backdrop-blur-xs w-fit">
                <Leaf size={14} />
                <span>Small Batch &bull; Society Sourced</span>
              </div>

              <h1 className="display rise-in text-4xl leading-[1.05] sm:text-6xl lg:text-7xl font-normal">
                Pure dry fruits for your <em className="font-normal text-[var(--gold)] italic">daily ritual.</em>
              </h1>

              <p className="rise-in mt-6 max-w-lg text-base leading-7 text-white/75">
                Single-origin Kashmiri walnuts, hand-sorted California almonds, sun-dried apricots, and raw seeds. Delivered fresh within your society with complete trust.
              </p>

              {/* CTAs */}
              <div className="rise-in mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#collection"
                  className="flex items-center gap-2 rounded-full bg-[var(--gold)] px-7 py-3.5 text-sm font-bold text-[var(--forest)] shadow-lg transition hover:bg-white active:scale-95"
                >
                  <span>Explore Collection</span>
                  <ArrowUpRight size={17} />
                </Link>
                <Link
                  href="#promise"
                  className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Why The Meva House
                </Link>
              </div>

              {/* Trust Metric Chips */}
              <div className="rise-in mt-12 grid grid-cols-3 gap-4 border-t border-white/15 pt-6 text-xs">
                <div>
                  <div className="flex items-center gap-1 text-[var(--gold)] font-bold text-sm">
                    <Star size={14} className="fill-[var(--gold)]" />
                    <span>4.9 / 5</span>
                  </div>
                  <p className="mt-1 text-white/60">Society Rated</p>
                </div>
                <div>
                  <div className="font-bold text-sm text-white">100% Raw</div>
                  <p className="mt-1 text-white/60">Zero Preservatives</p>
                </div>
                <div>
                  <div className="font-bold text-sm text-[var(--gold)]">&lt; 60 Mins</div>
                  <p className="mt-1 text-white/60">Doorstep Delivery</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual with Overlay Card */}
            <div className="relative min-h-[380px] overflow-hidden bg-[#d8c4a9] lg:min-h-full">
              <img
                src="https://the-meva-house.vercel.app/PHOTO-2026-05-05-08-46-52.jpg"
                alt="Premium hand-sorted Kashmiri walnuts"
                className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-multiply transition duration-700 hover:scale-105"
              />
              <div className="absolute inset-0" aria-hidden="true">
                <HeroScene />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--forest)]/75 via-transparent to-white/10 lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-white/15" />

              <div className="absolute left-6 top-6 z-10 rounded-full border border-white/50 bg-white/75 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--forest)] shadow-sm backdrop-blur-sm sm:left-8 sm:top-8">
                Kashmir, India <span className="mx-1.5 text-[var(--clay)]">/</span> Hand sorted
              </div>

              {/* Floating Review Card */}
              <div className="absolute bottom-8 left-6 right-6 z-10 rounded-2xl border border-[var(--card-border)] bg-white/95 p-4 text-[var(--forest)] shadow-2xl backdrop-blur-md sm:left-8 sm:right-auto sm:max-w-xs">
                <div className="flex items-center gap-1 text-[var(--gold)] mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className="fill-[var(--gold)]" />
                  ))}
                </div>
                <p className="text-xs font-medium leading-5 text-[var(--foreground)]">
                  &ldquo;Crispest walnuts and almonds we&rsquo;ve ordered. Arrives fresh in vacuum sealed packs within an hour.&rdquo;
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-[var(--clay)]">
                  <span>Pooja S., Tower C</span>
                  <span className="text-[var(--muted)]">Verified Society Order</span>
                </div>
              </div>
            </div>
          </div>
        </section>

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
        <section id="categories" className="bg-[var(--paper-soft)] px-6 py-16 lg:px-10 border-y border-[var(--card-border)]">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[.22em] text-[var(--clay)]">
                  Hand-Curated Varieties
                </span>
                <h2 className="display mt-1 text-3xl font-normal text-[var(--forest)] sm:text-4xl">
                  Find your daily favourite.
                </h2>
              </div>
              <p className="text-xs text-[var(--muted)] max-w-xs leading-5">
                From morning brain foods to evening snacks, explore our small-batch collections.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Link
                href="#collection"
                className="category-tile bg-[#eae1d0] text-[var(--forest)] group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)]/60">
                    Kashmiri Harvest
                  </span>
                  <p className="display mt-1 text-2xl font-bold">Raw Walnuts</p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--clay)]">
                  <span>Snow-White & Orchid</span>
                  <ArrowUpRight size={16} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>

              <Link
                href="#collection"
                className="category-tile bg-[#dce7d1] text-[var(--forest)] group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)]/60">
                    Daily Handful
                  </span>
                  <p className="display mt-1 text-2xl font-bold">Pure Nuts</p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--forest)]">
                  <span>Almonds & Cashews</span>
                  <ArrowUpRight size={16} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>

              <Link
                href="#collection"
                className="category-tile bg-[#f0d8cc] text-[var(--forest)] group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)]/60">
                    Naturally Sweet
                  </span>
                  <p className="display mt-1 text-2xl font-bold">Dried Fruits</p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--clay)]">
                  <span>Apricots & Raisins</span>
                  <ArrowUpRight size={16} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>

              <Link
                href="#collection"
                className="category-tile bg-[#e5dce4] text-[var(--forest)] group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)]/60">
                    Superfood Nutrition
                  </span>
                  <p className="display mt-1 text-2xl font-bold">Healthy Seeds</p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--forest)]">
                  <span>Pumpkin & Chia</span>
                  <ArrowUpRight size={16} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Storefront Products Collection */}
        <section id="collection" className="px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.22em] text-[var(--clay)]">
                  <Sparkles size={14} />
                  <span>The Fresh Pantry</span>
                </div>
                <h2 className="display mt-1 text-4xl font-normal text-[var(--forest)] sm:text-5xl">
                  Order from our collection.
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
