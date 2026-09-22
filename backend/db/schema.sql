-- WMS Gudang ACC — schema.sql
--
-- Skema database LENGKAP dalam satu file, hasil konsolidasi migrasi
-- 001-005 (lihat backend/db/migrations/ untuk riwayat perubahannya).
-- Dipakai untuk membuat database baru langsung dari nol tanpa perlu
-- menjalankan migrasi satu per satu.
--
-- Cara pakai:
--   createdb wms_acc
--   psql -d wms_acc -f backend/db/schema.sql
--   psql -d wms_acc -f backend/db/seed.sql   -- data awal (satuan & zona)
--
-- Menghasilkan skema akhir yang sama (secara fungsional) dengan menjalankan
-- migrasi 001-005 satu per satu lewat `npm run migrate`; hanya beberapa nama
-- constraint/sequence yang lebih bersih di sini (tidak membawa nama lama
-- `inventory_stock_*` dari sebelum tabel itu di-rename jadi `stocks`).
--
-- PENTING: pilih salah satu cara inisialisasi database, jangan dicampur.
-- File ini TIDAK mengisi tabel `schema_migrations` (bookkeeping internal
-- `npm run migrate`), jadi database yang dibuat dari file ini tidak cocok
-- dilanjutkan dengan `npm run migrate` — migrasi 001 dst. akan mencoba
-- membuat ulang tabel yang sudah ada dan gagal.

CREATE DATABASE wms_acc;

\connect wms_acc

-- ========================================================================
-- MODUL 1: MASTER DATA
-- Blueprint: docs/blueprint-modul-1-master-data.md
-- ========================================================================

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,   -- mis. PCS, BOX, DUS, KG
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,   -- mis. HIJAU, MERAH, NEW, HOLD
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Master Product
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  barcode VARCHAR(50),
  sku_code VARCHAR(50) NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  brand VARCHAR(100),
  category VARCHAR(100),
  group_code VARCHAR(20),
  uom VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_name ON products USING gin (to_tsvector('simple', product_name));

-- Master Location
-- area/group_code adalah teks bebas (bukan FK) — `zones` di atas dipakai
-- sebagai daftar saran di form, tidak ditegakkan lewat foreign key.
CREATE TABLE locations (
  id BIGSERIAL PRIMARY KEY,
  location_code VARCHAR(50) NOT NULL UNIQUE,
  area VARCHAR(10),
  group_code VARCHAR(20),
  rack VARCHAR(10),
  shelf VARCHAR(10),
  "position" VARCHAR(10),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Master User
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SPV_GUDANG', 'STAFF_GUDANG', 'PICKER', 'QC')),
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Master Stock — menghubungkan Product + Location + Qty
CREATE TABLE stocks (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id),
  location_id BIGINT NOT NULL REFERENCES locations(id),
  qty INTEGER NOT NULL DEFAULT 0,
  available_qty INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, location_id)
);

-- Log aktivitas user di sistem (relasi USER -> ACTIVITY_LOG di ERD)
CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_user ON activity_log(user_id);

-- ========================================================================
-- MODUL 2: RECEIVING & PUTAWAY
-- ========================================================================

CREATE TABLE purchase_orders (
  id SERIAL PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, PARTIAL, CLOSED, CANCELLED
  order_date DATE,
  expected_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE purchase_order_items (
  id SERIAL PRIMARY KEY,
  po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty_ordered NUMERIC(14,3) NOT NULL DEFAULT 0,
  qty_received NUMERIC(14,3) NOT NULL DEFAULT 0
);

CREATE TABLE receiving_headers (
  id SERIAL PRIMARY KEY,
  receiving_number TEXT NOT NULL UNIQUE,
  po_id INTEGER REFERENCES purchase_orders(id) ON DELETE SET NULL,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by TEXT,
  status TEXT NOT NULL DEFAULT 'NEW', -- NEW, READY, HOLD
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE receiving_items (
  id SERIAL PRIMARY KEY,
  receiving_id INTEGER NOT NULL REFERENCES receiving_headers(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty_received NUMERIC(14,3) NOT NULL DEFAULT 0,
  qty_remaining NUMERIC(14,3) NOT NULL DEFAULT 0,
  condition TEXT,   -- BAIK, RUSAK, dll
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE putaway_tasks (
  id SERIAL PRIMARY KEY,
  receiving_item_id INTEGER NOT NULL REFERENCES receiving_items(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty NUMERIC(14,3) NOT NULL,
  location_id INTEGER REFERENCES locations(id),
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, SELESAI
  assigned_to TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================================================
-- MODUL 3: INVENTORY MANAGEMENT
-- (Master Stock ada di bagian Modul 1 di atas; stock_movements di sini
-- adalah riwayat mutasinya, relasi USER -> STOCK_MOVEMENT di ERD)
-- ========================================================================

CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  location_id INTEGER REFERENCES locations(id),
  movement_type TEXT NOT NULL, -- IN, OUT, TRANSFER, ADJUSTMENT
  qty NUMERIC(14,3) NOT NULL,
  reference_type TEXT,         -- PUTAWAY, PICKING, CYCLE_COUNT, MANUAL
  reference_id INTEGER,
  created_by TEXT,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================================================
-- MODUL 4: PICKING
-- ========================================================================

CREATE TABLE picking_orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'NEW', -- NEW, IN_PROGRESS, DONE, CANCELLED
  requested_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE picking_order_items (
  id SERIAL PRIMARY KEY,
  picking_order_id INTEGER NOT NULL REFERENCES picking_orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  location_id INTEGER REFERENCES locations(id),
  qty_requested NUMERIC(14,3) NOT NULL,
  qty_picked NUMERIC(14,3) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' -- PENDING, PICKED, SHORT
);

-- ========================================================================
-- MODUL 5: CYCLE COUNT
-- ========================================================================

CREATE TABLE cycle_counts (
  id SERIAL PRIMARY KEY,
  count_number TEXT NOT NULL UNIQUE,
  location_id INTEGER REFERENCES locations(id),
  status TEXT NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, DONE
  scheduled_date DATE,
  completed_date DATE,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cycle_count_items (
  id SERIAL PRIMARY KEY,
  cycle_count_id INTEGER NOT NULL REFERENCES cycle_counts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  system_qty NUMERIC(14,3) NOT NULL DEFAULT 0,
  counted_qty NUMERIC(14,3),
  variance NUMERIC(14,3),
  notes TEXT
);

-- ========================================================================
-- MODUL 6: DASHBOARD
-- Tidak punya tabel sendiri — hanya agregasi dari tabel-tabel di atas.
-- ========================================================================
