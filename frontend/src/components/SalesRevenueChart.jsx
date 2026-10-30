import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function SalesRevenueChart() {
  const { salesTrend, dateRange } = useDashboard();
  const [chartMode, setChartMode] = useState('revenue'); // 'revenue' or 'orders'

  // Format date for X-Axis (e.g., '14 Oct')
  const formattedData = salesTrend.map(d => {
    const parts = d.date.split('-');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return {
      ...d,
      formattedDate: `${day} ${monthNames[m] || ''}`
    };
  });

  const totalPeriodRevenue = salesTrend.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">Revenue & Sales Performance</h3>
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
              {dateRange.toUpperCase()} View
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Revenue: <span className="text-slate-200 font-mono font-medium">₹{totalPeriodRevenue.toLocaleString('en-IN')}</span> across selected timeline
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setChartMode('revenue')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              chartMode === 'revenue'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Revenue & Profit
          </button>
          <button
            onClick={() => setChartMode('orders')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              chartMode === 'orders'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Orders Volume
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        {formattedData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No sales records available for this date window.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => chartMode === 'revenue' ? `₹${(val/1000).toFixed(0)}k` : val}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(val, name) => {
                  if (name === 'revenue') return [`₹${val.toLocaleString('en-IN')}`, 'Daily Revenue'];
                  if (name === 'profit') return [`₹${val.toLocaleString('en-IN')}`, 'Gross Profit'];
                  if (name === 'orders') return [`${val} orders`, 'Orders Placed'];
                  return [val, name];
                }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              {chartMode === 'revenue' ? (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#revGradient)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="Profit" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </>
              ) : (
                <Bar 
                  dataKey="orders" 
                  name="Orders" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]} 
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

