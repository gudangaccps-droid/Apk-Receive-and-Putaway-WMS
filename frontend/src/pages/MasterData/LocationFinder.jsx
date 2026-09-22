import { useEffect, useRef, useState } from 'react';
import api from '../../api/client';

export default function LocationFinder() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const search = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.get('/stocks/find', { params: { code: trimmed } });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Produk tidak ditemukan.');
    } finally {
      setLoading(false);
      setCode('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="page">
      <h1>Cari Lokasi</h1>
      <p className="page-hint">
        Scan barcode produk (atau ketik SKU Code lalu tekan Enter) untuk menemukan lokasi raknya.
      </p>

      <form className="form-row" onSubmit={search}>
        <div className="field span2">
          <label>Barcode / SKU Code</label>
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            placeholder="Scan atau ketik di sini..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="field field-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Mencari...' : 'Cari'}
          </button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="panel-result">
          <div className="result-row">
            <span className="result-label">Product</span>
            <span className="result-value">
              {result.product.product_name}
              {result.product.sku_code ? ` (${result.product.sku_code})` : ''}
            </span>
          </div>

          {result.locations.length === 0 ? (
            <p className="empty">Belum ada stok tercatat untuk produk ini di lokasi manapun.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Qty</th>
                  <th>Qty Tersedia</th>
                </tr>
              </thead>
              <tbody>
                {result.locations.map((loc, i) => (
                  <tr key={i}>
                    <td className="mono">{loc.location_code}</td>
                    <td>
                      {loc.qty} {result.product.uom || ''}
                    </td>
                    <td>
                      {loc.available_qty} {result.product.uom || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
