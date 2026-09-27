$ErrorActionPreference = "Stop"
$pgBin = "C:\Program Files\PostgreSQL\16\bin"
$data = "C:\Users\SHUBHAM KUMAR\AppData\Local\MevaHousePostgres"
$pwFile = Join-Path $data "postgres-password.txt"
$port = 5433
New-Item -ItemType Directory -Force -Path $data | Out-Null
$initConfig = Join-Path $data "postgresql.conf"
if (-not (Test-Path $initConfig)) {
  $initPwFile = Join-Path $env:TEMP "meva-postgres-init-password.txt"
  Set-Content -Path $initPwFile -Value "sillicon" -NoNewline
  & (Join-Path $pgBin "initdb.exe") -D $data -U postgres --pwfile=$initPwFile --auth=scram-sha-256
  Remove-Item $initPwFile -Force
  if ($LASTEXITCODE -ne 0) { throw "initdb failed with exit code $LASTEXITCODE" }
}
Set-Content -Path $pwFile -Value "sillicon" -NoNewline
& (Join-Path $pgBin "pg_ctl.exe") status -D $data 2>$null
if ($LASTEXITCODE -ne 0) {
  & (Join-Path $pgBin "pg_ctl.exe") start -D $data -o "-p $port" -l (Join-Path $data "server.log")
  if ($LASTEXITCODE -ne 0) { throw "pg_ctl start failed with exit code $LASTEXITCODE" }
  Start-Sleep -Seconds 3
}
$env:PGPASSWORD = "sillicon"
$sql = @'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'meva') THEN
    CREATE ROLE meva LOGIN PASSWORD 'meva_local_password';
  ELSE
    ALTER ROLE meva WITH LOGIN PASSWORD 'meva_local_password';
  END IF;
END
$$;
'@
& (Join-Path $pgBin "psql.exe") -h 127.0.0.1 -p $port -U postgres -d postgres -v ON_ERROR_STOP=1 -c $sql
& (Join-Path $pgBin "psql.exe") -h 127.0.0.1 -p $port -U postgres -d postgres -v ON_ERROR_STOP=1 -c "SELECT 'CREATE DATABASE meva_house OWNER meva' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'meva_house')\gexec"
Write-Output "User-owned PostgreSQL is running on port $port."
