const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function seed() {
  const sql = fs.readFileSync(path.join(__dirname, '..', '..', 'db', 'seed.sql'), 'utf8');
  await pool.query(sql);
  console.log('Seed selesai.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed gagal:', err);
  process.exit(1);
});
