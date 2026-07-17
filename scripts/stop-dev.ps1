$root = Split-Path -Parent $PSScriptRoot
$pidsFile = Join-Path $root ".dev-pids.json"

if (-not (Test-Path $pidsFile)) {
  Write-Host "No .dev-pids.json found. Dev processes may not be running."
  exit 0
}

$pids = Get-Content $pidsFile | ConvertFrom-Json
$pids.server, $pids.client | ForEach-Object {
  Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
}
Remove-Item $pidsFile -Force

Write-Host "Dev processes stopped."
