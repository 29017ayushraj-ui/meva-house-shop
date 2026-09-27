$env:PGPASSWORD = "meva_local_password"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h 127.0.0.1 -p 5433 -U meva -d meva_house -v ON_ERROR_STOP=1 -f "C:\Users\SHUBHAM KUMAR\Documents\meva-house-shop\scripts\migrate-auth.sql"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$env:DATABASE_URL = "postgresql://meva:meva_local_password@127.0.0.1:5433/meva_house?schema=public"
& "C:\Program Files\nodejs\node.exe" "C:\Users\SHUBHAM KUMAR\Documents\meva-house-shop\node_modules\tsx\dist\cli.mjs" prisma\seed.ts
