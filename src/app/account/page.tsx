import { ArrowLeft, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getSession } from "@/lib/auth";

export default async function AccountPage() {
  const session = await getSession();
  if (!session || session.role !== "USER") return <main className="flex min-h-screen items-center justify-center bg-[var(--forest)] px-6 text-center text-white"><div><p className="display text-4xl">Your pantry, your way.</p><p className="mt-3 text-white/70">Sign in to view your account.</p><Link href="/login" className="mt-7 inline-flex rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-bold text-[var(--forest)]">Customer sign in</Link></div></main>;
  return <main className="min-h-screen bg-[var(--background)]"><header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6"><Link href="/" className="flex items-center gap-2 text-sm font-bold text-[var(--muted)]"><ArrowLeft size={16} /> Storefront</Link><form action={logout}><button className="flex items-center gap-2 rounded-full border border-[var(--forest)]/15 px-4 py-2 text-sm font-bold text-[var(--forest)]"><LogOut size={16} /> Sign out</button></form></header><section className="mx-auto max-w-5xl px-6 py-16"><UserRound className="text-[var(--clay)]" size={30} /><h1 className="display mt-5 text-5xl text-[var(--forest)]">Good to see you.</h1><p className="mt-3 text-[var(--muted)]">Signed in as {session.email}. Your saved orders and delivery details will live here.</p><Link href="/#products" className="mt-8 inline-flex rounded-full bg-[var(--forest)] px-6 py-3 text-sm font-bold text-white">Browse dry fruits</Link></section></main>;
}
