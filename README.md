# Apk-Receive-and-Putaway-WMS

Aplikasi **Label Dus Gudang** — untuk proses *Receiving* (penerimaan barang) dan *Putaway* (penyusunan barang ke rak) di gudang ACC PS.

Aplikasi ini berjalan lokal (tanpa internet), berbasis browser + server Node.js ringan tanpa dependency eksternal.

## Fitur

- **Input & Daftar** — catat setiap dus/label barang masuk (tanggal terima, supplier, No GRN/SJ, SKU, nama barang, varian, PIC, qty, lokasi, zona, status), dengan pencarian & filter.
- **Putaway (FIFO)** — daftar dus yang belum disusun, diurutkan FIFO (stok tertua per SKU diprioritaskan), mendukung penyusunan sebagian (partial putaway) dengan qty & lokasi rak tujuan.
- **Riwayat Disusun** — riwayat tiap transaksi penyusunan per label, termasuk yang baru tersusun sebagian.
- **Cetak Label** — cetak label dus siap tempel lengkap dengan barcode (CODE128), 8 label per lembar A4.
- **Export / Import Excel** — backup dan pemulihan data lewat file Excel.
- **Mode Server Lokal** — data dibagikan ke semua staff di jaringan/WiFi yang sama lewat server lokal; kalau server tidak aktif, otomatis memakai `localStorage` di browser masing-masing.

## Cara menjalankan

Lihat panduan lengkap di [CARA-PAKAI.md](CARA-PAKAI.md).

Ringkas:

```bash
node server.js
```

Lalu buka `http://localhost:3000` di browser. Staff lain di jaringan yang sama bisa membuka alamat IP yang ditampilkan di terminal.

Di Windows, cukup klik dua kali `JALANKAN-WINDOWS.bat`.
