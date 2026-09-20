import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Products() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/products', { params: search ? { q: search } : {} }),
      api.get('/categories'),
      api.get('/units'),
    ])
      .then(([prodRes, catRes, unitRes]) => {
        setRows(prodRes.data);
        setCategories(catRes.data);
        setUnits(unitRes.data);
      })
      .catch(() => setError('Gagal memuat data.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search]);

  const resetForm = () => {
    setForm({});
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post('/products', form);
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
      sku: row.sku || '',
      name: row.name || '',
      variant: row.variant || '',
      category_id: row.category_id || '',
      unit_id: row.unit_id || '',
      barcode: row.barcode || '',
      min_stock: row.min_stock || 0,
    });
  };

  const remove = async (id) => {
    if (!confirm('Hapus produk ini?')) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch {
      setError('Gagal menghapus data (mungkin masih dipakai data lain).');
    }
  };

  return (
    <div className="page">
      <h1>Produk / SKU</h1>

      <form className="form-row" onSubmit={submit}>
        <div className="field">
          <label>SKU</label>
          <input type="text" required value={form.sku ?? ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </div>
        <div className="field span2">
          <label>Nama Barang</label>
          <input type="text" required value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Varian</label>
          <input type="text" value={form.variant ?? ''} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
        </div>
        <div className="field">
          <label>Kategori</label>
          <select value={form.category_id ?? ''} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">- pilih -</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Satuan</label>
          <select value={form.unit_id ?? ''} onChange={(e) => setForm({ ...form, unit_id: e.target.value })}>
            <option value="">- pilih -</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.code}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Barcode</label>
          <input type="text" value={form.barcode ?? ''} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
        </div>
        <div className="field">
          <label>Stok Minimum</label>
          <input
            type="number"
            min="0"
            value={form.min_stock ?? 0}
            onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
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

      <input
        type="text"
        className="search-box"
        placeholder="Cari SKU atau nama barang..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Memuat...</p>
      ) : rows.length === 0 ? (
        <p className="empty">Belum ada produk.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nama / Varian</th>
              <th>Kategori</th>
              <th>Satuan</th>
              <th>Stok Min</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="mono">{row.sku}</td>
                <td>
                  {row.name}
                  {row.variant ? ` · ${row.variant}` : ''}
                </td>
                <td>{row.category_name || '-'}</td>
                <td>{row.unit_code || '-'}</td>
                <td>{row.min_stock}</td>
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
