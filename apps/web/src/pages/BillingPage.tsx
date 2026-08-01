import { useMemo, useState } from 'react';

type CartLine = {
  barcode: string;
  name: string;
  quantity: number;
  price: number;
  taxRate: number;
  discount: number;
};

export const BillingPage = () => {
  const [barcode, setBarcode] = useState('');
  const [customerDiscount, setCustomerDiscount] = useState(0);
  const [lines, setLines] = useState<CartLine[]>([]);

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
    const itemDiscount = lines.reduce((sum, line) => sum + line.discount, 0);
    const afterCustomerDiscount = subtotal - itemDiscount - customerDiscount;
    const tax = lines.reduce((sum, line) => sum + (line.quantity * line.price - line.discount) * (line.taxRate / 100), 0);
    const total = afterCustomerDiscount + tax;
    return { subtotal, itemDiscount, tax, total: Math.max(total, 0) };
  }, [lines, customerDiscount]);

  const addPlaceholderLine = () => {
    if (!barcode.trim()) return;
    setLines((current) => [
      {
        barcode,
        name: `Scanned Item ${current.length + 1}`,
        quantity: 1,
        price: 799,
        taxRate: 5,
        discount: 0
      },
      ...current
    ]);
    setBarcode('');
  };

  return (
    <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
      <article className="space-y-3 rounded bg-white p-3 shadow">
        <div>
          <label htmlFor="billing-scan" className="block text-xs text-slate-500">
            Barcode scan input
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="billing-scan"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addPlaceholderLine();
                }
              }}
              className="w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Scan barcode"
            />
            <button onClick={addPlaceholderLine} className="rounded bg-slate-900 px-3 py-2 text-white">
              Add
            </button>
          </div>
        </div>

        <ul className="space-y-2 text-sm">
          {lines.map((line, index) => (
            <li key={`${line.barcode}-${index}`} className="rounded border border-slate-200 p-2">
              <div className="flex justify-between font-medium">
                <span>{line.name}</span>
                <span>₹{(line.quantity * line.price).toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-500">{line.barcode}</p>
            </li>
          ))}
        </ul>
      </article>

      <aside className="space-y-2 rounded bg-white p-3 shadow">
        <h2 className="font-semibold">Bill Summary</h2>
        <label className="block text-xs text-slate-500" htmlFor="customer-discount">
          Customer Discount
        </label>
        <input
          id="customer-discount"
          type="number"
          min={0}
          value={customerDiscount}
          onChange={(event) => setCustomerDiscount(Number(event.target.value) || 0)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
        <div className="space-y-1 text-sm">
          <p>Subtotal: ₹{totals.subtotal.toFixed(2)}</p>
          <p>Item Discount: ₹{totals.itemDiscount.toFixed(2)}</p>
          <p>Tax: ₹{totals.tax.toFixed(2)}</p>
          <p className="font-semibold">Total: ₹{totals.total.toFixed(2)}</p>
        </div>
      </aside>
    </section>
  );
};
