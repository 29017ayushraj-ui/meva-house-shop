import { ArrowLeft, CheckCircle2, KeyRound, Leaf, LockKeyhole, Mail, ShieldAlert, UserPlus } from "lucide-react";
import Link from "next/link";
import { requestPasswordReset, resetPassword, userLogin, userRegister } from "@/app/actions/auth";

export default async function UserLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string; sent?: string; email?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode || "login";
  const email = params.email || "";

  const errorMessage =
    params.error === "login"
      ? "The email or password you entered is incorrect."
      : params.error === "exists"
      ? "An account already exists for this email address."
      : params.error === "register"
      ? "Please provide your full name, valid email, and a secure password (minimum 8 characters)."
      : params.error === "code"
      ? "That verification code is incorrect or has expired. Please try again."
      : params.error === "email-config"
      ? "Email delivery service is currently unavailable. Please contact support."
      : null;

  const successMessage = params.reset
    ? "Your password has been reset successfully! You can now sign in with your new password."
    : params.sent === "1" && mode === "reset"
    ? `We sent a 6-digit verification code to ${email}. Check your inbox (and spam folder).`
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

        {/* Brand Heading */}
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--forest)] text-[var(--gold)]">
              <Leaf size={18} />
            </div>
            <span className="display text-2xl font-bold text-[var(--forest)]">
              The Meva House<span className="text-[var(--clay)]">.</span>
            </span>
          </div>

          <h1 className="display mt-6 text-3xl font-bold text-[var(--forest)]">
            {mode === "register"
              ? "Create your account"
              : mode === "forgot"
              ? "Forgot password"
              : mode === "reset"
              ? "Enter verification code"
              : "Welcome back"}
          </h1>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            {mode === "register"
              ? "Join The Meva House for society doorstep delivery and order history."
              : mode === "forgot"
              ? "Enter your registered email and we'll send a 6-digit OTP to reset your password."
              : mode === "reset"
              ? "Check your email for the verification code and choose a new password."
              : "Sign in to access your saved details and track orders."}
          </p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Modes */}
        {mode === "register" ? (
          <form action={userRegister} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--forest)] mb-1">Full Name</label>
              <input
                name="name"
                required
                placeholder="e.g. Priya Sharma"
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--forest)] mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--forest)] mb-1">Password</label>
              <input
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
              />
            </div>

            <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--clay)] cursor-pointer">
              <UserPlus size={16} />
              <span>Create Customer Account</span>
            </button>

            <div className="pt-2 text-center text-xs font-semibold text-[var(--muted)]">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--clay)] font-bold hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        ) : mode === "forgot" ? (
          <form action={requestPasswordReset} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--forest)] mb-1">Account Email</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={email}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
              />
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--clay)] cursor-pointer">
              <Mail size={16} />
              <span>Send 6-Digit Reset Code</span>
            </button>

            <div className="pt-2 text-center text-xs font-semibold">
              <Link href="/login" className="text-[var(--clay)] font-bold hover:underline">
                Return to sign in
              </Link>
            </div>
          </form>
        ) : mode === "reset" && params.sent === "1" ? (
          <form action={resetPassword} className="mt-7 space-y-4">
            <input type="hidden" name="email" value={email} />

            <div>
              <label className="block text-xs font-bold text-[var(--forest)] mb-1">
                6-Digit Verification Code
              </label>
              <input
                name="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoFocus
                placeholder="1 2 3 4 5 6"
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-[var(--forest)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--forest)] mb-1">
                New Password (8+ characters)
              </label>
              <input
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="Enter new secure password"
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
              />
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--clay)] cursor-pointer">
              <KeyRound size={16} />
              <span>Update Password & Sign In</span>
            </button>
          </form>
        ) : (
          <form action={userLogin} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--forest)] mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[var(--forest)]">Password</label>
                <Link
                  href="/login?mode=forgot"
                  className="text-[11px] font-semibold text-[var(--clay)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                placeholder="Your account password"
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/40 px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--clay)] focus:bg-white transition"
              />
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--clay)] cursor-pointer">
              <LockKeyhole size={16} />
              <span>Sign In to Account</span>
            </button>

            <div className="pt-2 text-center text-xs font-semibold text-[var(--muted)]">
              New customer?{" "}
              <Link href="/login?mode=register" className="text-[var(--clay)] font-bold hover:underline">
                Create an account
              </Link>
            </div>
          </form>
        )}

        <div className="mt-8 border-t border-[var(--card-border)] pt-5 text-center">
          <Link
            href="/admin/login"
            className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-light)] hover:text-[var(--forest)] transition"
          >
            Store Admin Management &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
