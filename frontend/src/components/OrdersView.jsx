import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  User, 
  CreditCard,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';
import { useDashboard } from '../context/DashboardContext';

export default function OrdersView() {
  const { recentOrders, refreshDashboard } = useDashboard();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // New Order Modal State
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('Aarav Sharma');
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders(50, 0, statusFilter || null);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    api.getProducts().then(setProducts).catch(console.error);
  }, [statusFilter]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return;
    setSubmitting(true);
    try {
      await api.createOrder({
        customer_id: 1, // Aarav Sharma
        payment_method: "Credit Card / UPI",
        items: [{ product_id: parseInt(selectedProductId, 10), quantity: parseInt(quantity, 10) }]
      });
      setShowModal(false);
      setSelectedProductId('');
      setQuantity(1);
      await loadOrders();
      refreshDashboard();
    } catch (err) {
      console.error("Order creation failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-400" />
            <span>Orders & Transaction Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete database transaction logs with item breakdowns and payment statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase text-slate-400">
            <tr>
              <th className="py-3.5 px-4">Order ID</th>
              <th className="py-3.5 px-3">Customer</th>
              <th className="py-3.5 px-3">Date & Time</th>
              <th className="py-3.5 px-3 text-center">Status</th>
              <th className="py-3.5 px-3 text-right">Items</th>
              <th className="py-3.5 px-3 text-right">Profit</th>
              <th className="py-3.5 px-4 text-right">Total Amount</th>
              <th className="py-3.5 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                  Loading order records...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const isExpanded = expandedOrderId === o.id;
                const d = new Date(o.created_at);
                return (
                  <React.Fragment key={o.id}>
                    <tr 
                      onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                      className="hover:bg-slate-800/30 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-400">
                        {o.order_number}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-200">
                        {o.customer_name}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {d.toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                        {o.items ? o.items.length : 1}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-emerald-400">
                        +₹{o.profit_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        ₹{o.total_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-2 text-slate-400">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </td>
                    </tr>

                    {/* Expanded Items Drawer */}
                    {isExpanded && o.items && (
                      <tr className="bg-slate-950/80">
                        <td colSpan={8} className="p-4">
                          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-2">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              Order Line Items & Unit Costs:
                            </div>
                            <div className="divide-y divide-slate-800/60">
                              {o.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-1.5 text-xs">
                                  <div className="text-slate-200">
                                    {item.product_name || `Product #${item.product_id}`}
                                    <span className="text-slate-400 ml-2">× {item.quantity}</span>
                                  </div>
                                  <div className="font-mono text-slate-300">
                                    ₹{item.subtotal.toLocaleString('en-IN')}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="pt-2 flex justify-between text-xs text-slate-400 border-t border-slate-800">
                              <span>Payment Gateway: {o.payment_method}</span>
                              <span className="text-emerald-400">Profit: ₹{o.profit_amount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white">Place Live Real Order</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Customer Account</label>
                <input
                  type="text"
                  value={customerName}
                  disabled
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ₹{p.price.toLocaleString('en-IN')} ({p.stock_quantity} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm & Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

