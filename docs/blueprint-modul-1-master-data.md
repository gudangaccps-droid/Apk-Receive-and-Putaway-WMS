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

> Status: field detail untuk Supplier dan Parameter menyusul.
> Yang sudah dirinci dan diimplementasikan sejauh ini: **Master Product**, **Master Location**, **Master User**, **Master Stock**.

### Database

Nama database: `wms_acc`.

Skema `products`, `locations`, dan `stocks` mengikuti DDL resmi berikut (tipe & panjang kolom persis, termasuk `BIGSERIAL`/`BIGINT` untuk PK & FK):

```sql
CREATE DATABASE wms_acc;

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  barcode VARCHAR(50),
  sku_code VARCHAR(50),
  product_name TEXT,
  brand VARCHAR(100),
  category VARCHAR(100),
  group_code VARCHAR(20),
  uom VARCHAR(20),
  status VARCHAR(20)
);

CREATE TABLE locations (
  id BIGSERIAL PRIMARY KEY,
  location_code VARCHAR(50),
  area VARCHAR(10),
  group_code VARCHAR(20),
  rack VARCHAR(10),
  shelf VARCHAR(10),
  position VARCHAR(10),
  status VARCHAR(20)
);

CREATE TABLE stocks (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT,
  location_id BIGINT,
  qty INTEGER,
  available_qty INTEGER
);
```

Kolom di luar DDL ini (mis. `created_at`/`updated_at` untuk audit, `description` di `locations`) tetap dipertahankan di implementasi karena tidak bertentangan dengan spek — sama seperti field tambahan lain sejak Master Product.

---

## 3. MASTER PRODUCT

### Fungsi

Menyimpan seluruh informasi barang.

### Database

Table: `products`

Field:

| Field | Type | Description |
|---|---|---|
| id | BIGSERIAL | Primary Key |
| barcode | VARCHAR(50) | Barcode produk |
| sku_code | VARCHAR(50) | Kode SKU |
| product_name | TEXT | Nama produk |
| brand | VARCHAR(100) | Brand |
| category | VARCHAR(100) | Kategori |
| group_code | VARCHAR(20) | Kode group produk |
| uom | VARCHAR(20) | Satuan |
| status | VARCHAR(20) | Status barang |

### Contoh Data

Barcode: `194644167882`

Nama: `Anker Charger 20W`

Group: `CHR`

UOM: `PCS`

---

## 4. MASTER LOCATION

### Fungsi

Menyimpan seluruh informasi lokasi rak di gudang.

### Database

Table: `locations`

Field:

| Field | Type | Description |
|---|---|---|
| id | BIGSERIAL | Primary Key |
| location_code | VARCHAR(50) | Kode lokasi |
| area | VARCHAR(10) | Area gudang |
| group_code | VARCHAR(20) | Kode group (mencocokkan `group_code` di Master Product untuk slotting) |
| rack | VARCHAR(10) | Rak |
| shelf | VARCHAR(10) | Shelf |
| position | VARCHAR(10) | Position |
| status | VARCHAR(20) | Status lokasi |

### Contoh Data

Location Code: `A-CHR-R01-B01-P01`

Area: `A`

Group: `CHR`

Rack: `R01` · Shelf: `B01` · Position: `P01`

---

## 5. MASTER USER

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

| Field | Type | Description |
|---|---|---|
| id | BIGSERIAL | Primary Key |
| product_id | BIGINT | Produk |
| location_id | BIGINT | Lokasi |
| qty | INTEGER | Jumlah |
| available_qty | INTEGER | Stok tersedia |

### Contoh

Product: `Anker Charger 20W`

Location: `A-CHR-R01-B01-P01`

Qty: `50 PCS`
