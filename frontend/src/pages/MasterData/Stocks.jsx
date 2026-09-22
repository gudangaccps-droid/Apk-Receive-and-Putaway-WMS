import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Stocks() {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/stocks'), api.get('/products'), api.get('/locations')])
      .then(([stockRes, prodRes, locRes]) => {
        setRows(stockRes.data);
        setProducts(prodRes.data);
        setLocations(locRes.data);
      })
      .catch(() => setError('Gagal memuat data.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm({});
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/stocks/${editingId}`, form);
      } else {
        await api.post('/stocks', form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data.');
    }
  };

  const edit = (row) => {
    setEditingId(row.id);
    setForm({
      product_id: row.product_id,
      location_id: row.location_id,
      qty: row.qty,
      available_qty: row.available_qty,
    });
  };

  const remove = async (id) => {
    if (!confirm('Hapus data stok ini?')) return;
    try {
      await api.delete(`/stocks/${id}`);
      load();
    } catch {
      setError('Gagal menghapus data.');
    }
  };

  return (
    <div className="page">
      <h1>Master Stock</h1>

      <form className="form-row" onSubmit={submit}>
        <div className="field span2">
          <label>Produk</label>
          <select
            required
            value={form.product_id ?? ''}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
          >
            <option value="">- pilih produk -</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku_code} · {p.product_name}
              </option>
            ))}
          </select>
        </div>
        <div className="field span2">
          <label>Lokasi</label>
          <select
            required
            value={form.location_id ?? ''}
            onChange={(e) => setForm({ ...form, location_id: e.target.value })}
          >
            <option value="">- pilih lokasi -</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.code}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Qty</label>
          <input
            type="number"
            min="0"
            step="any"
            value={form.qty ?? ''}
            onChange={(e) => setForm({ ...form, qty: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Qty Tersedia</label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="default = Qty"
            value={form.available_qty ?? ''}
            onChange={(e) => setForm({ ...form, available_qty: e.target.value })}
          />
        </div>
        <div className="field field-actions">
          <button type="submit">{editingId ? 'Simpan Perubahan' : 'Tambah'}</button>
          {editingId && (
            <button type="button" className="ghost" onClick={resetForm}>
              Batal
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Memuat...</p>
      ) : rows.length === 0 ? (
        <p className="empty">Belum ada data stok.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>SKU Code</th>
              <th>Produk</th>
              <th>Lokasi</th>
              <th>Qty</th>
              <th>Qty Tersedia</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="mono">{row.sku_code}</td>
                <td>{row.product_name}</td>
                <td className="mono">{row.location_code}</td>
                <td>
                  {row.qty} {row.uom || ''}
                </td>
                <td>
                  {row.available_qty} {row.uom || ''}
                </td>
                <td className="row-actions">
                  <button onClick={() => edit(row)}>Edit</button>
                  <button className="danger" onClick={() => remove(row.id)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
