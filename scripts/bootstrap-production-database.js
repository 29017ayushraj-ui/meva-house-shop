const { spawnSync } = require("node:child_process");

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
  const result = spawnSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}