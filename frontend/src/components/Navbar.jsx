import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  Bell, 
  Sparkles, 
  Play, 
  Square, 
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function Navbar({ onOpenAI, onOpenNotifications }) {
  const { 
    wsConnected, 
    dateRange, 
    setDateRange, 
    triggerSimulation, 
    toggleAutoSimulator, 
    simulatorActive,
    notifications,
    refreshDashboard
  } = useDashboard();

  const [simulating, setSimulating] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSimulateClick = async () => {
    setSimulating(true);
    await triggerSimulation();
    setTimeout(() => setSimulating(false), 600);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-3.5 backdrop-blur-md">
      {/* Left: Search & Range Selector */}
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950/60 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 p-1">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: '7D' },
            { id: '30d', label: '30D' },
            { id: '90d', label: '90D' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setDateRange(opt.id)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-all ${
                dateRange === opt.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Real-time Controls & Indicators */}
      <div className="flex items-center gap-3">
        {/* WebSocket Real-time Pulse Badge */}
        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1 text-xs">
          <span className="relative flex h-2 w-2">
            {wsConnected ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
            )}
          </span>
          <span className={`font-medium ${wsConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {wsConnected ? 'Live Stream Active' : 'Connecting WS...'}
          </span>
        </div>

        {/* Manual Simulate Order Button (Crucial for live interview demonstrations) */}
        <button
          onClick={handleSimulateClick}
          disabled={simulating}
          className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 shadow-sm transition hover:bg-amber-500/20 active:scale-95 disabled:opacity-50"
          title="Simulate an order event to demonstrate real-time WebSocket update"
        >
          <Zap className={`h-3.5 w-3.5 ${simulating ? 'animate-bounce' : ''}`} />
          <span>{simulating ? 'Processing...' : '⚡ Simulate Order'}</span>
        </button>

        {/* Auto Simulator Toggle */}
        <button
          onClick={toggleAutoSimulator}
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            simulatorActive
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle periodic simulated traffic stream"
        >
          {simulatorActive ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
          <span>Auto-Stream {simulatorActive ? 'ON' : 'OFF'}</span>
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:opacity-95 active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Assistant</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Manual Refresh Button */}
        <button
          onClick={() => refreshDashboard()}
          className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
          title="Refresh Data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

