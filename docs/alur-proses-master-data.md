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

Diimplementasikan sebagai **Import CSV** di halaman Master Product: admin mengunggah file
berisi data produk dari supplier, tiap baris divalidasi (`sku_code` & `product_name` wajib
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

Diimplementasikan sebagai **Import CSV** di halaman Master Location: tiap baris
divalidasi (`location_code` wajib ada), lalu lokasi yang lolos validasi disimpan
dengan status `ACTIVE`. Lokasi dengan kode yang sudah ada akan diperbarui (upsert).

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
