const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

const SELECT = `
  SELECT s.*, p.sku_code, p.product_name, p.uom, l.code AS location_code
  FROM stocks s
  JOIN products p ON p.id = s.product_id
  JOIN locations l ON l.id = s.location_id
`;

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`${SELECT} ORDER BY p.sku_code, l.code`);
    res.json(rows);
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
    const qtyVal = qty || 0;
    const { rows } = await pool.query(
      `INSERT INTO stocks (product_id, location_id, qty, available_qty)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [product_id, location_id, qtyVal, available_qty ?? qtyVal]
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
    const qtyVal = qty || 0;
    const { rows } = await pool.query(
      `UPDATE stocks SET product_id=$1, location_id=$2, qty=$3, available_qty=$4, updated_at=now()
       WHERE id=$5 RETURNING *`,
      [product_id, location_id, qtyVal, available_qty ?? qtyVal, req.params.id]
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
