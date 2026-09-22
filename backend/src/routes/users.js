const express = require('express');
const pool = require('../db/pool');
const { ROLES, ROLE_PERMISSIONS } = require('../roles');

const router = express.Router();

router.get('/roles', (_req, res) => {
  res.json(ROLES.map((role) => ({ role, permissions: ROLE_PERMISSIONS[role] })));
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { username, full_name, role, status } = req.body;
    if (!username || !full_name || !role) {
      return res.status(400).json({ error: 'Username, nama lengkap, dan role wajib diisi' });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: `Role harus salah satu dari: ${ROLES.join(', ')}` });
    }
    const { rows } = await pool.query(
      `INSERT INTO users (username, full_name, role, status) VALUES ($1,$2,$3,$4) RETURNING *`,
      [username, full_name, role, status || 'ACTIVE']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username sudah dipakai' });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { username, full_name, role, status } = req.body;
    if (role && !ROLES.includes(role)) {
      return res.status(400).json({ error: `Role harus salah satu dari: ${ROLES.join(', ')}` });
    }
    const { rows } = await pool.query(
      `UPDATE users SET username=$1, full_name=$2, role=$3, status=$4 WHERE id=$5 RETURNING *`,
      [username, full_name, role, status || 'ACTIVE', req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username sudah dipakai' });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
