import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  BrainCircuit, 
  FileSpreadsheet, 
  ShieldAlert,
  ChevronRight,
  Layers
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { anomalies } = useDashboard();
  const lowStockCount = anomalies.filter(a => a.type === 'low_stock').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Sales Analytics', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory Stock', icon: Package, badge: lowStockCount > 0 ? lowStockCount : null },
    { id: 'orders', label: 'Orders & Activity', icon: ShoppingCart },
    { id: 'ai-insights', label: 'AI Forecasting', icon: BrainCircuit, highlight: true },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-slate-100 text-base tracking-tight">SmartPulse</h1>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400">BI</span>
            </div>
            <p className="text-[11px] text-slate-400">Real-Time AI Dashboard</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300">
                    ML
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Tech Stack */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Engine Status</span>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            FastAPI + Scikit-Learn
          </div>
          <div className="mt-2 text-[10px] text-slate-400">
            SmartPulse v1.0 • Full-Stack BI
          </div>
        </div>
      </div>
    </aside>
  );
}

