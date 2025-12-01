import React from 'react';
import { FinanceRecord } from '../types';
import { formatDate, formatCurrency } from '../utils/helpers';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface IncomeHistoryProps {
  data: FinanceRecord[];
  onBack: () => void;
}

const IncomeHistory: React.FC<IncomeHistoryProps> = ({ data, onBack }) => {
  // Filter only records with income
  const incomeData = data
    .filter(d => d.income && d.income > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ensure chronological order
    
  const chartData = incomeData.map(d => ({
    name: formatDate(d.date),
    Income: d.income
  }));

  const average = incomeData.length > 0 
    ? incomeData.reduce((sum, d) => sum + d.income, 0) / incomeData.length 
    : 0;

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
           <h2 className="text-2xl font-bold text-slate-800">Income History</h2>
           <p className="text-sm text-slate-500">Track your earnings over time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[300px]">
             <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Income Trend</h3>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide={true} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="Income" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-semibold text-slate-700">Detailed Records</h3>
            <div className="text-sm text-slate-500">
                Average: <span className="font-bold text-emerald-600">{formatCurrency(average)}</span>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Recorded Income</th>
                <th className="px-6 py-4 font-medium text-right">Deviation from Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incomeData.slice().reverse().map((record) => {
                const deviation = record.income - average;
                return (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600 text-lg">{formatCurrency(record.income)}</td>
                    <td className={`px-6 py-4 text-right font-medium ${deviation > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {deviation > 0 ? '+' : ''}{formatCurrency(deviation)}
                    </td>
                    </tr>
                );
              })}
              {incomeData.length === 0 && (
                 <tr><td colSpan={3} className="p-8 text-center text-slate-400">No income records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncomeHistory;
