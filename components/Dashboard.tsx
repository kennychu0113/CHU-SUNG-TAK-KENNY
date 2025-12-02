import React from 'react';
import { FinanceRecord, ExpenseRecord, AppSettings } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency, getAccountTotal } from '../utils/helpers';
import { TrendingUp, DollarSign, Wallet, PieChart as PieChartIcon, CreditCard, PiggyBank } from 'lucide-react';

interface DashboardProps {
  data: FinanceRecord[];
  expenses: ExpenseRecord[];
  settings: AppSettings;
  onViewIncome: () => void;
  onViewExpenses: () => void;
  onViewMetric: (key: string, title: string, color: string) => void;
  onUpdateSettings: (settings: AppSettings) => void;
}

const StatCard = ({ 
    title, 
    value, 
    subtext, 
    icon, 
    trend, 
    color, 
    onClick,
    bgClass
}: { 
    title: string, 
    value: string, 
    subtext?: string, 
    icon: React.ReactNode, 
    trend?: 'up' | 'down' | 'neutral', 
    color?: string,
    onClick?: () => void,
    bgClass?: string
}) => (
  <div 
    onClick={onClick}
    className={`p-7 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all bg-white ${onClick ? 'cursor-pointer hover:shadow-md hover:border-emerald-200 group' : ''}`}
  >
    <div className="flex flex-col justify-center overflow-hidden mr-5">
      <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2 truncate">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 group-hover:text-emerald-900 transition-colors tracking-tight truncate">{value}</h3>
      {subtext && <p className={`text-sm mt-2 font-medium truncate ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400'}`}>{subtext}</p>}
    </div>
    
    <div className={`p-4 rounded-2xl shrink-0 ${bgClass || (trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600')}`}>
        {icon}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ data, expenses, settings, onViewIncome, onViewExpenses, onViewMetric }) => {
  const latest: FinanceRecord = data.length > 0 ? data[data.length - 1] : {
    id: 'default',
    date: 'N/A',
    values: {},
    totalAssets: 0,
    gain: 0,
    income: 0,
    mpf: 0
  };

  const previous = data.length > 1 ? data[data.length - 2] : null;
  
  const gainSinceLast = latest.totalAssets - (previous?.totalAssets || latest.totalAssets);
  const gainPercent = (previous?.totalAssets && previous.totalAssets !== 0) 
    ? (gainSinceLast / previous.totalAssets) * 100 
    : 0;

  const incomeRecords = data.filter(r => r.income && r.income > 0);
  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.income, 0);
  const avgIncome = incomeRecords.length > 0 ? totalIncome / incomeRecords.length : 0;

  const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netSavings = (latest.income || 0) - monthlyExpenses;

  // Calculate Aggregates
  const cashTotal = getAccountTotal(latest, settings.accounts, 'cash');
  const invTotal = getAccountTotal(latest, settings.accounts, 'investment');
  const otherTotal = getAccountTotal(latest, settings.accounts, 'other');

  // Chart Data Construction
  const chartData = data.length > 0 ? data.map(d => ({
    name: d.date === 'Unknown Date' ? 'Latest' : (d.date.includes('/') ? d.date.split('/')[1] + '/' + d.date.split('/')[2] : d.date), // MM/DD
    Total: d.totalAssets || 0,
    Cash: getAccountTotal(d, settings.accounts, 'cash'),
    Investment: getAccountTotal(d, settings.accounts, 'investment'),
    Other: getAccountTotal(d, settings.accounts, 'other'), 
    MPF: d.mpf || 0
  })) : [];

  // Pie Chart Data (Current Snapshot)
  const allocationData = [
    { name: 'Cash', value: cashTotal, color: '#3b82f6' },
    { name: 'Investments', value: invTotal, color: '#8b5cf6' },
    { name: 'Other', value: otherTotal, color: '#f43f5e' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <StatCard 
          title="Net Worth" 
          value={formatCurrency(latest.totalAssets)} 
          subtext={`${gainPercent > 0 ? '+' : ''}${gainPercent.toFixed(1)}% vs last`}
          trend={gainPercent >= 0 ? 'up' : 'down'}
          icon={<TrendingUp size={32} />}
          bgClass="bg-emerald-50 text-emerald-700"
          onClick={() => onViewMetric('totalAssets', 'Net Worth History', '#059669')}
        />
        <StatCard 
          title="Monthly Income (Avg)" 
          value={formatCurrency(avgIncome)} 
          subtext={`Based on history`}
          icon={<DollarSign size={32} />}
          bgClass="bg-emerald-50 text-emerald-600"
          onClick={onViewIncome}
        />
        <StatCard 
            title="Monthly Bills" 
            value={formatCurrency(monthlyExpenses)} 
            subtext="Fixed recurring"
            icon={<CreditCard size={32} />}
            bgClass="bg-rose-50 text-rose-600"
            trend="down"
            onClick={onViewExpenses}
        />
        <StatCard 
          title="Potential Savings" 
          value={formatCurrency(netSavings)} 
          subtext="After fixed bills"
          icon={<PiggyBank size={32} />}
          bgClass="bg-teal-50 text-teal-600"
        />
         <StatCard 
          title="Cash Available" 
          value={formatCurrency(cashTotal)} 
          subtext="Bank & Savings"
          icon={<Wallet size={32} />}
          bgClass="bg-blue-50 text-blue-600"
          onClick={() => onViewMetric('cash_total', 'Cash Holdings History', '#3b82f6')}
        />
        <StatCard 
          title="Investments" 
          value={formatCurrency(invTotal)} 
          subtext="Stock & Crypto"
          icon={<PieChartIcon size={32} />}
          bgClass="bg-violet-50 text-violet-600"
          onClick={() => onViewMetric('inv_total', 'Investment History', '#8b5cf6')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 h-[450px]">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Your Wealth Journey</h3>
          <p className="text-sm text-slate-500 mb-6">Tracking your total assets over time</p>
          
          {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis hide={true} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Total" 
                    stroke="#059669" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>No data available yet</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 h-[450px]">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Where your money is</h3>
          <p className="text-sm text-slate-500 mb-6">Current breakdown by asset type</p>
          
          {allocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>No allocation data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;