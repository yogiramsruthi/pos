import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { db } from '../offline/db';
import type { InventoryProduct } from '../types';

export const InventoryPage = () => {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get<InventoryProduct[]>('/inventory/products');
        setProducts(response.data);
        await db.inventory.bulkPut(response.data);
      } catch {
        setProducts(await db.inventory.toArray());
      }
    };

    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => {
      const productMatch = product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q);
      const variantMatch = product.variants.some(
        (variant) => variant.barcode.toLowerCase().includes(q) || variant.colorLabel.toLowerCase().includes(q)
      );
      return productMatch || variantMatch;
    });
  }, [products, query]);

  return (
    <section className="space-y-3">
      <div className="rounded bg-white p-3 shadow">
        <label className="block text-xs text-slate-500" htmlFor="scan-search">
          Scan barcode or search
        </label>
        <input
          id="scan-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Type barcode / product"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((product) => (
          <article key={product.id} className="rounded bg-white p-3 shadow">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm text-slate-500">SKU: {product.sku}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {product.variants.map((variant) => (
                <li key={variant.id}>
                  {variant.sizeLabel}/{variant.colorLabel} - ₹{variant.sellingPrice} - Stock:{' '}
                  {variant.stocks.reduce((sum, stock) => sum + stock.quantityOnHand, 0)} - {variant.barcode}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};
