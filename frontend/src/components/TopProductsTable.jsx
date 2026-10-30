import React from 'react';
import { Award, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function TopProductsTable() {
  const { topProducts } = useDashboard();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Top-Grossing Products</h3>
          <p className="text-xs text-slate-400 mt-0.5">Ranked by overall sales revenue & volume</p>
        </div>
        <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
          <Award className="h-4 w-4" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
            <tr>
              <th className="pb-3 pl-1">Product</th>
              <th className="pb-3 text-center">Category</th>
              <th className="pb-3 text-right">Units</th>
              <th className="pb-3 text-right">Revenue</th>
              <th className="pb-3 text-right pr-1">Stock Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {topProducts.map((p, idx) => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3 pl-1">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-medium text-slate-200">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">₹{p.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                    {p.category}
                  </span>
                </td>
                <td className="py-3 text-right font-mono text-slate-300">
                  {p.units_sold}
                </td>
                <td className="py-3 text-right font-mono font-medium text-slate-100">
                  ₹{p.total_revenue.toLocaleString('en-IN')}
                </td>
                <td className="py-3 text-right pr-1">
                  {p.is_low_stock ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                      <AlertTriangle className="h-3 w-3" />
                      {p.stock_quantity} left
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      {p.stock_quantity} in stock
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

