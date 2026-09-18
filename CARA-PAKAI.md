# Aplikasi Label Dus Gudang — Versi Lokal

Aplikasi ini berjalan di komputer sendiri, tanpa internet.

## Isi folder

| File | Fungsi |
|---|---|
| `index.html` | Aplikasinya |
| `server.js` | Server lokal, supaya data bisa dibagi ke beberapa staff |
| `JALANKAN-WINDOWS.bat` | Klik dua kali untuk menjalankan server di Windows |
| `data.json` | File data (dibuat otomatis saat server pertama kali jalan) |
| `backup/` | Backup harian otomatis (dibuat otomatis) |

---

## Cara 1 — Dipakai bersama beberapa staff (disarankan)

Data tersimpan di satu komputer, semua staff melihat data yang sama.

**Persiapan sekali saja:** pasang Node.js dari https://nodejs.org (pilih versi **LTS**).

**Menjalankan:**

- **Windows** — klik dua kali `JALANKAN-WINDOWS.bat`
- **Mac / Linux** — buka Terminal di folder ini, ketik: `node server.js`

Setelah jalan, layar akan menampilkan alamat seperti:

```
Komputer ini : http://localhost:3000
Staff lain   : http://192.168.1.10:3000
```

- Di komputer server: buka `http://localhost:3000`
- Di HP/komputer staff lain (**harus satu WiFi/jaringan yang sama**): buka alamat `http://192.168.1.10:3000` (angkanya ikuti yang muncul di layar)

Di dalam aplikasi akan muncul label hijau **"Mode: Server lokal"** — artinya data sudah dibagi bersama.

Komputer server harus tetap menyala dan server tetap jalan selama aplikasi dipakai staff lain.

---

## Cara 2 — Dipakai sendiri saja (paling cepat)

Klik dua kali `index.html`, aplikasi langsung terbuka di browser.

Label birunya akan tertulis **"Mode: Browser ini saja"** — data hanya tersimpan di browser komputer itu dan **tidak** terlihat oleh staff lain. Cocok untuk coba-coba atau pemakaian satu orang.

---

## Backup data

Ada tiga lapis pengaman:

1. **Otomatis** — server menyimpan salinan harian ke folder `backup/`
2. **Manual** — tombol **Export Excel** di aplikasi (simpan filenya ke flashdisk/Google Drive secara berkala)
3. **File mentah** — salin file `data.json` kapan saja

Untuk memulihkan data: pakai tombol **Import Excel** di aplikasi, atau timpa `data.json` dengan file backup lalu jalankan ulang server.

---

## Pertanyaan umum

**Staff lain tidak bisa membuka alamatnya?**
Pastikan semua perangkat di WiFi yang sama. Kalau masih gagal, biasanya Firewall Windows memblokir — saat pertama kali menjalankan server, pilih **Allow / Izinkan akses**.

**Data hilang setelah ganti browser?**
Itu terjadi kalau memakai Cara 2. Data di mode browser tidak berpindah antar browser atau antar komputer. Gunakan Cara 1 agar aman.

**Mau ganti nomor port (misal 3000 dipakai aplikasi lain)?**
Jalankan dengan: `PORT=4000 node server.js` (Mac/Linux) atau `set PORT=4000 && node server.js` (Windows).
