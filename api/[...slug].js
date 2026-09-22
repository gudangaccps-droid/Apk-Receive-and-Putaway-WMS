// Membungkus Express app backend sebagai satu Vercel Serverless Function
// yang menangani semua request /api/* (catch-all lewat nama file [...slug]).
// Ini membuat frontend + backend jadi satu deployment Vercel, tanpa perlu
// hosting backend terpisah — frontend cukup memanggil path relatif /api/...
module.exports = require('../backend/src/app');
