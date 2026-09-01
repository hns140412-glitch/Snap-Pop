param(
  [int]$Port = 8000,
  [string]$Root = ""
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($Root)) {
  $Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

function Get-MimeType([string]$Path) {
  switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".htm"  { "text/html; charset=utf-8" }
    ".css"  { "text/css; charset=utf-8" }
    ".js"   { "application/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".webmanifest" { "application/manifest+json; charset=utf-8" }
    ".svg"  { "image/svg+xml" }
    ".png"  { "image/png" }
    ".jpg"  { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".webp" { "image/webp" }
    ".ico"  { "image/x-icon" }
    ".woff" { "font/woff" }
    ".woff2"{ "font/woff2" }
    ".txt"  { "text/plain; charset=utf-8" }
    default { "application/octet-stream" }
  }
}

$listener = [System.Net.HttpListener]::new()
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host ""
  Write-Host "[오류] localhost:$Port 를 열 수 없습니다." -ForegroundColor Red
  Write-Host "다른 테스트 서버가 실행 중이면 PC_TEST_STOP.bat을 먼저 실행해 주세요."
  Write-Host ""
  Read-Host "Enter를 누르면 종료합니다"
  exit 1
}

$pidFile = Join-Path $PSScriptRoot "server.pid"
$portFile = Join-Path $PSScriptRoot "server.port"
$PID | Set-Content -Encoding ascii $pidFile
$Port | Set-Content -Encoding ascii $portFile

Write-Host "============================================" -ForegroundColor DarkYellow
Write-Host " 탐험가의 아이디어 노트 - PC TEST SERVER" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor DarkYellow
Write-Host ""
Write-Host "주소: $prefix" -ForegroundColor Cyan
Write-Host "폴더: $Root"
Write-Host ""
Write-Host "이 창은 테스트하는 동안 닫지 마세요." -ForegroundColor Green
Write-Host "종료는 PC_TEST_STOP.bat을 더블클릭하면 됩니다."
Write-Host ""

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = "index.html" }

    $candidate = Join-Path $Root ($requestPath -replace "/", "\")
    $full = [IO.Path]::GetFullPath($candidate)
    $rootFull = [IO.Path]::GetFullPath($Root)

    # Prevent path traversal
    if (-not $full.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
      $context.Response.StatusCode = 403
      $context.Response.Close()
      continue
    }

    if (Test-Path $full -PathType Container) {
      $full = Join-Path $full "index.html"
    }

    if (Test-Path $full -PathType Leaf) {
      $bytes = [IO.File]::ReadAllBytes($full)
      $context.Response.StatusCode = 200
      $context.Response.ContentType = Get-MimeType $full
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.Headers["Cache-Control"] = "no-store, max-age=0"
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $msg = [Text.Encoding]::UTF8.GetBytes("404 - File not found")
      $context.Response.StatusCode = 404
      $context.Response.ContentType = "text/plain; charset=utf-8"
      $context.Response.ContentLength64 = $msg.Length
      $context.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $context.Response.OutputStream.Close()
  } catch {
    if ($listener.IsListening) {
      Write-Host "요청 처리 오류: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
  }
}
