import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/billing', label: 'Billing' }
];

export const Layout = () => (
  <div className="min-h-screen bg-slate-100 text-slate-900">
    <header className="bg-slate-900 px-4 py-3 text-white">
      <h1 className="text-lg font-semibold">Garment POS</h1>
    </header>
    <nav className="flex gap-2 bg-white p-2 shadow">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
    <main className="p-4">
      <Outlet />
    </main>
  </div>
);
