@echo off
title Server Label Dus Gudang
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js belum terpasang di komputer ini.
  echo  Silakan unduh dan pasang dulu dari: https://nodejs.org
  echo  Pilih versi LTS, lalu jalankan file ini lagi.
  echo.
  pause
  exit /b
)

echo Menjalankan server...
start "" http://localhost:3000
node server.js
pause
