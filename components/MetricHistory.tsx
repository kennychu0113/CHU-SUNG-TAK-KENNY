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

// Helper to access nested properties like "cash.total"
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) as number;
};

const MetricHistory: React.FC<MetricHistoryProps> = ({ data, title, dataKey, color, onBack }) => {
  // Ensure chronological order
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const chartData = sortedData.map(d => ({
    name: formatDate(d.date),
    value: getNestedValue(d, dataKey)
  }));

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
                // Since we reversed the array for display, the "previous" chronological record is actually at index + 1 in this display list
                // However, 'arr' here is the reversed slice. Let's look up the original sortedData.
                // The record is `record`. We need `record`'s predecessor.
                const originalIndex = sortedData.indexOf(record);
                const prevRecord = originalIndex > 0 ? sortedData[originalIndex - 1] : null;
                
                const val = getNestedValue(record, dataKey);
                const prevVal = prevRecord ? getNestedValue(prevRecord, dataKey) : 0;
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
