const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

const SELECT = `
  SELECT l.*, z.code AS zone_code, z.name AS zone_name
  FROM locations l
  LEFT JOIN zones z ON z.id = l.zone_id
`;

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`${SELECT} ORDER BY l.code`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${SELECT} WHERE l.id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Lokasi tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, zone_id, rack, level, bin, description, is_active } = req.body;
    if (!code) return res.status(400).json({ error: 'Kode lokasi wajib diisi' });
    const { rows } = await pool.query(
      `INSERT INTO locations (code, zone_id, rack, level, bin, description, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [code, zone_id || null, rack || null, level || null, bin || null, description || null, is_active ?? true]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Kode lokasi sudah dipakai' });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { code, zone_id, rack, level, bin, description, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE locations SET code=$1, zone_id=$2, rack=$3, level=$4, bin=$5, description=$6, is_active=$7
       WHERE id=$8 RETURNING *`,
      [code, zone_id || null, rack || null, level || null, bin || null, description || null, is_active ?? true, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Lokasi tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Kode lokasi sudah dipakai' });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM locations WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Lokasi tidak ditemukan' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
