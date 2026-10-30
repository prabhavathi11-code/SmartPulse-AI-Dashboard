import React from 'react';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Zap, 
  X, 
  Package,
  ArrowRight 
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function AlertsBanner({ onNavigateInventory }) {
  const { liveToast, setLiveToast, anomalies } = useDashboard();

  return (
    <div className="space-y-3">
      {/* Real-time WebSocket Live Order Toast Notification */}
      {liveToast && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 relative flex items-center justify-between rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 p-4 shadow-xl shadow-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-emerald-400">{liveToast.title}</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300">
                  {liveToast.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">{liveToast.message}</p>
              {liveToast.alerts && liveToast.alerts.length > 0 && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-400">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>{liveToast.alerts[0]}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setLiveToast(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Critical Business Anomalies & Low Stock Warnings */}
      {anomalies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {anomalies.slice(0, 3).map((anom) => {
            const isHigh = anom.severity === 'high';
            const isLowStock = anom.type === 'low_stock';
            return (
              <div
                key={anom.id}
                className={`flex items-start justify-between rounded-xl border p-3.5 backdrop-blur-sm transition ${
                  isHigh 
                    ? 'border-rose-500/30 bg-rose-950/20 text-rose-200' 
                    : 'border-amber-500/30 bg-amber-950/20 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isHigh ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {isLowStock ? <Package className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{anom.title}</span>
                      <span className={`rounded px-1.5 py-0.2 text-[9px] uppercase font-bold ${
                        isHigh ? 'bg-rose-500/30 text-rose-300' : 'bg-amber-500/30 text-amber-300'
                      }`}>
                        {anom.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {anom.message}
                    </p>
                    <div className="mt-2 text-[10px] text-indigo-300 font-medium">
                      💡 {anom.recommended_action}
                    </div>
                  </div>
                </div>

                {isLowStock && onNavigateInventory && (
                  <button
                    onClick={onNavigateInventory}
                    className="shrink-0 p-1 text-slate-400 hover:text-white transition"
                    title="Go to Inventory to Restock"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
