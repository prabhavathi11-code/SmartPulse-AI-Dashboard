import React from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  TrendingDown, 
  Sparkles, 
  ShoppingBag 
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { api } from '../services/api';

export default function NotificationsDrawer({ isOpen, onClose }) {
  const { notifications, refreshDashboard } = useDashboard();

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      refreshDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'anomaly':
        return <TrendingDown className="h-4 w-4 text-rose-400" />;
      case 'insight':
        return <Sparkles className="h-4 w-4 text-indigo-400" />;
      default:
        return <ShoppingBag className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="h-full w-full sm:w-96 flex flex-col border-l border-slate-800 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <Bell className="h-4 w-4 text-indigo-400" />
            <h3 className="font-semibold text-sm text-white">Notifications & Alerts</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="rounded p-1 text-slate-400 hover:text-slate-200 transition"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
          {notifications.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-slate-500">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((n) => {
              const date = new Date(n.created_at);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                    n.is_read
                      ? 'border-slate-800/60 bg-slate-900/30 text-slate-400'
                      : 'border-indigo-500/30 bg-slate-900/80 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-xs text-white">{n.title}</div>
                    <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">{n.message}</p>
                    <div className="mt-2 text-[10px] text-slate-500">
                      {dateStr} at {timeStr}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

