import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function MasterUser() {
  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ status: 'ACTIVE' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/users'), api.get('/users/roles')])
      .then(([userRes, roleRes]) => {
        setRows(userRes.data);
        setRoles(roleRes.data);
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
        await api.put(`/users/${editingId}`, form);
      } else {
        await api.post('/users', form);
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
      username: row.username || '',
      full_name: row.full_name || '',
      role: row.role || '',
      status: row.status || 'ACTIVE',
    });
  };

  const remove = async (id) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch {
      setError('Gagal menghapus data.');
    }
  };

  const permissionsFor = (role) => roles.find((r) => r.role === role)?.permissions?.join(', ') || '-';

  return (
    <div className="page">
      <h1>Master User</h1>

      <form className="form-row" onSubmit={submit}>
        <div className="field">
          <label>Username</label>
          <input
            type="text"
            required
            value={form.username ?? ''}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div className="field span2">
          <label>Nama Lengkap</label>
          <input
            type="text"
            required
            value={form.full_name ?? ''}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Role</label>
          <select required value={form.role ?? ''} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="">- pilih role -</option>
            {roles.map((r) => (
              <option key={r.role} value={r.role}>
                {r.role}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select value={form.status ?? 'ACTIVE'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
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

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Memuat...</p>
      ) : rows.length === 0 ? (
        <p className="empty">Belum ada user.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Nama Lengkap</th>
              <th>Role</th>
              <th>Hak Akses</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="mono">{row.username}</td>
                <td>{row.full_name}</td>
                <td>{row.role}</td>
                <td>{permissionsFor(row.role)}</td>
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
