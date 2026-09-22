const express = require('express');
const pool = require('../db/pool');

/**
 * Router CRUD generik untuk tabel master data sederhana (tanpa relasi),
 * mis. categories, units, zones. `columns` adalah daftar kolom yang boleh
 * diterima dari body request, dalam urutan yang sama dengan `required`.
 */
function simpleCrudRouter(table, columns) {
  const router = express.Router();
  const cols = columns.map((c) => c.name);

  router.get('/', async (_req, res, next) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY id`);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
      if (!rows[0]) return res.status(404).json({ error: `${table} tidak ditemukan` });
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      for (const c of columns) {
        if (c.required && !req.body[c.name]) {
          return res.status(400).json({ error: `${c.name} wajib diisi` });
        }
      }
      // Hanya sertakan kolom yang benar-benar dikirim, supaya kolom yang
      // tidak diisi memakai DEFAULT dari database, bukan ditimpa NULL
      // (mis. suppliers.is_active NOT NULL DEFAULT true).
      const provided = cols.filter((c) => req.body[c] !== undefined);
      const values = provided.map((c) => req.body[c] ?? null);
      const { rows } = provided.length
        ? await pool.query(
            `INSERT INTO ${table} (${provided.join(', ')})
             VALUES (${provided.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
            values
          )
        : await pool.query(`INSERT INTO ${table} DEFAULT VALUES RETURNING *`);
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const provided = cols.filter((c) => req.body[c] !== undefined);
      if (provided.length === 0) {
        const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
        if (!rows[0]) return res.status(404).json({ error: `${table} tidak ditemukan` });
        return res.json(rows[0]);
      }
      const values = provided.map((c) => req.body[c] ?? null);
      const setClause = provided.map((c, i) => `${c} = $${i + 1}`).join(', ');
      const { rows } = await pool.query(
        `UPDATE ${table} SET ${setClause} WHERE id = $${provided.length + 1} RETURNING *`,
        [...values, req.params.id]
      );
      if (!rows[0]) return res.status(404).json({ error: `${table} tidak ditemukan` });
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const { rowCount } = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
      if (!rowCount) return res.status(404).json({ error: `${table} tidak ditemukan` });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = simpleCrudRouter;
