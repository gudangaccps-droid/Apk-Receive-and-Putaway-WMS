require('dotenv').config();
const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const app = require('./app');

const PORT = process.env.PORT || 4000;

// Kalau frontend sudah di-build (frontend/dist), sajikan dari server ini juga,
// supaya aplikasi cukup dibuka di satu alamat tanpa menjalankan Vite terpisah.
const distDir = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`WMS Gudang ACC berjalan di http://localhost:${PORT}`);
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`Dari komputer/HP lain di jaringan yang sama: http://${net.address}:${PORT}`);
      }
    }
  }
});
