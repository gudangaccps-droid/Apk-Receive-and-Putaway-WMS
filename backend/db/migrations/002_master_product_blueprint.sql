-- Selaraskan tabel products dengan Blueprint Modul 1 - Master Product.
-- category & uom menjadi teks bebas (bukan lagi FK ke categories/units);
-- tabel categories & units tetap dipertahankan sebagai sumber pilihan di form.

ALTER TABLE products RENAME COLUMN sku TO sku_code;
ALTER TABLE products RENAME COLUMN name TO product_name;

ALTER TABLE products ADD COLUMN brand TEXT;
ALTER TABLE products ADD COLUMN category TEXT;
ALTER TABLE products ADD COLUMN group_code TEXT;
ALTER TABLE products ADD COLUMN uom TEXT;
ALTER TABLE products ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE products DROP COLUMN category_id;
ALTER TABLE products DROP COLUMN unit_id;
ALTER TABLE products DROP COLUMN variant;
ALTER TABLE products DROP COLUMN min_stock;
ALTER TABLE products DROP COLUMN is_active;
