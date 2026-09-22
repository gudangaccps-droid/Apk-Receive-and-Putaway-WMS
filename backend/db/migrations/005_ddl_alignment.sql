-- Selaraskan products, locations, stocks dengan DDL resmi yang diberikan.
-- Kolom/tipe di luar DDL ini (mis. timestamp audit) tetap dipertahankan
-- kalau tidak bertentangan, mengikuti pola yang sudah dipakai sejak
-- Blueprint Modul 1 - Master Product.

-- ---------- products ----------
ALTER TABLE products ALTER COLUMN id TYPE BIGINT;
ALTER TABLE products ALTER COLUMN barcode TYPE VARCHAR(50);
ALTER TABLE products ALTER COLUMN sku_code TYPE VARCHAR(50);
ALTER TABLE products ALTER COLUMN brand TYPE VARCHAR(100);
ALTER TABLE products ALTER COLUMN category TYPE VARCHAR(100);
ALTER TABLE products ALTER COLUMN group_code TYPE VARCHAR(20);
ALTER TABLE products ALTER COLUMN uom TYPE VARCHAR(20);
ALTER TABLE products ALTER COLUMN status TYPE VARCHAR(20);

-- ---------- locations ----------
-- code -> location_code, level -> shelf, bin -> position, is_active -> status.
-- zone_id (FK ke zones) dihapus, diganti kolom teks bebas `area` sesuai DDL;
-- `area`/`group_code` tetap disarankan lewat datalist dari zones/categories di form.
ALTER TABLE locations RENAME COLUMN code TO location_code;
ALTER TABLE locations RENAME COLUMN level TO shelf;
ALTER TABLE locations RENAME COLUMN bin TO position;

ALTER TABLE locations DROP CONSTRAINT locations_zone_id_fkey;
DROP INDEX IF EXISTS idx_locations_zone;
ALTER TABLE locations DROP COLUMN zone_id;

ALTER TABLE locations ADD COLUMN area VARCHAR(10);
ALTER TABLE locations ADD COLUMN group_code VARCHAR(20);
ALTER TABLE locations ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE locations DROP COLUMN is_active;

ALTER TABLE locations ALTER COLUMN id TYPE BIGINT;
ALTER TABLE locations ALTER COLUMN location_code TYPE VARCHAR(50);
ALTER TABLE locations ALTER COLUMN rack TYPE VARCHAR(10);
ALTER TABLE locations ALTER COLUMN shelf TYPE VARCHAR(10);
ALTER TABLE locations ALTER COLUMN position TYPE VARCHAR(10);

-- ---------- stocks ----------
ALTER TABLE stocks ALTER COLUMN id TYPE BIGINT;
ALTER TABLE stocks ALTER COLUMN product_id TYPE BIGINT;
ALTER TABLE stocks ALTER COLUMN location_id TYPE BIGINT;
ALTER TABLE stocks ALTER COLUMN qty TYPE INTEGER USING round(qty)::INTEGER;
ALTER TABLE stocks ALTER COLUMN available_qty TYPE INTEGER USING round(available_qty)::INTEGER;
