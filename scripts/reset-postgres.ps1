$ErrorActionPreference = "Stop"
$pgBin = "C:\Program Files\PostgreSQL\16\bin"
$data = "C:\Program Files\PostgreSQL\16\data"
$hba = Join-Path $data "pg_hba.conf"
$backup = Join-Path $data "pg_hba.conf.before-reset"
$postgresPassword = "sillicon"
$appPassword = "meva_local_password"

Copy-Item $hba $backup -Force
$content = Get-Content $hba -Raw
$content = $content -replace "host\s+all\s+all\s+127\.0\.0\.1/32\s+scram-sha-256", "host    all             all             127.0.0.1/32            trust"
$content = $content -replace "host\s+all\s+all\s+::1/128\s+scram-sha-256", "host    all             all             ::1/128                 trust"
Set-Content -Path $hba -Value $content -NoNewline

Restart-Service postgresql-x64-16
Start-Sleep -Seconds 3
$psql = Join-Path $pgBin "psql.exe"
& $psql -h 127.0.0.1 -U postgres -d postgres -v ON_ERROR_STOP=1 -c "ALTER USER postgres WITH PASSWORD '$postgresPassword';" -c "DO `$`$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'meva') THEN CREATE ROLE meva LOGIN PASSWORD '$appPassword'; ELSE ALTER ROLE meva WITH LOGIN PASSWORD '$appPassword'; END IF; END `$`$;" -c "SELECT 'CREATE DATABASE meva_house OWNER meva' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'meva_house')\gexec"

Copy-Item $backup $hba -Force
Remove-Item $backup -Force
Restart-Service postgresql-x64-16
Write-Output "PostgreSQL reset complete. Admin user: postgres. App user: meva. Database: meva_house."
