$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Test-Port([int]$Port) {
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $iar = $tcp.BeginConnect("127.0.0.1", $Port, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne(150)
    if ($ok -and $tcp.Connected) {
      $tcp.EndConnect($iar)
      $tcp.Close()
      return $true
    }
    $tcp.Close()
    return $false
  } catch { return $false }
}

$Port = 8000
while ($Port -le 8010 -and (Test-Port $Port)) { $Port++ }
if ($Port -gt 8010) {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show(
    "8000~8010 포트를 모두 사용 중입니다.`n실행 중인 테스트 서버를 종료한 뒤 다시 실행해 주세요.",
    "탐험가의 아이디어 노트",
    "OK",
    "Error"
  ) | Out-Null
  exit 1
}

$serverScript = Join-Path $PSScriptRoot "local-server.ps1"
$serverArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$serverScript`" -Port $Port -Root `"$Root`""
$proc = Start-Process powershell.exe -ArgumentList $serverArgs -WindowStyle Minimized -PassThru

$pidFile = Join-Path $PSScriptRoot "launcher.pid"
$portFile = Join-Path $PSScriptRoot "server.port"
$proc.Id | Set-Content -Encoding ascii $pidFile
$Port | Set-Content -Encoding ascii $portFile

Start-Sleep -Milliseconds 1200
$url = "http://localhost:$Port/"

# Prefer Edge in app-window style when available.
$edgeCandidates = @(
  "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
)
$edge = $edgeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($edge) {
  Start-Process $edge "--app=$url"
} else {
  Start-Process $url
}

Add-Type -AssemblyName PresentationFramework
[System.Windows.MessageBox]::Show(
  "PC 테스트 서버가 실행되었습니다.`n`n주소: $url`n`n종료할 때는 STOP_WINDOWS.bat 을 더블클릭하세요.",
  "탐험가의 아이디어 노트",
  "OK",
  "Information"
) | Out-Null
