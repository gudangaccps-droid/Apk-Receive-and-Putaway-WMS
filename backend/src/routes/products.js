const express = require('express');
const pool = require('../db/pool');
const { upload, parseCsvBuffer } = require('../importUpload');

const router = express.Router();

// Alur: Supplier/Product Data -> Admin Import Product -> Validation -> Product Active
router.post('/import', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File CSV wajib diunggah' });
    const rows = parseCsvBuffer(req.file.buffer);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const sku_code = (row.sku_code || '').trim();
      const product_name = (row.product_name || '').trim();
      if (!sku_code || !product_name) {
        skipped++;
        errors.push(`Baris ${i + 2}: sku_code / product_name kosong`);
        continue;
      }
      const values = [
        (row.barcode || '').trim() || null,
        sku_code,
        product_name,
        (row.brand || '').trim() || null,
        (row.category || '').trim() || null,
        (row.group_code || '').trim() || null,
        (row.uom || '').trim() || null,
        (row.status || '').trim() || 'ACTIVE',
      ];

      const existing = await pool.query('SELECT id FROM products WHERE sku_code = $1', [sku_code]);
      if (existing.rows[0]) {
        await pool.query(
          `UPDATE products SET barcode=$1, sku_code=$2, product_name=$3, brand=$4, category=$5,
             group_code=$6, uom=$7, status=$8, updated_at=now() WHERE id=$9`,
          [...values, existing.rows[0].id]
        );
        updated++;
      } else {
        await pool.query(
          `INSERT INTO products (barcode, sku_code, product_name, brand, category, group_code, uom, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          values
        );
        inserted++;
      }
    }

    res.json({ total: rows.length, inserted, updated, skipped, errors });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (q) {
      const { rows } = await pool.query(
        `SELECT * FROM products
         WHERE sku_code ILIKE $1 OR product_name ILIKE $1 OR barcode ILIKE $1
         ORDER BY id DESC`,
        [`%${q}%`]
      );
      return res.json(rows);
    }
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { barcode, sku_code, product_name, brand, category, group_code, uom, status } = req.body;
    if (!sku_code || !product_name) {
      return res.status(400).json({ error: 'SKU Code dan Nama Produk wajib diisi' });
    }
    const { rows } = await pool.query(
      `INSERT INTO products (barcode, sku_code, product_name, brand, category, group_code, uom, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        barcode || null,
        sku_code,
        product_name,
        brand || null,
        category || null,
        group_code || null,
        uom || null,
        status || 'ACTIVE',
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'SKU Code sudah dipakai' });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { barcode, sku_code, product_name, brand, category, group_code, uom, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE products SET barcode=$1, sku_code=$2, product_name=$3, brand=$4, category=$5,
         group_code=$6, uom=$7, status=$8, updated_at=now()
       WHERE id=$9 RETURNING *`,
      [
        barcode || null,
        sku_code,
        product_name,
        brand || null,
        category || null,
        group_code || null,
        uom || null,
        status || 'ACTIVE',
        req.params.id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'SKU Code sudah dipakai' });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
