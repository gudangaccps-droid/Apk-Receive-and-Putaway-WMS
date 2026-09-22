import { useEffect, useState } from 'react';
import api from '../../api/client';
import ImportCsvButton from '../../components/ImportCsvButton';

export default function Locations() {
  const [rows, setRows] = useState([]);
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({ status: 'ACTIVE' });
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
    setForm({ status: 'ACTIVE' });
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
      location_code: row.location_code || '',
      area: row.area || '',
      group_code: row.group_code || '',
      rack: row.rack || '',
      shelf: row.shelf || '',
      position: row.position || '',
      description: row.description || '',
      status: row.status || 'ACTIVE',
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
      <h1>Master Location</h1>

      <form className="form-row" onSubmit={submit}>
        <div className="field">
          <label>Kode Lokasi</label>
          <input
            type="text"
            placeholder="mis. A-CHR-R01-B01-P01"
            required
            value={form.location_code ?? ''}
            onChange={(e) => setForm({ ...form, location_code: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Area</label>
          <input
            type="text"
            list="area-options"
            placeholder="mis. A"
            value={form.area ?? ''}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
          <datalist id="area-options">
            {zones.map((z) => (
              <option key={z.id} value={z.code} />
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
          <label>Rack</label>
          <input type="text" value={form.rack ?? ''} onChange={(e) => setForm({ ...form, rack: e.target.value })} />
        </div>
        <div className="field">
          <label>Shelf</label>
          <input type="text" value={form.shelf ?? ''} onChange={(e) => setForm({ ...form, shelf: e.target.value })} />
        </div>
        <div className="field">
          <label>Position</label>
          <input
            type="text"
            value={form.position ?? ''}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Status</label>
          <select value={form.status ?? 'ACTIVE'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <div className="field span2">
          <label>Deskripsi</label>
          <input
            type="text"
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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

      <div className="toolbar">
        <ImportCsvButton
          endpoint="/locations/import"
          onDone={load}
          templateHint="Kolom: location_code, area, group_code, rack, shelf, position, description"
        />
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Memuat...</p>
      ) : rows.length === 0 ? (
        <p className="empty">Belum ada lokasi.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Kode Lokasi</th>
              <th>Area</th>
              <th>Group</th>
              <th>Rack</th>
              <th>Shelf</th>
              <th>Position</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="mono">{row.location_code}</td>
                <td>{row.area || '-'}</td>
                <td>{row.group_code || '-'}</td>
                <td>{row.rack || '-'}</td>
                <td>{row.shelf || '-'}</td>
                <td>{row.position || '-'}</td>
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
