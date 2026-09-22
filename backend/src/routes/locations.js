const express = require('express');
const pool = require('../db/pool');
const { upload, parseCsvBuffer } = require('../importUpload');

const router = express.Router();

// Alur: Master Location Excel -> Import System -> Validation -> Location Active
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
      const location_code = (row.location_code || '').trim();
      if (!location_code) {
        skipped++;
        errors.push(`Baris ${i + 2}: location_code kosong`);
        continue;
      }

      const values = [
        location_code,
        (row.area || '').trim() || null,
        (row.group_code || '').trim() || null,
        (row.rack || '').trim() || null,
        (row.shelf || '').trim() || null,
        (row.position || '').trim() || null,
        (row.description || '').trim() || null,
      ];

      const existing = await pool.query('SELECT id FROM locations WHERE location_code = $1', [location_code]);
      if (existing.rows[0]) {
        await pool.query(
          `UPDATE locations SET location_code=$1, area=$2, group_code=$3, rack=$4, shelf=$5, position=$6,
             description=$7, status='ACTIVE' WHERE id=$8`,
          [...values, existing.rows[0].id]
        );
        updated++;
      } else {
        await pool.query(
          `INSERT INTO locations (location_code, area, group_code, rack, shelf, position, description, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'ACTIVE')`,
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

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM locations ORDER BY location_code');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM locations WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Lokasi tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { location_code, area, group_code, rack, shelf, position, description, status } = req.body;
    if (!location_code) return res.status(400).json({ error: 'Kode lokasi wajib diisi' });
    const { rows } = await pool.query(
      `INSERT INTO locations (location_code, area, group_code, rack, shelf, position, description, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        location_code,
        area || null,
        group_code || null,
        rack || null,
        shelf || null,
        position || null,
        description || null,
        status || 'ACTIVE',
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Kode lokasi sudah dipakai' });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { location_code, area, group_code, rack, shelf, position, description, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE locations SET location_code=$1, area=$2, group_code=$3, rack=$4, shelf=$5, position=$6,
         description=$7, status=$8
       WHERE id=$9 RETURNING *`,
      [
        location_code,
        area || null,
        group_code || null,
        rack || null,
        shelf || null,
        position || null,
        description || null,
        status || 'ACTIVE',
        req.params.id,
      ]
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
