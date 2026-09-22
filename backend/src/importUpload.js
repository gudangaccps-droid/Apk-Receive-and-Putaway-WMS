const multer = require('multer');
const { parse } = require('csv-parse/sync');

// Batasi ukuran & tipe file supaya upload tidak disalahgunakan.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
      return cb(null, true);
    }
    cb(new Error('Hanya file .csv yang didukung'));
  },
});

function parseCsvBuffer(buffer) {
  return parse(buffer, {
    columns: (header) => header.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_')),
    skip_empty_lines: true,
    trim: true,
  });
}

module.exports = { upload, parseCsvBuffer };
