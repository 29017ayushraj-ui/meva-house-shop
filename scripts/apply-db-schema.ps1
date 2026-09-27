$ErrorActionPreference = "Stop"
$env:DATABASE_URL = "postgresql://meva:meva_local_password@127.0.0.1:5433/meva_house?schema=public"
Set-Location "C:\Users\SHUBHAM KUMAR\Documents\meva-house-shop"
& "C:\Program Files\nodejs\node.exe" "C:\Users\SHUBHAM KUMAR\Documents\meva-house-shop\node_modules\prisma\build\index.js" db push
& "C:\Program Files\nodejs\node.exe" "C:\Users\SHUBHAM KUMAR\Documents\meva-house-shop\node_modules\tsx\dist\cli.mjs" prisma\seed.ts
