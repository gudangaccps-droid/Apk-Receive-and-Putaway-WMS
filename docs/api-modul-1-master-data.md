# API MASTER DATA

Base URL lokal: `http://localhost:4000/api` (lihat `VITE_API_URL` di frontend, atau bagian
[Deploy ke Vercel](../README.md#deploy-ke-vercel) di README untuk lingkungan lain).

Semua endpoint di bawah ini sudah diimplementasikan dan diuji. Path memakai bentuk jamak
(`/products`, `/locations`, `/stocks`) secara konsisten — mengikuti konvensi REST standar
untuk collection endpoint, dan sesuai persis dengan spek `/api/products` di bagian Product.
Kalau memang dimaksudkan `/api/location` & `/api/stock` (singular) sebagai path final untuk
dua resource itu, beri tahu untuk di-rename.

## Product

GET `/api/products`
Daftar produk. Query opsional `?q=` untuk cari berdasarkan barcode/SKU Code/nama produk.

GET `/api/products/:id`
Detail satu produk.

POST `/api/products`
Buat produk baru. Body: `barcode, sku_code, product_name, brand, category, group_code, uom, status`.
`sku_code` & `product_name` wajib diisi.

PUT `/api/products/:id`
Ubah produk.

DELETE `/api/products/:id`
Hapus produk.

POST `/api/products/import`
Import massal dari file CSV (lihat [Master Data Flow](alur-proses-master-data.md)).

## Location

GET `/api/locations`
Daftar lokasi rak.

GET `/api/locations/:id`
Detail satu lokasi.

POST `/api/locations`
Buat lokasi baru. Body: `location_code, area, group_code, rack, shelf, position, description, status`.
`location_code` wajib diisi.

PUT `/api/locations/:id`
Ubah lokasi.

DELETE `/api/locations/:id`
Hapus lokasi.

POST `/api/locations/import`
Import massal dari file CSV.

## Stock

GET `/api/stocks`
Daftar stok (join ke produk & lokasi).

GET `/api/stocks/:id`
Detail satu baris stok.

GET `/api/stocks/find?code=`
Cari lokasi dari barcode/SKU produk (lihat [Master Data Flow](alur-proses-master-data.md)).

POST `/api/stocks`
Buat data stok baru. Body: `product_id, location_id, qty, available_qty`.
`product_id` & `location_id` wajib diisi; kombinasi keduanya harus unik.

PUT `/api/stocks/:id`
Ubah data stok.

DELETE `/api/stocks/:id`
Hapus data stok.
