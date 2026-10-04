# The Meva House 🌿

A production-grade, luxury artisanal storefront for premium single-origin dry fruits, nuts, and healthy seeds. Built with Next.js 16 (App Router & Turbopack), React 19, Tailwind CSS v4, Prisma ORM, and PostgreSQL.

Designed with transactional ordering integrity, post-order WhatsApp continuity, responsive luxury OTP emails, and full architectural readiness for payment gateway integrations.

---

## 🚀 Key Highlights & Architecture

- **Transactional PostgreSQL Orders:** Every order is processed atomically using Prisma transactions (`prisma.$transaction`), guaranteeing data persistence, auditability, and generating a distinct reference (`#MH-YYYY-XXXXX`) in PostgreSQL before WhatsApp dispatch.
- **Continuity & WhatsApp Handover:** The customer receives a clear confirmation screen with their Order Reference and full order breakdown on-site. Tapping the WhatsApp button dispatches a beautifully formatted order receipt directly to the dispatch line (`+91 91428 33856`).
- **Payment Integration Ready:** The database model and order pipeline natively include `paymentMethod`, `paymentStatus`, `subtotal`, `deliveryFee`, and atomic transaction locks, ready for immediate Razorpay, Stripe, or Cashfree integration.
- **Luxury OTP Email System:** Responsive, table-based HTML email templates with security advisories, expiry timers, and clear branding, powered by Resend (with dev console fallback for local testing).
- **Artisanal UI/UX:** Refined editorial design system using Playfair Display, DM Sans, rich forest greens (`#143725`), terracotta clay (`#B65C3B`), and warm paper (`#FAF7F0`), featuring dynamic pack-size weight selectors, live bag drawer, and real-time category filtering.

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js 20+** (tested on Node.js 24)
- **PostgreSQL 16+** (running locally on port `5433` or `5432`)

### 2. Environment Configuration
Create or verify `.env` and `.env.local`:

```ini
DATABASE_URL="postgresql://meva:meva_local_password@localhost:5433/meva_house?schema=public"
AUTH_SECRET="local-development-secret-change-before-deploy"
ADMIN_EMAIL="suprshubh@gmail.com"
ADMIN_PASSWORD="change-me-now"
NEXT_PUBLIC_WHATSAPP="919142833856"
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="The Meva House <onboarding@resend.dev>"
```

### 3. Starting the PostgreSQL Server
For Windows local development with the user-owned PostgreSQL cluster on port `5433`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-local-postgres.ps1
```

Or start the PostgreSQL daemon directly:
```powershell
& "C:\Program Files\PostgreSQL\16\bin\postgres.exe" -D "C:\Users\SHUBHAM KUMAR\AppData\Local\MevaHousePostgres" -p 5433
```

### 4. Database Migration & Seeding
Push the Prisma schema to synchronize the PostgreSQL tables and seed initial products:

> **Windows PowerShell Note:** If PowerShell execution policy blocks running `npm.ps1`, use `cmd /c npm ...` or `npm.cmd`.

```bash
npx prisma db push
npm run db:seed
```

### 5. Running Next.js Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Order Lifecycle & Continuity Architecture

```mermaid
flowchart TD
    A[Customer Adds Items to Bag] --> B[Customer Fills Delivery Details]
    B --> C[Selects Payment Method: COD / Online]
    C --> D[POST /api/orders]
    subgraph Transactional DB Pipeline
        D --> E[Prisma Transaction Begins]
        E --> F[Generate Order Ref: MH-YYYY-XXXXX]
        F --> G[Insert Order with PENDING status]
        G --> H[Commit Transaction]
    end
    H --> I[Return Order Ref & Formatted WhatsApp URL]
    I --> J[Storefront Displays Order Success Modal]
    J --> K[Customer Copies Order ID / Clicks WhatsApp Button]
    K --> L[WhatsApp Opens with Pre-formatted Markdown Summary]
```

### Formatted WhatsApp Message Format
When an order is created, the system builds an emoji-rich, structured markdown summary:

```text
🛒 *NEW ORDER — THE MEVA HOUSE*
━━━━━━━━━━━━━━━━━━━━━━
📋 *Order ID:* `#MH-2026-48291`
📅 *Date:* 27 Sep 2026, 10:30 PM
💳 *Payment:* Cash on Delivery (Pay at Doorstep)
━━━━━━━━━━━━━━━━━━━━━━
🛍️ *ITEMS ORDERED:*
1. *Walnut Kernels - Orchid* (500g)
   ▫️ Qty: 2 × ₹460 = *₹920*
2. *Almonds (Badam)* (250g)
   ▫️ Qty: 1 × ₹180 = *₹180*
━━━━━━━━━━━━━━━━━━━━━━
💰 *BILL SUMMARY:*
▫️ Subtotal: ₹1100
▫️ Society Delivery: *FREE*
👉 *Grand Total: ₹1100*
━━━━━━━━━━━━━━━━━━━━━━
📍 *DELIVERY DETAILS:*
👤 *Customer:* Shubham Kumar
📞 *Phone:* 9142833856
🏠 *Address:* Flat 402, Tower B, Green Valley Apartments
📝 *Instructions:* Ring bell twice
━━━━━━━━━━━━━━━━━━━━━━
✨ _Thank you for ordering with The Meva House! Your fresh dry fruits are being carefully packed._
```

---

## 📧 Responsive Luxury OTP Email Templates

OTPs are generated using cryptographically secure random integers (`crypto.randomInt`), SHA-256 hashed in PostgreSQL, expire after 10 minutes, and are rate-limited to 5 verification attempts.

Emails are delivered through the Resend API with:
- Purpose-aware headings (`Admin Portal Access Code` vs `Password Reset Code`).
- Centered 6-digit verification code block with monospace font and gold borders.
- Expiration and security tip callouts.
- Responsive table layout tested across mobile and desktop mail clients.
- Automatic terminal fallback (`[DEV OTP] [PURPOSE] email: code`) in non-production environments when API keys are not supplied.

---

## 💳 Future Payment Gateway Integration

The database schema and API route are pre-configured for instant payment integration:

- **Order Model Attributes:**
  - `orderNumber`: Human-readable tracking ID (`MH-2026-XXXXX`).
  - `paymentMethod`: `COD` (current default) | `ONLINE` | `UPI`.
  - `paymentStatus`: `PENDING` | `PAID` | `FAILED`.
  - `subtotal` and `deliveryFee`: Pre-calculated decimal fields.

### Adding Razorpay / Stripe:
1. In `src/app/api/orders/route.ts`:
   Create Razorpay Order (`razorpay.orders.create({ amount: total * 100, currency: "INR", receipt: order.orderNumber })`).
2. Return `razorpayOrderId` and public key to frontend.
3. In `src/components/storefront.tsx`:
   Launch the Razorpay Checkout SDK. On payment success, ping a webhook or verification endpoint to update `paymentStatus = "PAID"`.

---

## 🛡️ Admin & Store Management

- **Portal URL:** `http://localhost:3000/admin`
- **Login Method:** Single-use 6-digit email OTP sent to the configured `ADMIN_EMAIL`.
- **Admin Features:**
  - Real-time catalog metrics and live order stream.
  - Add new products with image URLs, pack sizes, badges, and categories.
  - Archive discontinued catalog items.
  - Real-time order log displaying customer details, address, total, and payment status.

---

## 🧪 Testing & Validation

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Production Build
npm run build
```

---

## 🌐 Production Deployment

- **Vercel:** Import this repository with `meva-house-shop` as the project root. Add a PostgreSQL integration such as Neon from the Vercel Marketplace, then configure `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `NEXT_PUBLIC_WHATSAPP`, `RESEND_API_KEY`, and `EMAIL_FROM` in the Vercel project settings.
- **Database setup:** Vercel hosts the Next.js app and API functions; PostgreSQL runs with the selected managed database provider. This project has no checked-in migration history, so initialize a new database with `DATABASE_URL` set by running `npm run db:setup`. This pushes the Prisma schema and seeds the admin/catalog data. Do not run this against a database containing data you need to preserve without reviewing the schema changes first.
- **Vercel database bootstrap:** For a new, empty production database, temporarily set `INITIALIZE_PRODUCTION_DATABASE=1` in the Vercel Production environment and deploy once. The build runs `db:setup` only when this flag is set and `VERCEL_ENV` is `production`. Remove the flag after the successful deployment; normal builds never push schema changes or seed data.
- **Vercel deployment:** The build runs `prisma generate` before `next build`. Keep `AUTH_SECRET` set to a random secret. To use admin email OTP, also set `ADMIN_EMAIL`, `RESEND_API_KEY`, and `EMAIL_FROM` to an address/key you control.
- **Docker:** Build the provided `Dockerfile` using `docker compose up --build`.
- **Database:** Also compatible with Supabase, AWS RDS, or any managed PostgreSQL instance.

### GitHub Actions Deployment

The `CI` workflow validates pull requests and pushes to `main`. The `Deploy to Vercel` workflow deploys pushes to `main`, version tags, or manual dispatch. Add these Actions secrets to the destination GitHub repository:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The deployment workflow links the project, pulls its Production settings, builds with Vercel, and deploys the prebuilt output. Do not put database credentials or `AUTH_SECRET` in GitHub; they are managed by the Vercel project and Neon integration.