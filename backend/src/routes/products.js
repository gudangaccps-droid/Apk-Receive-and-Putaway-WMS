const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

const SELECT = `
  SELECT p.*, c.name AS category_name, u.code AS unit_code
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN units u ON u.id = p.unit_id
`;

router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (q) {
      const { rows } = await pool.query(
        `${SELECT} WHERE p.sku ILIKE $1 OR p.name ILIKE $1 ORDER BY p.id DESC`,
        [`%${q}%`]
      );
      return res.json(rows);
    }
    const { rows } = await pool.query(`${SELECT} ORDER BY p.id DESC`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${SELECT} WHERE p.id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { sku, name, variant, category_id, unit_id, barcode, min_stock, is_active } = req.body;
    if (!sku || !name) return res.status(400).json({ error: 'SKU dan nama wajib diisi' });
    const { rows } = await pool.query(
      `INSERT INTO products (sku, name, variant, category_id, unit_id, barcode, min_stock, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [sku, name, variant || null, category_id || null, unit_id || null, barcode || null, min_stock || 0, is_active ?? true]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'SKU sudah dipakai' });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { sku, name, variant, category_id, unit_id, barcode, min_stock, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE products SET sku=$1, name=$2, variant=$3, category_id=$4, unit_id=$5,
         barcode=$6, min_stock=$7, is_active=$8, updated_at=now()
       WHERE id=$9 RETURNING *`,
      [sku, name, variant || null, category_id || null, unit_id || null, barcode || null, min_stock || 0, is_active ?? true, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'SKU sudah dipakai' });
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
