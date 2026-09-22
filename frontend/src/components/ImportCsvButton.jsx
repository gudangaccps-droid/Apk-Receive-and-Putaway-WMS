import { useRef, useState } from 'react';
import api from '../api/client';

/**
 * Tombol "Import CSV" generik: upload file -> POST multipart ke `endpoint`,
 * tampilkan ringkasan hasil (berhasil/diperbarui/dilewati + daftar error).
 */
export default function ImportCsvButton({ endpoint, onDone, templateHint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Content-Type (dengan boundary) diset otomatis oleh browser saat body FormData.
      const res = await api.post(endpoint, formData);
      setResult(res.data);
      onDone?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengimpor file.');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <div className="import-csv">
      <button type="button" className="ghost" disabled={busy} onClick={() => inputRef.current.click()}>
        {busy ? 'Mengimpor...' : 'Import CSV'}
      </button>
      <input ref={inputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleFile} />
      {templateHint && <span className="hint">{templateHint}</span>}
      {error && <p className="error">{error}</p>}
      {result && (
        <p className="import-result">
          {result.inserted} baru, {result.updated} diperbarui, {result.skipped} dilewati dari {result.total} baris.
          {result.errors?.length > 0 && (
            <>
              {' '}
              <details>
                <summary>{result.errors.length} pesan</summary>
                <ul>
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </details>
            </>
          )}
        </p>
      )}
    </div>
  );
}
