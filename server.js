/**
 * Server lokal untuk aplikasi Label Dus Gudang.
 * Tidak butuh instalasi paket apa pun, cukup Node.js.
 *
 * Cara jalankan:
 *   node server.js
 *
 * Lalu buka di browser:
 *   http://localhost:3000
 *
 * Staff lain di jaringan/WiFi yang sama bisa membuka:
 *   http://<IP-komputer-server>:3000
 *
 * Semua data tersimpan di file data.json di folder ini.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const BACKUP_DIR = path.join(__dirname, 'backup');

// Pastikan file data dan folder backup tersedia
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

function backupHarian() {
  const tgl = new Date().toISOString().slice(0, 10);
  const target = path.join(BACKUP_DIR, `data-${tgl}.json`);
  if (!fs.existsSync(target)) {
    try {
      fs.copyFileSync(DATA_FILE, target);
    } catch (e) {
      console.error('Backup gagal:', e.message);
    }
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // ---------- API: baca data ----------
  if (req.url === '/api/data' && req.method === 'GET') {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end('[]');
      }
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(data || '[]');
    });
    return;
  }

  // ---------- API: simpan data ----------
  if (req.url === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) req.destroy(); // batas 20MB
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (!Array.isArray(parsed)) throw new Error('Format data tidak valid');
        backupHarian();
        fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, jumlah: parsed.length }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // ---------- File statis ----------
  let filePath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
  const fullPath = path.join(__dirname, filePath);

  // Cegah akses keluar folder
  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Akses ditolak');
  }

  fs.readFile(fullPath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('File tidak ditemukan');
    }
    const ext = path.extname(fullPath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

function daftarIP() {
  const hasil = [];
  const nets = os.networkInterfaces();
  for (const nama in nets) {
    for (const net of nets[nama]) {
      if (net.family === 'IPv4' && !net.internal) hasil.push(net.address);
    }
  }
  return hasil;
}

server.listen(PORT, () => {
  console.log('\n============================================');
  console.log('  APLIKASI LABEL DUS GUDANG - SERVER AKTIF');
  console.log('============================================');
  console.log(`  Komputer ini : http://localhost:${PORT}`);
  daftarIP().forEach((ip) => {
    console.log(`  Staff lain   : http://${ip}:${PORT}`);
  });
  console.log(`  File data    : ${DATA_FILE}`);
  console.log(`  Backup       : ${BACKUP_DIR}`);
  console.log('\n  Tekan Ctrl+C untuk menghentikan server.\n');
});
