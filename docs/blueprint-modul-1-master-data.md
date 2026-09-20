# BLUEPRINT MODUL 1

# MASTER DATA WMS GUDANG ACC

## 1. Tujuan Modul

Master Data adalah fondasi utama WMS.

Semua transaksi gudang bergantung pada data:

- Barang
- Lokasi
- User
- Supplier

Jika master data tidak akurat maka:

Receiving salah.
Putaway salah.
Picking salah.
Stock salah.

---

## 2. Scope Modul

Modul ini terdiri dari:

1. Master Product
2. Master Location
3. Master Supplier
4. Master User
5. Master Parameter

> Status: field detail untuk Location, Supplier, User, dan Parameter menyusul.
> Yang sudah dirinci dan diimplementasikan sejauh ini: **Master Product**.

---

## 3. MASTER PRODUCT

### Fungsi

Menyimpan seluruh informasi barang.

### Database

Table: `products`

Field:

| Field | Type | Description |
|---|---|---|
| id | BIGINT | Primary Key |
| barcode | VARCHAR | Barcode produk |
| sku_code | VARCHAR | Kode SKU |
| product_name | TEXT | Nama produk |
| brand | VARCHAR | Brand |
| category | VARCHAR | Kategori |
| group_code | VARCHAR | Kode lokasi |
| uom | VARCHAR | Satuan |
| status | VARCHAR | Status barang |

### Contoh Data

Barcode: `194644167882`

Nama: `Anker Charger 20W`

Group: `CHR`

UOM: `PCS`
