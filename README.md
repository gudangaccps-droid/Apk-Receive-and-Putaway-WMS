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

## Modul 1: Master Data

Sudah bisa dipakai untuk mengelola:

- **Produk / SKU** — kode, nama, varian, kategori, satuan, barcode, stok minimum
- **Lokasi Rak** — kode lokasi, zona, rak, level, bin
- **Kategori** barang
- **Satuan (UOM)** — mis. PCS, BOX, DUS
- **Supplier**
- **Zona Gudang** — mis. HIJAU, MERAH, NEW, HOLD
