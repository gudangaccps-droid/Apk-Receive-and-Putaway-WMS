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

**Frontend** (di terminal terpisah):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Buka http://localhost:5173 di browser.

## Deploy ke Vercel

`vercel.json` di root sudah dikonfigurasi supaya Vercel hanya build & serve folder `frontend/` (Vite SPA) — cukup import repo ini ke Vercel apa adanya, tidak perlu mengubah Root Directory di dashboard.

Yang **belum** ter-cover oleh Vercel: backend (Express + PostgreSQL). Vercel bersifat serverless dan tidak cocok menjalankan server Express + koneksi database persisten seperti ini apa adanya. Backend perlu di-deploy terpisah ke platform seperti Railway, Render, atau Fly.io, dengan database PostgreSQL cloud (mis. Neon atau Supabase).

Setelah backend punya URL publik, set environment variable berikut di Vercel (Project Settings → Environment Variables):

```
VITE_API_URL=https://<url-backend-anda>/api
```

Tanpa ini, frontend yang di-deploy ke Vercel akan mencoba mengakses `http://localhost:4000/api` (gagal, karena itu alamat lokal) — jadi Master Data belum bisa dipakai sampai backend juga online dan variabel ini di-set.

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
