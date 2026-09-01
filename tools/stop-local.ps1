$pidFile = Join-Path $PSScriptRoot "server.pid"
$portFile = Join-Path $PSScriptRoot "server.port"

if (Test-Path $pidFile) {
  $serverPid = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($serverPid -match '^\d+$') {
    $proc = Get-Process -Id ([int]$serverPid) -ErrorAction SilentlyContinue
    if ($proc) {
      Stop-Process -Id ([int]$serverPid) -Force -ErrorAction SilentlyContinue
      Write-Host "PC 테스트 서버를 종료했습니다." -ForegroundColor Green
    } else {
      Write-Host "이미 종료된 서버입니다."
    }
  }
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  Remove-Item $portFile -Force -ErrorAction SilentlyContinue
} else {
  Write-Host "실행 중인 PC 테스트 서버 기록이 없습니다."
}
Start-Sleep -Seconds 1
