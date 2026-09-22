# MASTER DATA FLOW

## Input Barang Baru

```
Supplier/Product Data
        ↓
Admin Import Product
        ↓
Validation
        ↓
Product Active
```

Diimplementasikan sebagai **Import Excel** di halaman Master Product: admin mengunggah file
berisi data produk dari supplier, tiap baris divalidasi (SKU Code & Nama Produk wajib
ada), lalu produk yang lolos validasi disimpan dengan status `ACTIVE`. Produk dengan
SKU Code yang sudah ada akan diperbarui (upsert), bukan diduplikasi.

## Input Lokasi Baru

```
Master Location Excel
        ↓
Import System
        ↓
Validation
        ↓
Location Active
```

Diimplementasikan sebagai **Import Excel** di halaman Master Location: tiap baris
divalidasi (Kode Lokasi wajib ada; Kode Zona jika diisi harus sudah terdaftar di
Master Zona), lalu lokasi yang lolos validasi disimpan sebagai aktif (`is_active =
true`). Lokasi dengan kode yang sudah ada akan diperbarui (upsert).

## Cari Lokasi via Barcode Scanner

```
Barcode Scanner
        ↓
Search Product
        ↓
Find Location
        ↓
Display Location
```

Diimplementasikan sebagai halaman **Cari Lokasi** di Master Data: staff men-scan
(atau mengetik) barcode/SKU produk, sistem mencari produknya, lalu menampilkan semua
lokasi rak tempat produk itu disimpan beserta jumlahnya.

Contoh output:

Product: `Anker Charger`

Location: `A-CHR-R01-B01-P01`
