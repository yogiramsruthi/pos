import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { db } from '../offline/db';
import type { DashboardData } from '../types';

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get<DashboardData>('/reports/dashboard');
        setData(response.data);
        setOffline(false);
        await db.dashboard.put({ id: 'latest', payload: response.data, updatedAt: new Date().toISOString() });
      } catch {
        const cached = await db.dashboard.get('latest');
        if (cached) {
          setData(cached.payload);
          setOffline(true);
        }
      }
    };

    void load();
  }, []);

  if (!data) {
    return <p className="text-sm text-slate-600">Loading dashboard...</p>;
  }

  return (
    <section className="space-y-4">
      {offline && <p className="rounded bg-amber-100 px-3 py-2 text-sm text-amber-800">Offline mode: showing cached data.</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <article className="rounded bg-white p-4 shadow">
          <h2 className="text-sm text-slate-500">Today's Sales</h2>
          <p className="text-xl font-bold">₹{data.todaysSales.toFixed(2)}</p>
        </article>
        <article className="rounded bg-white p-4 shadow">
          <h2 className="text-sm text-slate-500">Invoices</h2>
          <p className="text-xl font-bold">{data.todaysInvoices}</p>
        </article>
      </div>
      <article className="rounded bg-white p-4 shadow">
        <h3 className="mb-2 text-sm font-semibold">Low Stock Alerts</h3>
        <ul className="space-y-1 text-sm">
          {data.lowStock.map((entry) => (
            <li key={entry.id}>
              {entry.variant.product.name} ({entry.variant.sizeLabel}/{entry.variant.colorLabel}) - {entry.quantityOnHand} left at {entry.warehouse.name}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};
