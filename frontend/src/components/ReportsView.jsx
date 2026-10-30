import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  TrendingUp, 
  CreditCard,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

export default function ReportsView() {
  const [reportDays, setReportDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await api.getReportSummary();
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [reportDays]);

  const handleDownloadCSV = () => {
    const url = api.getExportCSVUrl(reportDays);
    window.open(url, '_blank');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
            <span>Executive Business Reports & Data Exports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export reconciled financial and sales activity audits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 shadow-sm hover:bg-emerald-500/20 transition active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition active:scale-95"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Card */}
      {summary && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Aggregated Performance Statement</h3>
              <p className="text-xs text-slate-400 mt-0.5">Historical statement audited across all settled records</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Calendar className="h-3.5 w-3.5" />
              <span>{summary.period.start} to {summary.period.end}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="text-xs text-slate-400">Total Settled Revenue</span>
              <div className="mt-1 font-mono text-xl font-bold text-white">
                ₹{summary.total_revenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block">Gross invoiced volume</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="text-xs text-slate-400">Net Business Profit</span>
              <div className="mt-1 font-mono text-xl font-bold text-emerald-400">
                ₹{summary.total_profit.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Margin: {summary.profit_margin_pct}%</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="text-xs text-slate-400">Total Fulfilled Orders</span>
              <div className="mt-1 font-mono text-xl font-bold text-indigo-400">
                {summary.total_orders.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Completed transactions</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="text-xs text-slate-400">Average Order Value (AOV)</span>
              <div className="mt-1 font-mono text-xl font-bold text-amber-400">
                ₹{summary.average_order_value.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Basket size per customer</span>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Report Documentation & Compliance Summary</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This statement includes line-item breakdown of all SKU transactions recorded in PostgreSQL/SQLite. 
              Figures match real-time ledger records synchronized via WebSockets and validated against payment gateway callbacks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

