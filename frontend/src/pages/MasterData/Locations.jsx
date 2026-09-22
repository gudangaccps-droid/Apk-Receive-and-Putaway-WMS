import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Locations() {
  const [rows, setRows] = useState([]);
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/locations'), api.get('/zones')])
      .then(([locRes, zoneRes]) => {
        setRows(locRes.data);
        setZones(zoneRes.data);
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
        await api.put(`/locations/${editingId}`, form);
      } else {
        await api.post('/locations', form);
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
      code: row.code || '',
      zone_id: row.zone_id || '',
      rack: row.rack || '',
      level: row.level || '',
      bin: row.bin || '',
      description: row.description || '',
    });
  };

  const remove = async (id) => {
    if (!confirm('Hapus lokasi ini?')) return;
    try {
      await api.delete(`/locations/${id}`);
      load();
    } catch {
      setError('Gagal menghapus data (mungkin masih dipakai data lain).');
    }
  };

  return (
    <div className="page">
      <h1>Lokasi Rak</h1>

      <form className="form-row" onSubmit={submit}>
        <div className="field">
          <label>Kode Lokasi</label>
          <input
            type="text"
            placeholder="mis. G2-F2-S03"
            required
            value={form.code ?? ''}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Zona</label>
          <select
            value={form.zone_id ?? ''}
            onChange={(e) => setForm({ ...form, zone_id: e.target.value })}
          >
            <option value="">- pilih zona -</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.code} · {z.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Rak</label>
          <input type="text" value={form.rack ?? ''} onChange={(e) => setForm({ ...form, rack: e.target.value })} />
        </div>
        <div className="field">
          <label>Level</label>
          <input type="text" value={form.level ?? ''} onChange={(e) => setForm({ ...form, level: e.target.value })} />
        </div>
        <div className="field">
          <label>Bin</label>
          <input type="text" value={form.bin ?? ''} onChange={(e) => setForm({ ...form, bin: e.target.value })} />
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
        <p className="empty">Belum ada lokasi.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Zona</th>
              <th>Rak</th>
              <th>Level</th>
              <th>Bin</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.code}</td>
                <td>{row.zone_code ? `${row.zone_code} · ${row.zone_name}` : '-'}</td>
                <td>{row.rack || '-'}</td>
                <td>{row.level || '-'}</td>
                <td>{row.bin || '-'}</td>
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
