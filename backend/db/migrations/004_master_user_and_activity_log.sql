-- Master User (Blueprint Modul 1, bagian 4) + relasi USER->STOCK_MOVEMENT
-- dan USER->ACTIVITY_LOG dari ERD WMS Gudang ACC.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SPV_GUDANG', 'STAFF_GUDANG', 'PICKER', 'QC')),
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stock_movements ADD COLUMN user_id INTEGER REFERENCES users(id);

CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
