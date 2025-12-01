import React from 'react';
import { FinanceRecord } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PieChart } from 'lucide-react';

interface DashboardProps {
  data: FinanceRecord[];
}

const StatCard = ({ title, value, subtext, icon, trend }: { title: string, value: string, subtext?: string, icon: React.ReactNode, trend?: 'up' | 'down' | 'neutral' }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {subtext && <p className={`text-xs mt-1 ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400'}`}>{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Use the latest record for summary
  const latest = data[data.length - 1] || {} as FinanceRecord;
  const previous = data[data.length - 2];
  
  const gainSinceLast = latest.totalAssets - (previous?.totalAssets || latest.totalAssets);
  const gainPercent = previous?.totalAssets ? (gainSinceLast / previous.totalAssets) * 100 : 0;

  const chartData = data.map(d => ({
    name: d.date === 'Unknown Date' ? 'Latest' : d.date.split('/')[1] + '/' + d.date.split('/')[2], // MM/DD
    Total: d.totalAssets,
    Cash: d.cash.total,
    Investment: d.investment.total,
    Yen: d.yen,
    MPF: d.mpf
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Net Worth" 
          value={formatCurrency(latest.totalAssets)} 
          subtext={`${gainPercent > 0 ? '+' : ''}${gainPercent.toFixed(1)}% since last entry`}
          trend={gainPercent >= 0 ? 'up' : 'down'}
          icon={<TrendingUp size={20} />}
        />
        <StatCard 
          title="Cash Holdings" 
          value={formatCurrency(latest.cash?.total || 0)} 
          subtext="Liquid Assets"
          icon={<Wallet size={20} />}
        />
        <StatCard 
          title="Investments" 
          value={formatCurrency(latest.investment?.total || 0)} 
          subtext="Sofi & Binance"
          icon={<PieChart size={20} />}
        />
        <StatCard 
          title="Monthly Income" 
          value={formatCurrency(latest.income || 0)} 
          subtext="Latest recorded"
          icon={<DollarSign size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[350px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Wealth Growth Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide={true} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="Total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[350px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide={true} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend iconType="circle" />
              <Bar dataKey="Cash" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Investment" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Yen" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
