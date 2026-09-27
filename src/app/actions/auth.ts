"use server";

import { createHash, randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const normalizeEmail = (value: FormDataEntryValue | null) => String(value || "").trim().toLowerCase();
const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

async function sendOtpEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") return false;
    console.info(`[DEV OTP] ${email}: ${code}`);
    return true;
  }
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [email], subject: "Your Meva House login code", html: `<div style="font-family:Arial,sans-serif;max-width:520px"><p style="color:#b65c3b;font-weight:bold;letter-spacing:2px">THE MEVA HOUSE</p><h1>Your login code</h1><p>Use this one-time code to access your shop admin portal:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#183d2b">${code}</p><p>This code expires in 10 minutes and can only be used once.</p></div>` }) });
  return response.ok;
}

export async function requestOtp(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const flow = String(formData.get("flow") || "customer");
  const loginPath = flow === "admin" ? "/admin/login" : "/login";
  const resend = String(formData.get("resend") || "") === "1";
  if (!email.includes("@")) redirect(`${loginPath}?error=email`);
  if (flow === "admin" && email !== (process.env.ADMIN_EMAIL || "admin@mevahouse.local").toLowerCase()) redirect(`${loginPath}?error=unauthorized`);
  const recent = await prisma.otpCode.findFirst({ where: { email, purpose: "ADMIN_LOGIN", createdAt: { gt: new Date(Date.now() - 60_000) }, usedAt: null } });
  if (recent && !resend) redirect(`${loginPath}?sent=1&email=${encodeURIComponent(email)}`);
  const code = String(randomInt(100000, 1000000));
  await prisma.otpCode.deleteMany({ where: { email, purpose: "ADMIN_LOGIN", usedAt: null } });
  const sent = await sendOtpEmail(email, code);
  if (!sent) redirect(`${loginPath}?error=email-config`);
  await prisma.otpCode.create({ data: { email, codeHash: hashCode(code), purpose: "ADMIN_LOGIN", expiresAt: new Date(Date.now() + 10 * 60_000) } });
  redirect(`${loginPath}?sent=1&email=${encodeURIComponent(email)}`);
}

export async function verifyOtp(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const code = String(formData.get("code") || "").trim();
  const flow = String(formData.get("flow") || "customer");
  const loginPath = flow === "admin" ? "/admin/login" : "/login";
  if (flow === "admin" && email !== (process.env.ADMIN_EMAIL || "admin@mevahouse.local").toLowerCase()) redirect(`${loginPath}?error=unauthorized`);
  const otp = await prisma.otpCode.findFirst({ where: { email, purpose: "ADMIN_LOGIN", usedAt: null, expiresAt: { gt: new Date() }, attempts: { lt: 5 } }, orderBy: { createdAt: "desc" } });
  if (!otp || hashCode(code) !== otp.codeHash) {
    if (otp) await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    redirect(`${loginPath}?sent=1&email=${encodeURIComponent(email)}&error=code`);
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  await prisma.admin.upsert({ where: { email }, update: {}, create: { email, name: email.split("@")[0], passwordHash: "otp-managed" } });
  await createSession(email, "ADMIN");
  redirect("/admin");
}

export async function userRegister(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  if (name.length < 2 || !email.includes("@") || password.length < 8) redirect("/login?mode=register&error=register");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/login?error=exists");
  await prisma.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12) } });
  await createSession(email, "USER");
  redirect("/");
}

export async function userLogin(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) redirect("/login?error=login");
  await createSession(email, "USER");
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect("/login?mode=forgot&sent=1");
  const code = String(randomInt(100000, 1000000));
  await prisma.otpCode.deleteMany({ where: { email, purpose: "PASSWORD_RESET", usedAt: null } });
  const sent = await sendOtpEmail(email, code);
  if (!sent) redirect("/login?mode=forgot&error=email-config");
  await prisma.otpCode.create({ data: { email, codeHash: hashCode(code), purpose: "PASSWORD_RESET", expiresAt: new Date(Date.now() + 10 * 60_000) } });
  redirect(`/login?mode=reset&sent=1&email=${encodeURIComponent(email)}`);
}

export async function resetPassword(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const code = String(formData.get("code") || "").trim();
  const password = String(formData.get("password") || "");
  const otp = await prisma.otpCode.findFirst({ where: { email, purpose: "PASSWORD_RESET", usedAt: null, expiresAt: { gt: new Date() }, attempts: { lt: 5 } }, orderBy: { createdAt: "desc" } });
  if (password.length < 8 || !otp || hashCode(code) !== otp.codeHash) redirect(`/login?mode=reset&sent=1&email=${encodeURIComponent(email)}&error=code`);
  await prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  await prisma.user.update({ where: { email }, data: { passwordHash: await bcrypt.hash(password, 12) } });
  redirect("/login?reset=1");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (email !== (process.env.ADMIN_EMAIL || "admin@mevahouse.local").toLowerCase() || password !== (process.env.ADMIN_PASSWORD || "change-me-now")) redirect("/login?error=1");
  await createSession(email, "ADMIN");
  redirect("/admin");
}

export async function logout() { await clearSession(); redirect("/"); }