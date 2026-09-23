# Mengunduh Node.js LTS versi portable (zip resmi dari nodejs.org) ke
# folder tools\node di dalam aplikasi. Tidak butuh hak admin dan tidak
# mengubah pengaturan Windows; JALANKAN-WMS.bat memakainya dari folder itu.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root = Split-Path -Parent $PSScriptRoot
$tools = Join-Path $root 'tools'
$dest = Join-Path $tools 'node'
$arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'x64' }

# Disimpan dulu ke variabel: Invoke-RestMethod mengirim array JSON sebagai
# satu objek ke pipeline, jadi harus diurai dulu sebelum difilter.
$releases = Invoke-RestMethod 'https://nodejs.org/dist/index.json'
$lts = $releases | Where-Object { $_.lts } | Select-Object -First 1
$version = $lts.version
$name = "node-$version-win-$arch"
$base = "https://nodejs.org/dist/$version"
$zip = Join-Path $env:TEMP "$name.zip"

Write-Host "Mengunduh Node.js $version ($arch), sekitar 30 MB..."
Invoke-WebRequest "$base/$name.zip" -OutFile $zip -UseBasicParsing

$sums = (Invoke-WebRequest "$base/SHASUMS256.txt" -UseBasicParsing).Content
$expected = ($sums -split '\r?\n' | Where-Object { $_ -match "\s$name\.zip$" }) -split '\s+' | Select-Object -First 1
$actual = (Get-FileHash $zip -Algorithm SHA256).Hash
if (-not $expected -or $actual -ne $expected.ToUpper()) {
  Remove-Item $zip -Force
  throw 'Checksum file Node.js tidak cocok, unduhan dibatalkan.'
}

Write-Host 'Memasang Node.js...'
New-Item -ItemType Directory -Force $tools | Out-Null
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
Expand-Archive $zip -DestinationPath $tools -Force
Rename-Item (Join-Path $tools $name) 'node'
Remove-Item $zip -Force
Write-Host "Node.js $version terpasang di $dest"
