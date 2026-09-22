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

const pool = new Pool({ connectionString });

module.exports = pool;
