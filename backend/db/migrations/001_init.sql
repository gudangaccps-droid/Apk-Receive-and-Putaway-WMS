-- WMS Gudang ACC — skema awal database
-- Mencakup Modul 1 (Master Data, aktif) dan tabel dasar untuk Modul 2-5
-- (Receiving & Putaway, Inventory Management, Picking, Cycle Count).
-- Modul 6 (Dashboard) tidak butuh tabel sendiri, hanya agregasi dari tabel di bawah.

-- ========================================================================
-- MODUL 1: MASTER DATA
-- ========================================================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,   -- mis. PCS, BOX, DUS, KG
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zones (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,   -- mis. HIJAU, MERAH, NEW, HOLD
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,   -- mis. G2-F2-S03
  zone_id INTEGER REFERENCES zones(id) ON DELETE SET NULL,
  rack TEXT,
  level TEXT,
  bin TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  variant TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
  barcode TEXT,
  min_stock NUMERIC(14,3) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin (to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_locations_zone ON locations(zone_id);

-- ========================================================================
-- MODUL 2: RECEIVING & PUTAWAY
-- ========================================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, PARTIAL, CLOSED, CANCELLED
  order_date DATE,
  expected_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id SERIAL PRIMARY KEY,
  po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty_ordered NUMERIC(14,3) NOT NULL DEFAULT 0,
  qty_received NUMERIC(14,3) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS receiving_headers (
  id SERIAL PRIMARY KEY,
  receiving_number TEXT NOT NULL UNIQUE,
  po_id INTEGER REFERENCES purchase_orders(id) ON DELETE SET NULL,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by TEXT,
  status TEXT NOT NULL DEFAULT 'NEW', -- NEW, READY, HOLD
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receiving_items (
  id SERIAL PRIMARY KEY,
  receiving_id INTEGER NOT NULL REFERENCES receiving_headers(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty_received NUMERIC(14,3) NOT NULL DEFAULT 0,
  qty_remaining NUMERIC(14,3) NOT NULL DEFAULT 0,
  condition TEXT,   -- BAIK, RUSAK, dll
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS putaway_tasks (
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
-- ========================================================================

CREATE TABLE IF NOT EXISTS inventory_stock (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  location_id INTEGER NOT NULL REFERENCES locations(id),
  qty NUMERIC(14,3) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, location_id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  location_id INTEGER REFERENCES locations(id),
  movement_type TEXT NOT NULL, -- IN, OUT, TRANSFER, ADJUSTMENT
  qty NUMERIC(14,3) NOT NULL,
  reference_type TEXT,         -- PUTAWAY, PICKING, CYCLE_COUNT, MANUAL
  reference_id INTEGER,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================================================
-- MODUL 4: PICKING
-- ========================================================================

CREATE TABLE IF NOT EXISTS picking_orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'NEW', -- NEW, IN_PROGRESS, DONE, CANCELLED
  requested_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS picking_order_items (
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

CREATE TABLE IF NOT EXISTS cycle_counts (
  id SERIAL PRIMARY KEY,
  count_number TEXT NOT NULL UNIQUE,
  location_id INTEGER REFERENCES locations(id),
  status TEXT NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, DONE
  scheduled_date DATE,
  completed_date DATE,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cycle_count_items (
  id SERIAL PRIMARY KEY,
  cycle_count_id INTEGER NOT NULL REFERENCES cycle_counts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  system_qty NUMERIC(14,3) NOT NULL DEFAULT 0,
  counted_qty NUMERIC(14,3),
  variance NUMERIC(14,3),
  notes TEXT
);
