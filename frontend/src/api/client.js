import axios from 'axios';

// Tanpa VITE_API_URL: di `npm run dev` asumsikan backend terpisah di :4000
// (dev lokal tanpa Docker); di build produksi (mis. Vercel) asumsikan
// backend dan frontend satu origin (serverless function di /api), jadi
// path relatif sudah cukup.
const fallback = import.meta.env.DEV ? 'http://localhost:4000/api' : '/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || fallback,
});

export default api;
