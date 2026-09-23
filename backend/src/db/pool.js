const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Vercel's native Storage integrations (mis. Neon Postgres lewat tab
// Storage) menaruh connection string-nya di salah satu nama variabel ini,
// bukan selalu DATABASE_URL — jadi terima yang mana saja yang tersedia.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

// Tanpa connection string dan bukan di Vercel: pakai database lokal bawaan
// (PGlite — PostgreSQL yang jalan di dalam proses Node, disimpan di
// backend/data/), supaya bisa jalan di satu komputer tanpa install
// PostgreSQL/Docker. Di Vercel sengaja tidak dipakai: filesystem serverless
// tidak permanen, data akan hilang diam-diam.
function createLocalPool() {
  const dataDir = process.env.LOCAL_DB_DIR || path.join(__dirname, '..', '..', 'data', 'pglite');
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });
  const dbPromise = import('@electric-sql/pglite').then(({ PGlite }) => PGlite.create(dataDir));

  const query = async (text, params) => {
    const db = await dbPromise;
    if (params && params.length) {
      const r = await db.query(text, params);
      return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length };
    }
    // Tanpa parameter: pakai exec supaya file SQL berisi banyak statement
    // (migrasi, seed) bisa dijalankan sekaligus, seperti di pg.
    const results = await db.exec(text);
    const last = results[results.length - 1] || { rows: [] };
    return { rows: last.rows, rowCount: last.affectedRows ?? last.rows.length };
  };

  return {
    query,
    connect: async () => ({ query, release: () => {} }),
    end: async () => (await dbPromise).close(),
  };
}

const pool =
  connectionString || process.env.VERCEL ? new Pool({ connectionString }) : createLocalPool();

module.exports = pool;
