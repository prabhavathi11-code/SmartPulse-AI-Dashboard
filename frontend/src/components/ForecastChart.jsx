import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Target, 
  BarChart2, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

export default function ForecastChart() {
  const [forecastDays, setForecastDays] = useState(14);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getSalesForecast(forecastDays)
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [forecastDays]);

  if (loading || !data) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="h-10 w-10 rounded-lg bg-slate-800" />
          <div className="space-y-2">
            <div className="h-4 w-48 rounded bg-slate-800" />
            <div className="h-3 w-32 rounded bg-slate-800" />
          </div>
        </div>
        <div className="mt-6 h-64 rounded-lg bg-slate-800/40 animate-pulse" />
      </div>
    );
  }

  // Format dates for chart
  const chartData = data.timeline.map(pt => {
    const parts = pt.date.split('-');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return {
      ...pt,
      formattedDate: `${day} ${monthNames[m] || ''}`,
      confidenceRange: pt.is_forecast && pt.upper_bound && pt.lower_bound ? [pt.lower_bound, pt.upper_bound] : null
    };
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">AI Sales Forecasting Engine</h2>
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                  Scikit-Learn ML
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Time-series projection combining polynomial trend analysis, day-of-week seasonality, and confidence intervals.
              </p>
            </div>
          </div>

          {/* Forecast Days Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <span className="px-2.5 text-xs text-slate-400">Horizon:</span>
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => setForecastDays(days)}
                className={`rounded px-3 py-1 text-xs font-medium transition ${
                  forecastDays === days
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Model Metrics Row */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-5">
          <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/60">
            <div className="text-[11px] text-slate-400">Model Accuracy (R²)</div>
            <div className="mt-1 font-mono text-lg font-bold text-indigo-400">
              {(data.metrics.r2_score * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Statistical fit on history</div>
          </div>

          <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/60">
            <div className="text-[11px] text-slate-400">Mean Abs Error (MAE)</div>
            <div className="mt-1 font-mono text-lg font-bold text-slate-200">
              ₹{data.metrics.mae.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Average prediction error</div>
          </div>

          <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/60">
            <div className="text-[11px] text-slate-400">Trend Trajectory</div>
            <div className="mt-1 font-mono text-lg font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{data.trend_percentage > 0 ? `+${data.trend_percentage}%` : `${data.trend_percentage}%`}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{data.trend_direction}</div>
          </div>

          <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/60">
            <div className="text-[11px] text-slate-400">Projected {forecastDays}D Revenue</div>
            <div className="mt-1 font-mono text-lg font-bold text-purple-400">
              ₹{data.metrics.projected_total.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Target gross revenue</div>
          </div>
        </div>
      </div>

      {/* Forecast Interactive Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Historical Sales vs AI Prediction</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Solid line represents recorded sales; dashed purple line represents machine learning forecast with 95% confidence bounds.
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
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
                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.5rem',
                  fontSize: '12px' 
                }}
                formatter={(val, name) => {
                  if (val === null || val === undefined) return [null, null];
                  if (name === 'actual_sales') return [`₹${Number(val).toLocaleString('en-IN')}`, 'Actual Recorded Sales'];
                  if (name === 'predicted_sales') return [`₹${Number(val).toLocaleString('en-IN')}`, 'AI Predicted Revenue'];
                  if (name === 'upper_bound') return [`₹${Number(val).toLocaleString('en-IN')}`, 'Upper 95% Bound'];
                  if (name === 'lower_bound') return [`₹${Number(val).toLocaleString('en-IN')}`, 'Lower 95% Bound'];
                  return [val, name];
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="plainline"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />

              {/* Confidence Interval Ribbon */}
              <Area 
                type="monotone" 
                dataKey="upper_bound" 
                name="Confidence Range" 
                stroke="transparent" 
                fill="#a855f7" 
                fillOpacity={0.15} 
              />
              
              {/* Actual Sales Line */}
              <Line 
                type="monotone" 
                dataKey="actual_sales" 
                name="Actual Recorded Sales" 
                stroke="#38bdf8" 
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#38bdf8' }}
                connectNulls={false}
              />

              {/* Forecast Line */}
              <Line 
                type="monotone" 
                dataKey="predicted_sales" 
                name="AI Predicted Revenue" 
                stroke="#a855f7" 
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#a855f7' }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights & Strategic Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Insights */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-3 text-slate-100 font-semibold text-sm">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Automated AI Business Insights</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {data.insights.map((ins, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strategic Actions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-3 text-slate-100 font-semibold text-sm">
            <Target className="h-4 w-4 text-emerald-400" />
            <span>Prescriptive Recommendations</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

