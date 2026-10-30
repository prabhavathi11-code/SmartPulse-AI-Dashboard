import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Search, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function InventoryView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [restockingId, setRestockingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const prods = await api.getProducts(null, filterLowStock);
      setProducts(prods);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filterLowStock]);

  const handleRestock = async (productId, quantity = 25) => {
    setRestockingId(productId);
    try {
      await api.restockProduct(productId, quantity);
      await fetchProducts();
    } catch (err) {
      console.error("Restock failed:", err);
    } finally {
      setRestockingId(null);
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-400" />
            <span>Inventory Management & Restock Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor product stock thresholds in real time and trigger instant restocking actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              filterLowStock
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            {filterLowStock ? 'Showing Low Stock Only' : 'Filter Low Stock'}
          </button>

          <button
            onClick={fetchProducts}
            className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:text-white transition"
            title="Refresh Inventory"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by product name, category, or SKU..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase text-slate-400">
            <tr>
              <th className="py-3.5 px-4">Product & SKU</th>
              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-3 text-right">Selling Price</th>
              <th className="py-3.5 px-3 text-right">Cost Price</th>
              <th className="py-3.5 px-3 text-center">Safety Threshold</th>
              <th className="py-3.5 px-3 text-center">Stock Level</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                  Loading inventory items...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                  No matching products found.
                </td>
              </tr>
            ) : (
              filtered.map((prod) => {
                const isLow = prod.stock_quantity <= prod.min_stock_threshold;
                const isCritical = prod.stock_quantity <= 5;
                return (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{prod.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{prod.sku}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-200 font-medium">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                      ₹{prod.cost_price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                      {prod.min_stock_threshold} units
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {isLow ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isCritical 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          <AlertTriangle className="h-3 w-3" />
                          <span>{prod.stock_quantity} left</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>{prod.stock_quantity} units</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRestock(prod.id, 25)}
                        disabled={restockingId === prod.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition active:scale-95 disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />
                        <span>{restockingId === prod.id ? 'Restocking...' : '+25 Units'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

