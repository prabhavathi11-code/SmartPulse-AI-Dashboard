import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function CategoryPieChart() {
  const { categoryData } = useDashboard();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Revenue by Category</h3>
          <p className="text-xs text-slate-400 mt-0.5">Product segment sales distribution</p>
        </div>
        <div className="rounded-lg bg-slate-800 p-1.5 text-slate-400">
          <PieIcon className="h-4 w-4" />
        </div>
      </div>

      <div className="h-64 w-full">
        {categoryData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No category distribution data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px'
                }}
                formatter={(val, name, item) => [
                  `₹${Number(val).toLocaleString('en-IN')} (${item.payload.percentage}%)`,
                  name
                ]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Breakdown list */}
      <div className="mt-2 space-y-1.5 border-t border-slate-800/80 pt-3">
        {categoryData.slice(0, 3).map((cat, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="text-slate-300">{cat.category}</span>
            </div>
            <span className="font-mono text-slate-400">₹{cat.revenue.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

