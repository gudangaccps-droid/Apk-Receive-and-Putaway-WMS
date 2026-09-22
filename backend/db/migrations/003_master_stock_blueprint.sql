-- Selaraskan tabel stok dengan Blueprint Modul 1 - Master Stock.
-- Tabel inventory_stock (dibuat di 001_init.sql sebagai bagian skema Modul 3)
-- adalah konsep yang sama dengan Master Stock (produk + lokasi + jumlah),
-- jadi diganti nama & ditambah available_qty sesuai spek, bukan dibuat tabel baru.

ALTER TABLE inventory_stock RENAME TO stocks;
ALTER TABLE stocks ADD COLUMN available_qty NUMERIC(14,3) NOT NULL DEFAULT 0;
