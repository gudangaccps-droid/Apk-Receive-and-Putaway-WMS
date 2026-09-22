# WMS Gudang ACC

Warehouse Management System untuk mengelola operasional Gudang Aksesoris Partshop.

## Tujuan Sistem

Membangun sistem gudang berbasis data:

- Mengetahui lokasi setiap barang
- Mengurangi kesalahan picking
- Mempercepat pencarian barang
- Meningkatkan akurasi stok
- Membuat aktivitas gudang dapat dimonitor

## Prinsip Sistem

"Barang harus ditemukan berdasarkan data, bukan berdasarkan ingatan manusia."

## Teknologi

Frontend:
- React (Vite)

Backend:
- Node.js + Express

Database:
- PostgreSQL

## Modul

| # | Modul | Status |
|---|---|---|
| 1 | Master Data | **Development** |
| 2 | Receiving & Putaway | Planned |
| 3 | Inventory Management | Planned |
| 4 | Picking | Planned |
| 5 | Cycle Count | Planned |
| 6 | Dashboard | Planned |

Skema database untuk Modul 2-5 sudah disiapkan di `backend/db/migrations/001_init.sql` supaya pengembangan modul berikutnya tinggal dilanjutkan di atas fondasi yang sama; API dan UI-nya baru tersedia untuk Modul 1 (Master Data).

Rincian spesifikasi Modul 1 mengikuti [Blueprint Modul 1 - Master Data](docs/blueprint-modul-1-master-data.md), yang terdiri dari 6 bagian: Master Product, Master Location, Master Supplier, Master User, Master Parameter, Master Stock. Yang field-nya sudah dirinci dan diimplementasikan penuh: **Master Product**, **Master Location**, **Master User**, **Master Stock**, mengikuti DDL resmi (nama database `wms_acc`, `products`/`locations`/`stocks` persis sesuai tipe & panjang kolomnya). Master Parameter masih placeholder menunggu spesifikasi field.

Relasi antar tabel didokumentasikan di [ERD WMS Gudang ACC](docs/erd-wms-gudang-acc.md), alur proses Master Data (input produk/lokasi baru, cari lokasi via barcode) di [Master Data Flow](docs/alur-proses-master-data.md), dan daftar endpoint REST di [API Master Data](docs/api-modul-1-master-data.md).

## Struktur Proyek

```
backend/    API Express (REST) + skema & migrasi PostgreSQL
frontend/   Aplikasi React (Vite)
docker-compose.yml   Menjalankan database + backend + frontend sekaligus
```

## Menjalankan secara lokal

### Opsi 1 — Docker Compose (disarankan)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Database: PostgreSQL di port 5432 (kredensial di `docker-compose.yml`)

Migrasi & seed database berjalan otomatis saat container backend pertama kali start.

### Opsi 2 — Manual (tanpa Docker)

Butuh Node.js 20+ dan PostgreSQL yang sudah jalan.

**Backend:**

```bash
cd backend
cp .env.example .env   # sesuaikan DATABASE_URL bila perlu
npm install
npm run migrate        # membuat skema tabel
npm run seed           # data awal (satuan & zona default)
npm run dev
```

Alternatif untuk `npm run migrate`: database baru bisa juga dibuat langsung dari satu file skema lengkap, `backend/db/schema.sql` (lihat komentar di file itu untuk detail & batasannya):

```bash
psql -d wms_acc -f backend/db/schema.sql
psql -d wms_acc -f backend/db/seed.sql
```

**Frontend** (di terminal terpisah):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Buka http://localhost:5173 di browser.

## Deploy ke Vercel

Frontend **dan** backend di-deploy jadi satu, dalam satu project Vercel — tidak perlu hosting backend terpisah:

- `vercel.json` men-build & serve folder `frontend/` (Vite SPA) sebagai situs statis.
- `api/[...slug].js` membungkus backend Express sebagai satu Vercel Serverless Function yang menangani semua request `/api/*`.
- Karena frontend & backend satu origin, frontend otomatis memanggil path relatif `/api/...` di production (lihat `frontend/src/api/client.js`) — **tidak perlu** set `VITE_API_URL` di Vercel.

Cukup import repo ini ke Vercel apa adanya, tidak perlu mengubah Root Directory di dashboard.

### Yang wajib disiapkan: database PostgreSQL

Serverless function itu *stateless* — tidak menyimpan apa pun secara permanen di dirinya sendiri, dan tidak bisa menjangkau PostgreSQL yang jalan di `localhost` (itu cuma ada di komputer/sandbox tempat dia dijalankan). Ini bukan sesuatu yang bisa "diperbaiki" lewat kode — mau bagaimanapun, perlu database yang bisa diakses lewat internet supaya data yang di-input beneran tersimpan.

**Cara paling ringkas — pakai integrasi Storage bawaan Vercel (tanpa daftar akun terpisah):**

1. Di dashboard project Vercel Anda, buka tab **Storage** → **Create Database** → pilih **Neon** (Postgres) atau **Vercel Postgres**. Ikuti wizard-nya (beberapa klik saja, semuanya dari dalam Vercel).
2. Vercel otomatis menambahkan environment variable koneksinya (`DATABASE_URL` atau `POSTGRES_URL`) ke project — `backend/src/db/pool.js` sudah mengenali kedua nama itu otomatis, tidak perlu diseragamkan manual.
3. Terapkan skema ke database yang baru dibuat: buka SQL Editor-nya dari dashboard Storage, jalankan isi `backend/db/schema.sql` lalu `backend/db/seed.sql` (lihat catatan di dalam file `schema.sql`).
4. Redeploy (push apa saja ke `main`, atau klik Redeploy di dashboard Vercel).

**Alternatif manual** (kalau mau pilih provider lain seperti Supabase, atau kontrol penuh): buat database di [Neon](https://neon.tech)/Supabase secara terpisah, catat connection string-nya, jalankan `schema.sql`+`seed.sql` ke sana, lalu set `DATABASE_URL` di Vercel Project Settings → Environment Variables secara manual.

Tanpa `DATABASE_URL` ter-set ke database yang benar-benar bisa diakses dari internet, Master Data tidak akan bisa menyimpan data meskipun halamannya sudah bisa dibuka.

## Modul 1: Master Data

Sudah bisa dipakai untuk mengelola:

- **Master Product** — barcode, SKU code, nama produk, brand, kategori, kode group, UOM, status (sesuai Blueprint Modul 1)
- **Master Location** — kode lokasi, area, kode group, rack, shelf, position, status
- **Master Supplier**
- **Master User** — username, nama lengkap, role (ADMIN/SPV_GUDANG/STAFF_GUDANG/PICKER/QC), status; tabel menampilkan hak akses per role sebagai referensi
- **Master Stock** — menghubungkan produk + lokasi + jumlah (qty & qty tersedia)
- **Import CSV** — di Master Product & Master Location, untuk input data massal dari supplier/spreadsheet (upsert berdasarkan SKU Code / Kode Lokasi, dengan validasi & ringkasan hasil)
- **Cari Lokasi** — cari produk lewat scan barcode atau ketik SKU Code, menampilkan semua lokasi rak & jumlah stoknya (cocok untuk barcode scanner handheld yang bertindak sebagai keyboard)
- **Kategori** & **Satuan (UOM)** — daftar pilihan pendukung untuk form Master Product
- **Zona Gudang** — mis. HIJAU, MERAH, NEW, HOLD

Placeholder menunggu spesifikasi field: **Master Parameter**.

> Catatan: Master User saat ini adalah data identitas & role saja. Belum ada sistem login/autentikasi, jadi role belum ditegakkan sebagai hak akses nyata di aplikasi — itu menyusul seiring modul-modul terkait (Receiving, Picking, Cycle Count, dst.) dibangun.
