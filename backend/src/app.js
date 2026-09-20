const express = require('express');
const cors = require('cors');

const simpleCrudRouter = require('./routes/simpleCrud');
const productsRouter = require('./routes/products');
const locationsRouter = require('./routes/locations');

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

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

module.exports = app;
