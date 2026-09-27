import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "meva_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-change-me");

export async function createSession(email: string, role: "ADMIN" | "USER") {
  const token = await new SignJWT({ email, role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  (await cookies()).set(cookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "", maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, secret)).payload as { email: string; role: string }; } catch { return null; }
}

export async function clearSession() { (await cookies()).delete(cookieName); }