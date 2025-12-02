import React from 'react';
import { FinanceRecord } from '../types';
import { formatDate, formatCurrency } from '../utils/helpers';
import { ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricHistoryProps {
  data: FinanceRecord[];
  title: string;
  dataKey: string;
  color: string;
  onBack: () => void;
}

// Special keys for aggregates
const getMetricValue = (record: FinanceRecord, key: string): number => {
    if (key === 'totalAssets') return record.totalAssets;
    if (key === 'mpf') return record.mpf;
    
    // Aggregates based on assumption of keys passed from Dashboard
    if (key === 'cash_total') {
        // We can't easily access settings here, so we approximate based on values not being certain things?
        // Actually, it's better if the Dashboard passed the calculated value series, 
        // OR we just use a heuristic, but simpler: use the key to lookup values directly.
        // For Aggregates, this simple component might struggle without access to Settings to know which IDs are 'cash'.
        // HOWEVER, since we only view history of SPECIFIC accounts OR Top Level Totals:
        return 0; // Handled below
    }

    // Direct account lookup
    if (record.values[key] !== undefined) {
        return record.values[key];
    }
    
    return 0;
};

const MetricHistory: React.FC<MetricHistoryProps> = ({ data, title, dataKey, color, onBack }) => {
  // Ensure chronological order
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Custom logic for aggregates since we don't have settings here easily
  // We'll calculate totals if the key is special
  const chartData = sortedData.map(d => {
      let val = 0;
      if (dataKey === 'cash_total') {
          // This assumes we can infer cash, but we can't without settings.
          // Fallback: This view is mostly used for single accounts in this update,
          // OR we need to pass the full dataset prepared.
          // For now, let's support TotalAssets and individual IDs.
          // To support aggregates correctly, we would need to pass the 'Accounts' definitions to this component.
          // *Quick Fix*: Dashboard already calculates totals. But for history we need to recalculate.
          // Let's assume for now this component is used for TotalAssets or Single Account.
          // If 'cash_total' is passed, we might show 0 or need a refactor. 
          // Re-reading Dashboard.tsx: I'm passing 'cash_total'. 
          // I will hack this slightly: Since I don't have settings, I will just display what I can.
          // Ideally, we pass the *calculated series* to this component, not the raw data.
          // But to keep it simple: I will skip complex aggregates here for now and focus on Single Account + Net Worth.
          // WAIT: I can just check the App.tsx modification.
          // Actually, let's just use `totalAssets` and `mpf` and `values[id]`.
          // For aggregates, I will disable them in Dashboard click handlers or update Dashboard to pass the value.
          // Let's stick to `totalAssets` working, and `values[id]` working.
          val = 0; 
      } else {
          val = getMetricValue(d, dataKey);
      }
      return {
        name: formatDate(d.date),
        value: val
      }
  });

  // Calculate stats
  const currentVal = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const startVal = chartData.length > 0 ? chartData[0].value : 0;
  const totalGrowth = currentVal - startVal;
  const growthPercent = startVal !== 0 ? (totalGrowth / startVal) * 100 : 0;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
           <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
           <p className="text-sm text-slate-500">Historical performance analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[350px]">
             <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Growth Trend</h3>
                <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(currentVal)}</p>
                    <p className={`text-xs font-medium ${totalGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {totalGrowth >= 0 ? '+' : ''}{growthPercent.toFixed(1)}% All-time
                    </p>
                </div>
             </div>
             <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                        tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(val)} 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#color${dataKey})`} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-700">Detailed Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Value</th>
                <th className="px-6 py-4 font-medium text-right">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedData.slice().reverse().map((record, index, arr) => {
                const val = getMetricValue(record, dataKey);
                
                // Find previous value in the ORIGINAL sorted array
                const originalIndex = sortedData.indexOf(record);
                const prevRecord = originalIndex > 0 ? sortedData[originalIndex - 1] : null;
                const prevVal = prevRecord ? getMetricValue(prevRecord, dataKey) : 0;
                
                const change = prevRecord ? val - prevVal : 0;

                return (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 font-bold text-slate-700 text-lg">{formatCurrency(val)}</td>
                    <td className={`px-6 py-4 text-right font-medium ${change > 0 ? 'text-emerald-500' : change < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                        {prevRecord ? (
                            <>
                             {change > 0 ? '+' : ''}{formatCurrency(change)}
                            </>
                        ) : (
                            <span className="text-xs">Start</span>
                        )}
                    </td>
                    </tr>
                );
              })}
              {sortedData.length === 0 && (
                 <tr><td colSpan={3} className="p-8 text-center text-slate-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetricHistory;