-- Data awal minimal supaya dropdown Master Data tidak kosong.
INSERT INTO units (code, name) VALUES
  ('PCS', 'Pieces'),
  ('BOX', 'Box'),
  ('DUS', 'Dus'),
  ('KG', 'Kilogram')
ON CONFLICT (code) DO NOTHING;

INSERT INTO zones (code, name, description) VALUES
  ('HIJAU', 'Hijau', 'Stok siap, kondisi baik'),
  ('MERAH', 'Merah', 'Stok bermasalah / rusak'),
  ('NEW', 'Baru', 'Baru diterima, belum diverifikasi'),
  ('HOLD', 'Hold', 'Ditahan, menunggu keputusan')
ON CONFLICT (code) DO NOTHING;
