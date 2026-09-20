import { NavLink, Outlet } from 'react-router-dom';

const MODULES = [
  { path: '/master-data', label: 'Master Data', status: 'Development' },
  { path: '/receiving-putaway', label: 'Receiving & Putaway', status: 'Planned' },
  { path: '/inventory', label: 'Inventory Management', status: 'Planned' },
  { path: '/picking', label: 'Picking', status: 'Planned' },
  { path: '/cycle-count', label: 'Cycle Count', status: 'Planned' },
  { path: '/dashboard', label: 'Dashboard', status: 'Planned' },
];

export default function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">ACC</div>
          <div>
            <h2>WMS Gudang ACC</h2>
            <p>Aksesoris Partshop</p>
          </div>
        </div>
        <nav>
          {MODULES.map((m) => (
            <NavLink key={m.path} to={m.path} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span>{m.label}</span>
              <small className={`status-tag ${m.status.toLowerCase()}`}>{m.status}</small>
            </NavLink>
          ))}
        </nav>
        <div className="principle">
          "Barang harus ditemukan berdasarkan data, bukan berdasarkan ingatan manusia."
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
