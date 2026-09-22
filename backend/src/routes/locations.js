const express = require('express');
const pool = require('../db/pool');
const { upload, parseCsvBuffer } = require('../importUpload');

const router = express.Router();

const SELECT = `
  SELECT l.*, z.code AS zone_code, z.name AS zone_name
  FROM locations l
  LEFT JOIN zones z ON z.id = l.zone_id
`;

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
      const code = (row.code || '').trim();
      if (!code) {
        skipped++;
        errors.push(`Baris ${i + 2}: code kosong`);
        continue;
      }

      let zone_id = null;
      const zoneCode = (row.zone_code || '').trim();
      if (zoneCode) {
        const zoneRes = await pool.query('SELECT id FROM zones WHERE code = $1', [zoneCode]);
        if (!zoneRes.rows[0]) {
          skipped++;
          errors.push(`Baris ${i + 2}: zona "${zoneCode}" tidak ditemukan`);
          continue;
        }
        zone_id = zoneRes.rows[0].id;
      }

      const values = [
        code,
        zone_id,
        (row.rack || '').trim() || null,
        (row.level || '').trim() || null,
        (row.bin || '').trim() || null,
        (row.description || '').trim() || null,
      ];

      const existing = await pool.query('SELECT id FROM locations WHERE code = $1', [code]);
      if (existing.rows[0]) {
        await pool.query(
          `UPDATE locations SET code=$1, zone_id=$2, rack=$3, level=$4, bin=$5, description=$6, is_active=true
           WHERE id=$7`,
          [...values, existing.rows[0].id]
        );
        updated++;
      } else {
        await pool.query(
          `INSERT INTO locations (code, zone_id, rack, level, bin, description, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,true)`,
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
