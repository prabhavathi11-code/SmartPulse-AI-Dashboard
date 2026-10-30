import React from 'react';
import { 
  IndianRupee, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function KPICards() {
  const { kpis, loading } = useDashboard();

  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse p-5" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: `₹${kpis.total_revenue.toLocaleString('en-IN')}`,
      change: `+${kpis.revenue_growth_pct}%`,
      positive: kpis.revenue_growth_pct >= 0,
      subtext: 'vs previous period',
      icon: IndianRupee,
      color: 'from-blue-500/20 to-indigo-500/10',
      iconColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/20'
    },
    {
      title: 'Total Orders',
      value: kpis.total_orders.toLocaleString('en-IN'),
      change: '+8.4%',
      positive: true,
      subtext: `AOV: ₹${Math.round(kpis.avg_order_value).toLocaleString('en-IN')}`,
      icon: ShoppingCart,
      color: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Gross Profit',
      value: `₹${kpis.total_profit.toLocaleString('en-IN')}`,
      change: `${kpis.profit_margin}%`,
      positive: true,
      subtext: 'Net profit margin',
      icon: TrendingUp,
      color: 'from-purple-500/20 to-violet-500/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Active Customers',
      value: kpis.total_customers.toLocaleString('en-IN'),
      change: kpis.low_stock_count > 0 ? `${kpis.low_stock_count} Low Stock` : 'Healthy Stock',
      positive: kpis.low_stock_count === 0,
      subtext: 'Across all segments',
      icon: Users,
      color: 'from-amber-500/20 to-orange-500/10',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-xl border ${card.borderColor} bg-slate-900/60 p-5 backdrop-blur-sm transition duration-200 hover:border-slate-700 hover:shadow-lg`}
          >
            {/* Top Glow Accent */}
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${card.color} blur-2xl pointer-events-none`} />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{card.title}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 ${card.iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold tracking-tight text-white font-mono">
                {card.value}
              </h3>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs">
              <div className={`flex items-center font-medium ${card.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {card.positive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 mr-0.5" />
                )}
                <span>{card.change}</span>
              </div>
              <span className="text-slate-400">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

