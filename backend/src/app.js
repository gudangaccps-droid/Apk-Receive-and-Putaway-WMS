const express = require('express');
const cors = require('cors');
const multer = require('multer');

const simpleCrudRouter = require('./routes/simpleCrud');
const productsRouter = require('./routes/products');
const locationsRouter = require('./routes/locations');
const stocksRouter = require('./routes/stocks');
const usersRouter = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Modul 1: Master Data
app.use('/api/categories', simpleCrudRouter('categories', [
  { name: 'name', required: true },
  { name: 'description' },
]));
app.use('/api/units', simpleCrudRouter('units', [
  { name: 'code', required: true },
  { name: 'name', required: true },
]));
app.use('/api/suppliers', simpleCrudRouter('suppliers', [
  { name: 'code' },
  { name: 'name', required: true },
  { name: 'contact_person' },
  { name: 'phone' },
  { name: 'address' },
  { name: 'is_active' },
]));
app.use('/api/zones', simpleCrudRouter('zones', [
  { name: 'code', required: true },
  { name: 'name', required: true },
  { name: 'description' },
]));
app.use('/api/locations', locationsRouter);
app.use('/api/products', productsRouter);
app.use('/api/stocks', stocksRouter);
app.use('/api/users', usersRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message === 'Hanya file .csv yang didukung') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === '22001') {
    return res.status(400).json({ error: 'Salah satu isian melebihi panjang maksimum kolomnya' });
  }
  const dbConnErrorCodes = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN', '28P01', '3D000', '28000'];
  if (dbConnErrorCodes.includes(err.code)) {
    console.error('Koneksi database gagal:', err.code, err.message);
    return res.status(500).json({
      error: 'Tidak bisa terhubung ke database. Cek DATABASE_URL di environment variable server.',
    });
  }
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

module.exports = app;
