import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import MasterData from './pages/MasterData';
import ComingSoon from './pages/ComingSoon';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/master-data" replace />} />
        <Route path="master-data/*" element={<MasterData />} />
        <Route
          path="receiving-putaway"
          element={
            <ComingSoon
              title="Receiving & Putaway"
              description="Modul penerimaan barang dan penyusunan ke rak (FIFO) — segera hadir."
            />
          }
        />
        <Route
          path="inventory"
          element={
            <ComingSoon
              title="Inventory Management"
              description="Modul pemantauan stok real-time per lokasi — segera hadir."
            />
          }
        />
        <Route
          path="picking"
          element={<ComingSoon title="Picking" description="Modul pengambilan barang untuk pesanan — segera hadir." />}
        />
        <Route
          path="cycle-count"
          element={
            <ComingSoon
              title="Cycle Count"
              description="Modul penghitungan stok berkala untuk menjaga akurasi — segera hadir."
            />
          }
        />
        <Route
          path="dashboard"
          element={
            <ComingSoon title="Dashboard" description="Modul monitoring aktivitas gudang secara keseluruhan — segera hadir." />
          }
        />
        <Route path="*" element={<Navigate to="/master-data" replace />} />
      </Route>
    </Routes>
  );
}
