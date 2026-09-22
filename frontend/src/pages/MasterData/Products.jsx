import { useEffect, useState } from 'react';
import api from '../../api/client';
import ImportCsvButton from '../../components/ImportCsvButton';

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
    setForm({ status: 'ACTIVE' });
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
      barcode: row.barcode || '',
      sku_code: row.sku_code || '',
      product_name: row.product_name || '',
      brand: row.brand || '',
      category: row.category || '',
      group_code: row.group_code || '',
      uom: row.uom || '',
      status: row.status || 'ACTIVE',
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
      <h1>Master Product</h1>

      <form className="form-row" onSubmit={submit}>
        <div className="field">
          <label>Barcode</label>
          <input
            type="text"
            placeholder="mis. 194644167882"
            value={form.barcode ?? ''}
            onChange={(e) => setForm({ ...form, barcode: e.target.value })}
          />
        </div>
        <div className="field">
          <label>SKU Code</label>
          <input
            type="text"
            required
            value={form.sku_code ?? ''}
            onChange={(e) => setForm({ ...form, sku_code: e.target.value })}
          />
        </div>
        <div className="field span2">
          <label>Nama Produk</label>
          <input
            type="text"
            required
            placeholder="mis. Anker Charger 20W"
            value={form.product_name ?? ''}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Brand</label>
          <input type="text" value={form.brand ?? ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </div>
        <div className="field">
          <label>Kategori</label>
          <input
            type="text"
            list="category-options"
            value={form.category ?? ''}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label>Kode Group</label>
          <input
            type="text"
            placeholder="mis. CHR"
            value={form.group_code ?? ''}
            onChange={(e) => setForm({ ...form, group_code: e.target.value })}
          />
        </div>
        <div className="field">
          <label>UOM</label>
          <input
            type="text"
            list="uom-options"
            placeholder="mis. PCS"
            value={form.uom ?? ''}
            onChange={(e) => setForm({ ...form, uom: e.target.value })}
          />
          <datalist id="uom-options">
            {units.map((u) => (
              <option key={u.id} value={u.code} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label>Status</label>
          <select value={form.status ?? 'ACTIVE'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="DISCONTINUED">DISCONTINUED</option>
          </select>
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

      <div className="toolbar">
        <input
          type="text"
          className="search-box"
          placeholder="Cari barcode, SKU Code, atau nama produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ImportCsvButton
          endpoint="/products/import"
          onDone={load}
          templateHint="Kolom: barcode, sku_code, product_name, brand, category, group_code, uom, status"
        />
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Memuat...</p>
      ) : rows.length === 0 ? (
        <p className="empty">Belum ada produk.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Barcode</th>
              <th>SKU Code</th>
              <th>Nama Produk</th>
              <th>Brand</th>
              <th>Kategori</th>
              <th>Group</th>
              <th>UOM</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="mono">{row.barcode || '-'}</td>
                <td className="mono">{row.sku_code}</td>
                <td>{row.product_name}</td>
                <td>{row.brand || '-'}</td>
                <td>{row.category || '-'}</td>
                <td>{row.group_code || '-'}</td>
                <td>{row.uom || '-'}</td>
                <td>{row.status}</td>
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
