$ErrorActionPreference = "SilentlyContinue"
$pidFiles = @(
  (Join-Path $PSScriptRoot "launcher.pid"),
  (Join-Path $PSScriptRoot "server.pid")
)
$stopped = $false
foreach ($pf in $pidFiles) {
  if (Test-Path $pf) {
    $idText = (Get-Content $pf | Select-Object -First 1)
    if ($idText -match '^\d+$') {
      $p = Get-Process -Id ([int]$idText) -ErrorAction SilentlyContinue
      if ($p) {
        Stop-Process -Id ([int]$idText) -Force -ErrorAction SilentlyContinue
        $stopped = $true
      }
    }
    Remove-Item $pf -Force -ErrorAction SilentlyContinue
  }
}
Remove-Item (Join-Path $PSScriptRoot "server.port") -Force -ErrorAction SilentlyContinue

Add-Type -AssemblyName PresentationFramework
$msg = if ($stopped) { "PC 테스트 서버를 종료했습니다." } else { "실행 중인 테스트 서버가 없습니다." }
[System.Windows.MessageBox]::Show($msg, "탐험가의 아이디어 노트", "OK", "Information") | Out-Null
