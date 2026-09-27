DO $$
BEGIN
  CREATE TYPE "OtpPurpose" AS ENUM ('ADMIN_LOGIN', 'PASSWORD_RESET');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "OtpCode" ADD COLUMN IF NOT EXISTS "purpose" "OtpPurpose" NOT NULL DEFAULT 'ADMIN_LOGIN';

CREATE TABLE IF NOT EXISTS "Admin" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE INDEX IF NOT EXISTS "OtpCode_email_createdAt_idx" ON "OtpCode"("email", "createdAt");
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";
