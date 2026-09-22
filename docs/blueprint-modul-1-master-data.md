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
6. Master Stock

> Status: field detail untuk Location, Supplier, dan Parameter menyusul.
> Yang sudah dirinci dan diimplementasikan sejauh ini: **Master Product**, **Master User**, **Master Stock**.

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

---

## 4. MASTER USER

### Fungsi

Menyimpan akun staff gudang beserta role & hak aksesnya.

### Role

- ADMIN
- SPV_GUDANG
- STAFF_GUDANG
- PICKER
- QC

### Hak Akses

| Role | Hak Akses |
|---|---|
| ADMIN | Akses penuh ke seluruh modul |
| SPV_GUDANG | Monitoring, Approval, Report |
| STAFF_GUDANG | Receiving, Putaway |
| PICKER | Picking |
| QC | Cycle Count |

### Database

Table: `users`

Field:

| Field | Type | Description |
|---|---|---|
| id | BIGINT | Primary Key |
| username | VARCHAR | Username login |
| full_name | VARCHAR | Nama lengkap |
| role | VARCHAR | ADMIN / SPV_GUDANG / STAFF_GUDANG / PICKER / QC |
| status | VARCHAR | Status akun (ACTIVE/INACTIVE) |

> Catatan: tabel ini menyimpan identitas & role user (master data), belum termasuk
> autentikasi (login/password) atau penegakan hak akses di level aplikasi — itu
> menyusul saat modul-modul terkait (Receiving, Picking, Cycle Count, dst.) dibangun.

---

## 6. MASTER STOCK

### Fungsi

Menghubungkan:

Produk

+

Lokasi

+

Jumlah

### Database

Table: `stocks`

Field:

| Field | Description |
|---|---|
| product_id | Produk |
| location_id | Lokasi |
| qty | Jumlah |
| available_qty | Stok tersedia |

### Contoh

Product: `Anker Charger 20W`

Location: `A-CHR-R01-B01-P01`

Qty: `50 PCS`
