import { spawnSync } from "node:child_process";

if (
  process.env.INITIALIZE_PRODUCTION_DATABASE !== "1" ||
  process.env.VERCEL_ENV !== "production"
) {
  process.exit(0);
}

for (const args of [
  ["prisma", "db", "push"],
  ["tsx", "prisma/seed.ts"],
]) {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}