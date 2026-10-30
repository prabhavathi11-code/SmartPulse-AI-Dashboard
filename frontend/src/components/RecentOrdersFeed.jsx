import React from 'react';
import { ShoppingBag, Clock, ArrowRight, User } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function RecentOrdersFeed({ onViewAllOrders }) {
  const { recentOrders } = useDashboard();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">Live Orders & Activity</h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time incoming business transactions</p>
        </div>
        {onViewAllOrders && (
          <button
            onClick={onViewAllOrders}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {recentOrders.slice(0, 6).map((order) => {
          const date = new Date(order.created_at);
          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

          return (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 hover:border-slate-700/80 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-200">
                      {order.order_number}
                    </span>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-medium text-emerald-400">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <User className="h-3 w-3 text-slate-400" />
                    <span>{order.customer_name}</span>
                    <span className="text-slate-400">•</span>
                    <span>{order.payment_method}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-xs font-bold text-slate-100">
                  ₹{order.total_amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{dateStr}, {timeStr}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

