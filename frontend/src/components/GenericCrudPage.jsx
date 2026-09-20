import { useEffect, useState } from 'react';
import api from '../api/client';

/**
 * Halaman CRUD generik untuk tabel master data sederhana (tanpa relasi).
 * `fields` = [{ name, label, required }]
 */
export default function GenericCrudPage({ title, endpoint, fields }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get(endpoint)
      .then((res) => setRows(res.data))
      .catch(() => setError('Gagal memuat data.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [endpoint]);

  const resetForm = () => {
    setForm({});
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, form);
      } else {
        await api.post(endpoint, form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data.');
    }
  };

  const edit = (row) => {
    setEditingId(row.id);
    const f = {};
    fields.forEach((fld) => (f[fld.name] = row[fld.name] ?? ''));
    setForm(f);
  };

  const remove = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      load();
    } catch {
      setError('Gagal menghapus data (mungkin masih dipakai data lain).');
    }
  };

  return (
    <div className="page">
      <h1>{title}</h1>

      <form className="form-row" onSubmit={submit}>
        {fields.map((f) => (
          <div className="field" key={f.name}>
            <label>{f.label}</label>
            <input
              type="text"
              value={form[f.name] ?? ''}
              required={f.required}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            />
          </div>
        ))}
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
        <p className="empty">Belum ada data.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {fields.map((f) => (
                <th key={f.name}>{f.label}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {fields.map((f) => (
                  <td key={f.name}>{row[f.name]}</td>
                ))}
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
