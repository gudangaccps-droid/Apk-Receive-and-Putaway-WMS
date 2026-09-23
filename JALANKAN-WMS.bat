@echo off
title WMS Gudang ACC
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js belum terpasang di komputer ini.
  echo  Unduh dan pasang dulu dari https://nodejs.org - pilih versi LTS,
  echo  lalu jalankan file ini lagi.
  echo.
  pause
  exit /b 1
)

if not exist "backend\node_modules" (
  echo Menginstal kebutuhan backend - hanya sekali di awal, mohon tunggu...
  call npm install --prefix backend || goto gagal
)
if not exist "frontend\node_modules" (
  echo Menginstal kebutuhan frontend - hanya sekali di awal, mohon tunggu...
  call npm install --prefix frontend || goto gagal
)

echo Menyiapkan tampilan aplikasi...
call npm run build --prefix frontend || goto gagal

echo Menyiapkan database...
call npm run migrate --prefix backend || goto gagal
call npm run seed --prefix backend || goto gagal

echo.
echo ============================================
echo   WMS GUDANG ACC - SERVER AKTIF
echo   Buka di browser: http://localhost:4000
echo   Tutup jendela ini untuk menghentikan server.
echo ============================================
echo.
start "" /min cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:4000"
node backend\src\index.js
pause
exit /b 0

:gagal
echo.
echo  Terjadi kesalahan, lihat pesan di atas.
pause
exit /b 1
