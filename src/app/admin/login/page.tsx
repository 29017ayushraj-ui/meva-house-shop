import { ArrowLeft, CheckCircle2, KeyRound, Leaf, Mail, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { requestOtp, verifyOtp } from "@/app/actions/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; email?: string }>;
}) {
  const params = await searchParams;
  const configuredEmail = process.env.ADMIN_EMAIL || "admin@mevahouse.local";
  const email = params.email || configuredEmail;
  const sent = params.sent === "1";

  const errorMessage =
    params.error === "email-config"
      ? "Email delivery is not configured. Please add RESEND_API_KEY and EMAIL_FROM in your environment."
      : params.error === "code"
      ? "That 6-digit verification code is invalid or has expired."
      : params.error === "unauthorized"
      ? "This email is not authorized for administrative access. Please use the configured administrator address."
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--forest)] px-6 py-12 selection:bg-[var(--gold)] selection:text-[var(--forest)]">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl sm:p-10 border border-white/10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--forest)] transition"
        >
          <ArrowLeft size={15} />
          <span>Back to Storefront</span>
        </Link>

        {/* Header */}
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--forest)] text-[var(--gold)]">
              <Leaf size={18} />
            </div>
            <span className="display text-2xl font-bold text-[var(--forest)]">
              The Meva House<span className="text-[var(--clay)]">.</span>
            </span>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <span className="rounded-full bg-[#fbe7dd] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--clay)]">
              Staff Portal
            </span>
          </div>

          <h1 className="display mt-3 text-3xl font-bold text-[var(--forest)]">
            Admin Management
          </h1>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Single-use email OTP authentication to access product catalog, orders, and shop settings.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* OTP Request or Verification Step */}
        {!sent ? (
          <form action={requestOtp} className="mt-7 space-y-4">
            <input type="hidden" name="flow" value="admin" />

            <div>
              <label className="block text-xs font-bold text-[var(--forest)] mb-1">
                Administrator Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                defaultValue={email}
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
              />
              <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                A 6-digit code will be generated and dispatched to your email.
              </p>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--clay)] cursor-pointer"
            >
              <Mail size={16} />
              <span>Send Admin Security Code</span>
            </button>
          </form>
        ) : (
          <div className="mt-7 space-y-5">
            <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>
                Code sent to <strong>{email}</strong>. It expires in 10 minutes.
              </span>
            </div>

            <form action={verifyOtp} className="space-y-4">
              <input type="hidden" name="flow" value="admin" />
              <input type="hidden" name="email" value={email} />

              <div>
                <label className="block text-xs font-bold text-[var(--forest)] mb-1">
                  Enter 6-Digit One-Time Code
                </label>
                <input
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                  autoFocus
                  placeholder="1 2 3 4 5 6"
                  className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-[var(--forest)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--clay)] cursor-pointer"
              >
                <KeyRound size={16} />
                <span>Verify & Enter Dashboard</span>
              </button>
            </form>

            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <form action={requestOtp}>
                <input type="hidden" name="flow" value="admin" />
                <input type="hidden" name="resend" value="1" />
                <input type="hidden" name="email" value={email} />
                <button type="submit" className="text-[var(--clay)] hover:underline cursor-pointer">
                  Resend code
                </button>
              </form>

              <Link href="/admin/login" className="text-[var(--muted)] hover:text-[var(--forest)]">
                Use different email
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
