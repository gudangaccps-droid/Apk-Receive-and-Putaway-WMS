import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import Categories from './Categories';
import Units from './Units';
import Suppliers from './Suppliers';
import Zones from './Zones';
import Locations from './Locations';
import Products from './Products';

const TABS = [
  { path: '/master-data/products', label: 'Produk / SKU' },
  { path: '/master-data/locations', label: 'Lokasi Rak' },
  { path: '/master-data/categories', label: 'Kategori' },
  { path: '/master-data/units', label: 'Satuan' },
  { path: '/master-data/suppliers', label: 'Supplier' },
  { path: '/master-data/zones', label: 'Zona' },
];

export default function MasterData() {
  return (
    <div>
      <nav className="subtabs">
        {TABS.map((t) => (
          <NavLink key={t.path} to={t.path} end className={({ isActive }) => (isActive ? 'active' : '')}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Routes>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<Products />} />
        <Route path="locations" element={<Locations />} />
        <Route path="categories" element={<Categories />} />
        <Route path="units" element={<Units />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="zones" element={<Zones />} />
      </Routes>
    </div>
  );
}
