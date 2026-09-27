# The Meva House

A production-minded Next.js storefront for premium dry fruits, with a protected admin portal, Prisma/PostgreSQL catalog management, Docker Compose, and GitHub Actions CI/CD.

## Local development

1. Install Node.js 24 and Docker Desktop.
2. Copy `.env.example` to `.env.local` and change `AUTH_SECRET` and `ADMIN_PASSWORD`.
3. Start PostgreSQL and the app:

```bash
docker compose up --build
```

4. In a second terminal, create the schema and seed the catalog:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Without Docker/Postgres, the storefront still renders the fallback catalog. Product writes require `DATABASE_URL` and a running database.

For the current Windows setup, the user-owned PostgreSQL cluster runs on port `5433` and is started with `powershell -ExecutionPolicy Bypass -File .\scripts\start-local-postgres.ps1`. The app is already configured for that port in `.env.local`.

Admin: `http://localhost:3000/admin`
Default local credentials: `admin@mevahouse.local` / `change-me-now` (change before deployment).

## Email OTP login

Customer accounts use the `User` schema with email/password registration, login, and forgot-password OTP reset. Admin accounts use the separate `Admin` schema and a single-use 6-digit email OTP login. OTPs are hashed in PostgreSQL, expire after 10 minutes, and are limited to 5 attempts. Email delivery uses [Resend](https://resend.com), which has a free monthly tier. Create a Resend account, create an API key, verify a sending domain (or use the provider's development sender for testing), then set `RESEND_API_KEY` and `EMAIL_FROM` in `.env.local` and in Vercel. Restart Next.js after changing env values. Without a Resend key, development mode prints the OTP in the server terminal for local testing; production intentionally refuses to send.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment

- **Vercel:** add `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `NEXT_PUBLIC_WHATSAPP` to the project environment, then deploy the Next.js app. Use a hosted PostgreSQL provider such as Neon, Supabase, or Vercel Postgres.
- **Docker:** build the included `Dockerfile` and provide the same environment variables at runtime. Run migrations before serving: `npx prisma migrate deploy`.
- **CI:** `.github/workflows/ci.yml` runs Postgres-backed Prisma validation, lint, typecheck, and build for pushes and pull requests. `.github/workflows/deploy.yml` deploys version tags through Vercel using `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` repository secrets.
- **Custom domain:** in Vercel, add the GoDaddy domain and copy the DNS records Vercel shows into GoDaddy. The domain purchase and DNS changes require your GoDaddy/Vercel accounts and cannot be completed from this local workspace.

## Data model

The database stays intentionally small: `User` for admin access, `Product` for editable catalog content, and `Order` for the COD order lifecycle. Product images are URL-based so the admin portal can remain simple; object storage can be added later without changing the product model.
