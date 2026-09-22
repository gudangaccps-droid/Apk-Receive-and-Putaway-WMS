const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

const SELECT = `
  SELECT s.*, p.sku_code, p.product_name, p.uom, l.location_code
  FROM stocks s
  JOIN products p ON p.id = s.product_id
  JOIN locations l ON l.id = s.location_id
`;

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`${SELECT} ORDER BY p.sku_code, l.location_code`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Alur: Barcode Scanner -> Search Product -> Find Location -> Display Location
// Harus didaftarkan sebelum GET /:id supaya "find" tidak ketangkap sebagai :id.
router.get('/find', async (req, res, next) => {
  try {
    const code = (req.query.code || '').trim();
    if (!code) return res.status(400).json({ error: 'Barcode/SKU wajib diisi' });

    const productRes = await pool.query(
      `SELECT * FROM products WHERE barcode = $1 OR sku_code = $1 LIMIT 1`,
      [code]
    );
    const product = productRes.rows[0];
    if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' });

    const { rows: locations } = await pool.query(
      `SELECT s.qty, s.available_qty, l.location_code, l.rack, l.shelf, l.position
       FROM stocks s
       JOIN locations l ON l.id = s.location_id
       WHERE s.product_id = $1
       ORDER BY l.location_code`,
      [product.id]
    );

    res.json({ product, locations });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${SELECT} WHERE s.id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Stok tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { product_id, location_id, qty, available_qty } = req.body;
    if (!product_id || !location_id) {
      return res.status(400).json({ error: 'Produk dan lokasi wajib diisi' });
    }
    const qtyVal = Math.round(Number(qty)) || 0;
    const availVal = available_qty !== undefined && available_qty !== '' ? Math.round(Number(available_qty)) : qtyVal;
    const { rows } = await pool.query(
      `INSERT INTO stocks (product_id, location_id, qty, available_qty)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [product_id, location_id, qtyVal, availVal]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Kombinasi produk & lokasi ini sudah punya data stok' });
    }
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { product_id, location_id, qty, available_qty } = req.body;
    const qtyVal = Math.round(Number(qty)) || 0;
    const availVal = available_qty !== undefined && available_qty !== '' ? Math.round(Number(available_qty)) : qtyVal;
    const { rows } = await pool.query(
      `UPDATE stocks SET product_id=$1, location_id=$2, qty=$3, available_qty=$4, updated_at=now()
       WHERE id=$5 RETURNING *`,
      [product_id, location_id, qtyVal, availVal, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Stok tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Kombinasi produk & lokasi ini sudah punya data stok' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM stocks WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Stok tidak ditemukan' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
