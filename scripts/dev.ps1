$root = Split-Path -Parent $PSScriptRoot
$logs = Join-Path $root ".dev-logs"
New-Item -ItemType Directory -Path $logs -Force | Out-Null

$serverOut = Join-Path $logs "server.log"
$serverErr = Join-Path $logs "server.err.log"
$clientOut = Join-Path $logs "client.log"
$clientErr = Join-Path $logs "client.err.log"

$server = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c npx pnpm@9.15.0 --filter @linet/server dev" `
  -WorkingDirectory $root `
  -RedirectStandardOutput $serverOut `
  -RedirectStandardError $serverErr `
  -WindowStyle Hidden `
  -PassThru

$client = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c npx pnpm@9.15.0 --filter @linet/client dev" `
  -WorkingDirectory $root `
  -RedirectStandardOutput $clientOut `
  -RedirectStandardError $clientErr `
  -WindowStyle Hidden `
  -PassThru

$pids = @{ server = $server.Id; client = $client.Id }
$pids | ConvertTo-Json | Set-Content -Path (Join-Path $root ".dev-pids.json") -Force

Write-Host "Dev processes started:"
Write-Host "  server  PID $($server.Id)  logs: .dev-logs/server.log"
Write-Host "  client  PID $($client.Id)  logs: .dev-logs/client.log"
Write-Host ""
Write-Host "To stop: ./scripts/stop-dev.ps1"
Write-Host "URLs:   http://localhost:5173  (client)"
Write-Host "        http://localhost:2567  (server)"
