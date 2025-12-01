import React from 'react';
import { FinanceRecord, ExpenseRecord, AppSettings } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, DollarSign, Wallet, PieChart, CreditCard, PiggyBank, ArrowRight } from 'lucide-react';

interface DashboardProps {
  data: FinanceRecord[];
  expenses: ExpenseRecord[];
  settings: AppSettings;
  onViewIncome: () => void;
  onViewExpenses: () => void;
  onViewMetric: (key: string, title: string, color: string) => void;
}

const StatCard = ({ 
    title, 
    value, 
    subtext, 
    icon, 
    trend, 
    color, 
    onClick 
}: { 
    title: string, 
    value: string, 
    subtext?: string, 
    icon: React.ReactNode, 
    trend?: 'up' | 'down' | 'neutral', 
    color?: string,
    onClick?: () => void
}) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-emerald-200 group' : ''}`}
  >
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{value}</h3>
      {subtext && <p className={`text-xs mt-1 ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400'}`}>{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color || (trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600')}`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ data, expenses, settings, onViewIncome, onViewExpenses, onViewMetric }) => {
  const latest = data[data.length - 1] || {} as FinanceRecord;
  const previous = data[data.length - 2];
  
  const gainSinceLast = latest.totalAssets - (previous?.totalAssets || latest.totalAssets);
  const gainPercent = previous?.totalAssets ? (gainSinceLast / previous.totalAssets) * 100 : 0;

  // Calculate Average Monthly Income
  // Filter out records with 0 or missing income to get a true "working" average
  const incomeRecords = data.filter(r => r.income && r.income > 0);
  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.income, 0);
  const avgIncome = incomeRecords.length > 0 ? totalIncome / incomeRecords.length : 0;

  // Calculate total monthly recurring expenses (sum of all expense items)
  const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const netSavings = (latest.income || 0) - monthlyExpenses;

  const chartData = data.map(d => ({
    name: d.date === 'Unknown Date' ? 'Latest' : d.date.split('/')[1] + '/' + d.date.split('/')[2], // MM/DD
    Total: d.totalAssets,
    Cash: d.cash.total,
    Investment: d.investment.total,
    [settings.labels.yen]: d.yen, // Use dynamic label
    MPF: d.mpf
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Total Net Worth" 
          value={formatCurrency(latest.totalAssets)} 
          subtext={`${gainPercent > 0 ? '+' : ''}${gainPercent.toFixed(1)}% since last entry`}
          trend={gainPercent >= 0 ? 'up' : 'down'}
          icon={<TrendingUp size={20} />}
          onClick={() => onViewMetric('totalAssets', 'Net Worth History', '#10b981')}
        />
        <StatCard 
          title="Avg. Monthly Income" 
          value={formatCurrency(avgIncome)} 
          subtext={`Based on ${incomeRecords.length} records. Click for history.`}
          icon={<DollarSign size={20} />}
          color="bg-emerald-50 text-emerald-600"
          onClick={onViewIncome}
        />
        <StatCard 
            title="Recurring Expenses" 
            value={formatCurrency(monthlyExpenses)} 
            subtext="Total monthly cost"
            icon={<CreditCard size={20} />}
            color="bg-rose-50 text-rose-600"
            trend="down"
            onClick={onViewExpenses}
        />
        <StatCard 
          title="Net Savings" 
          value={formatCurrency(netSavings)} 
          subtext="Latest Income - Recurring Expenses"
          icon={<PiggyBank size={20} />}
          color="bg-blue-50 text-blue-600"
        />
         <StatCard 
          title="Cash Holdings" 
          value={formatCurrency(latest.cash?.total || 0)} 
          subtext="Liquid Assets"
          icon={<Wallet size={20} />}
          onClick={() => onViewMetric('cash.total', 'Cash Holdings History', '#3b82f6')}
        />
        <StatCard 
          title="Investments" 
          value={formatCurrency(latest.investment?.total || 0)} 
          subtext={`${settings.labels.sofi} & ${settings.labels.binance}`}
          icon={<PieChart size={20} />}
          onClick={() => onViewMetric('investment.total', 'Investment History', '#6366f1')}
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
              <Bar dataKey={settings.labels.yen} stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
