"use server";

import { createHash, randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const normalizeEmail = (value: FormDataEntryValue | null) => String(value || "").trim().toLowerCase();
const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

function renderOtpEmailHtml(code: string, purpose: "ADMIN_LOGIN" | "PASSWORD_RESET") {
  const isadmin = purpose === "ADMIN_LOGIN";
  const title = isadmin ? "Admin Portal Access Code" : "Password Reset Code";
  const intro = isadmin
    ? "A sign-in request was initiated for <strong>The Meva House Store Management</strong> portal. Use the 6-digit verification code below to securely access your dashboard:"
    : "We received a request to reset the password for your <strong>The Meva House</strong> account. Use the 6-digit verification code below to set a new password:";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#253229;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F5F0E8;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px;background-color:#FFFFFF;border-radius:20px;border:1px solid #E6DEC8;box-shadow:0 12px 35px rgba(24,61,43,0.08);overflow:hidden;">
          <!-- Brand Header -->
          <tr>
            <td style="background-color:#183D2B;padding:32px 36px;text-align:center;">
              <div style="color:#D0A75A;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">Artisanal Dry Fruits</div>
              <h1 style="margin:0;color:#FFFFFF;font-family:Georgia,serif;font-size:28px;font-weight:normal;letter-spacing:0.5px;">The Meva House<span style="color:#D0A75A;">.</span></h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding:40px 36px 32px 36px;">
              <div style="display:inline-block;padding:5px 14px;background-color:#F4EFE6;border-radius:20px;color:#B65C3B;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px;">
                ${isadmin ? "🛡️ Security Verification" : "🔑 Account Assistance"}
              </div>
              <h2 style="margin:0 0 16px 0;color:#183D2B;font-size:22px;font-weight:700;">${title}</h2>
              <p style="margin:0 0 24px 0;color:#555E54;font-size:15px;line-height:24px;">
                ${intro}
              </p>
              
              <!-- OTP Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:24px 0;">
                <tr>
                  <td align="center" style="background-color:#FAF7F0;border:2px dashed #D0A75A;border-radius:14px;padding:24px 16px;">
                    <div style="font-family:'Courier New',Courier,monospace;font-size:38px;font-weight:700;letter-spacing:12px;color:#183D2B;text-indent:12px;">
                      ${code}
                    </div>
                    <div style="margin-top:12px;color:#8A9287;font-size:12px;font-weight:600;letter-spacing:0.5px;">
                      ⏱️ Valid for 10 minutes &bull; Single-use only
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Advisory Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#FBF9F5;border-left:4px solid #B65C3B;border-radius:4px;padding:14px 16px;margin:24px 0 16px 0;">
                <tr>
                  <td>
                    <p style="margin:0;color:#555E54;font-size:13px;line-height:20px;">
                      <strong>Security Tip:</strong> Never share this code with anyone. The Meva House team will never ask for your verification code via phone, message, or email.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;color:#8A9287;font-size:13px;line-height:20px;">
                If you did not request this verification code, you can safely ignore this email. Your account remains completely secure.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F9F7F2;border-top:1px solid #ECE6D8;padding:24px 36px;text-align:center;">
              <p style="margin:0 0 8px 0;color:#6D766A;font-size:12px;font-weight:600;">
                The Meva House &bull; Pure &bull; Fresh &bull; Delivered to Your Door
              </p>
              <p style="margin:0;color:#A4ACA1;font-size:11px;">
                Questions? Reach out via WhatsApp at <a href="https://wa.me/919142833856" style="color:#B65C3B;text-decoration:none;font-weight:600;">+91 91428 33856</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendOtpEmail(email: string, code: string, purpose: "ADMIN_LOGIN" | "PASSWORD_RESET" = "ADMIN_LOGIN") {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const isadmin = purpose === "ADMIN_LOGIN";
  const subject = isadmin
    ? `Your Meva House Admin Verification Code: ${code}`
    : `Your Meva House Password Reset Code: ${code}`;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") return false;
    console.info(`[DEV OTP] [${purpose}] ${email}: ${code}`);
    return true;
  }

  const html = renderOtpEmailHtml(code, purpose);
  const text = `${isadmin ? "ADMIN VERIFICATION CODE" : "PASSWORD RESET CODE"} - THE MEVA HOUSE\n\nYour 6-digit code: ${code}\n\nThis code expires in 10 minutes and can only be used once.\nNever share this code with anyone.\n\nNeed assistance? WhatsApp us at +91 91428 33856`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html,
        text,
      }),
    });
    return response.ok;
  } catch (err) {
    console.error("[EMAIL_SEND_ERROR]", err);
    return false;
  }
}

export async function requestOtp(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const flow = String(formData.get("flow") || "customer");
  const loginPath = flow === "admin" ? "/admin/login" : "/login";
  const resend = String(formData.get("resend") || "") === "1";

  if (!email.includes("@")) redirect(`${loginPath}?error=email`);
  if (flow === "admin" && email !== (process.env.ADMIN_EMAIL || "admin@mevahouse.local").toLowerCase()) {
    redirect(`${loginPath}?error=unauthorized`);
  }

  const recent = await prisma.otpCode.findFirst({
    where: {
      email,
      purpose: "ADMIN_LOGIN",
      createdAt: { gt: new Date(Date.now() - 60_000) },
      usedAt: null,
    },
  });

  if (recent && !resend) {
    redirect(`${loginPath}?sent=1&email=${encodeURIComponent(email)}`);
  }

  const code = String(randomInt(100000, 1000000));
  await prisma.otpCode.deleteMany({ where: { email, purpose: "ADMIN_LOGIN", usedAt: null } });

  const sent = await sendOtpEmail(email, code, "ADMIN_LOGIN");
  if (!sent) redirect(`${loginPath}?error=email-config`);

  await prisma.otpCode.create({
    data: {
      email,
      codeHash: hashCode(code),
      purpose: "ADMIN_LOGIN",
      expiresAt: new Date(Date.now() + 10 * 60_000),
    },
  });

  redirect(`${loginPath}?sent=1&email=${encodeURIComponent(email)}`);
}

export async function verifyOtp(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const code = String(formData.get("code") || "").trim();
  const flow = String(formData.get("flow") || "customer");
  const loginPath = flow === "admin" ? "/admin/login" : "/login";

  if (flow === "admin" && email !== (process.env.ADMIN_EMAIL || "admin@mevahouse.local").toLowerCase()) {
    redirect(`${loginPath}?error=unauthorized`);
  }

  const otp = await prisma.otpCode.findFirst({
    where: {
      email,
      purpose: "ADMIN_LOGIN",
      usedAt: null,
      expiresAt: { gt: new Date() },
      attempts: { lt: 5 },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp || hashCode(code) !== otp.codeHash) {
    if (otp) await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    redirect(`${loginPath}?sent=1&email=${encodeURIComponent(email)}&error=code`);
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, name: email.split("@")[0], passwordHash: "otp-managed" },
  });

  await createSession(email, "ADMIN");
  redirect("/admin");
}

export async function userRegister(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");

  if (name.length < 2 || !email.includes("@") || password.length < 8) {
    redirect("/login?mode=register&error=register");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/login?error=exists");

  await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
  });

  await createSession(email, "USER");
  redirect("/");
}

export async function userLogin(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect("/login?error=login");
  }

  await createSession(email, "USER");
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    redirect("/login?mode=forgot&sent=1");
  }

  const code = String(randomInt(100000, 1000000));
  await prisma.otpCode.deleteMany({ where: { email, purpose: "PASSWORD_RESET", usedAt: null } });

  const sent = await sendOtpEmail(email, code, "PASSWORD_RESET");
  if (!sent) redirect("/login?mode=forgot&error=email-config");

  await prisma.otpCode.create({
    data: {
      email,
      codeHash: hashCode(code),
      purpose: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 10 * 60_000),
    },
  });

  redirect(`/login?mode=reset&sent=1&email=${encodeURIComponent(email)}`);
}

export async function resetPassword(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const code = String(formData.get("code") || "").trim();
  const password = String(formData.get("password") || "");

  const otp = await prisma.otpCode.findFirst({
    where: {
      email,
      purpose: "PASSWORD_RESET",
      usedAt: null,
      expiresAt: { gt: new Date() },
      attempts: { lt: 5 },
    },
    orderBy: { createdAt: "desc" },
  });

  if (password.length < 8 || !otp || hashCode(code) !== otp.codeHash) {
    redirect(`/login?mode=reset&sent=1&email=${encodeURIComponent(email)}&error=code`);
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  await prisma.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });

  redirect("/login?reset=1");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (
    email !== (process.env.ADMIN_EMAIL || "admin@mevahouse.local").toLowerCase() ||
    password !== (process.env.ADMIN_PASSWORD || "change-me-now")
  ) {
    redirect("/login?error=1");
  }

  await createSession(email, "ADMIN");
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/");
}