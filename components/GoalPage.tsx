import React, { useState } from 'react';
import { AppSettings, FinanceRecord, ExpenseRecord } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Target, Calendar, TrendingUp, Calculator, Save, Edit2, Check, Clock } from 'lucide-react';

interface GoalPageProps {
  settings: AppSettings;
  data: FinanceRecord[];
  expenses: ExpenseRecord[];
  onUpdateSettings: (settings: AppSettings) => void;
}

const DURATION_OPTIONS = [
    { label: '3 Months', value: 3 },
    { label: '6 Months', value: 6 },
    { label: '1 Year', value: 12 },
    { label: '2 Years', value: 24 },
    { label: '5 Years', value: 60 },
    { label: '10 Years', value: 120 },
];

const GoalPage: React.FC<GoalPageProps> = ({ settings, data, expenses, onUpdateSettings }) => {
  const latest = data.length > 0 ? data[data.length - 1] : { totalAssets: 0, income: 0 };
  const currentNetWorth = latest.totalAssets;
  
  // Calculate monthly savings based on latest income - recurring expenses
  const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currentMonthlySavings = Math.max(0, (latest.income || 0) - monthlyExpenses);

  const [isEditing, setIsEditing] = useState(!settings.savingGoal);
  const [amount, setAmount] = useState<string>(settings.savingGoal?.amount.toString() || '');
  const [months, setMonths] = useState<number>(settings.savingGoal?.months || 12);
  const [customMonths, setCustomMonths] = useState<string>('');

  const handleSave = () => {
    const targetAmount = parseFloat(amount);
    const finalMonths = customMonths ? parseInt(customMonths) : months;

    if (!isNaN(targetAmount) && targetAmount > 0 && finalMonths > 0) {
        onUpdateSettings({
            ...settings,
            savingGoal: {
                amount: targetAmount,
                months: finalMonths,
                startDate: new Date().toISOString()
            }
        });
        setIsEditing(false);
    } else {
        alert('Please enter a valid amount and duration.');
    }
  };

  const calculateProjection = () => {
    if (!settings.savingGoal && isEditing && (!amount || !months)) return null;

    const targetAmount = isEditing ? (parseFloat(amount) || 0) : settings.savingGoal!.amount;
    const durationMonths = isEditing ? (customMonths ? parseInt(customMonths) : months) : settings.savingGoal!.months;
    
    // If not editing, calculate remaining time based on start date
    let remainingMonths = durationMonths;
    let targetDate = new Date();
    
    if (!isEditing && settings.savingGoal) {
        const startDate = new Date(settings.savingGoal.startDate);
        targetDate = new Date(startDate);
        targetDate.setMonth(startDate.getMonth() + settings.savingGoal.months);
        
        const now = new Date();
        const diffMonths = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
        remainingMonths = Math.max(1, diffMonths); // Minimum 1 month to avoid infinity
    } else {
         targetDate.setMonth(targetDate.getMonth() + durationMonths);
    }

    const gap = Math.max(0, targetAmount - currentNetWorth);
    const requiredMonthly = gap / remainingMonths;
    const progress = Math.min(100, Math.max(0, (currentNetWorth / targetAmount) * 100));

    return {
        targetAmount,
        targetDate,
        gap,
        requiredMonthly,
        progress,
        remainingMonths
    };
  };

  const stats = calculateProjection();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header / Intro */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
         
         <div className="relative z-10">
             <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-3xl font-bold mb-2">Financial Goals</h2>
                    <p className="text-indigo-200">Set a target and track your journey to financial freedom.</p>
                 </div>
                 {!isEditing && stats && (
                     <button 
                        onClick={() => {
                            setAmount(stats.targetAmount.toString());
                            setMonths(settings.savingGoal?.months || 12);
                            setCustomMonths('');
                            setIsEditing(true);
                        }}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors text-indigo-100"
                    >
                         <Edit2 size={20} />
                     </button>
                 )}
             </div>

             {!isEditing && stats ? (
                 <div className="mt-8">
                     <div className="flex items-end gap-2 mb-2">
                        <span className="text-5xl font-bold text-white tracking-tight">{formatCurrency(stats.targetAmount)}</span>
                        <span className="text-indigo-300 mb-2 font-medium">Target</span>
                     </div>
                     <p className="text-sm text-indigo-300 mb-6 flex items-center gap-2">
                        <Calendar size={14} /> 
                        Goal Date: {stats.targetDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                     </p>

                     <div className="bg-slate-800/50 rounded-xl p-6 border border-indigo-500/20 backdrop-blur-sm">
                         <div className="flex justify-between text-sm mb-2 font-medium">
                             <span className="text-indigo-200">Progress</span>
                             <span className="text-white">{stats.progress.toFixed(1)}%</span>
                         </div>
                         <div className="h-4 w-full bg-slate-700/50 rounded-full overflow-hidden mb-2">
                             <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${stats.progress}%` }}
                             ></div>
                         </div>
                         <div className="flex justify-between text-xs text-slate-400">
                             <span>{formatCurrency(currentNetWorth)} (Current)</span>
                             <span>{formatCurrency(stats.gap)} to go</span>
                         </div>
                     </div>
                 </div>
             ) : (
                 <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Target Amount</label>
                             <div className="relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
                                 <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="1,000,000"
                                    className="w-full pl-10 pr-4 py-4 bg-slate-900/80 border border-indigo-500/30 rounded-xl text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                                    autoFocus
                                 />
                             </div>
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Timeframe</label>
                             <div className="grid grid-cols-3 gap-2">
                                 {DURATION_OPTIONS.map(opt => (
                                     <button
                                        key={opt.value}
                                        onClick={() => {
                                            setMonths(opt.value);
                                            setCustomMonths('');
                                        }}
                                        className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${months === opt.value && !customMonths ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                     >
                                         {opt.label}
                                     </button>
                                 ))}
                             </div>
                             <div className="mt-2">
                                <input 
                                    type="number" 
                                    value={customMonths}
                                    onChange={(e) => {
                                        setCustomMonths(e.target.value);
                                        setMonths(0); // Deselect presets
                                    }}
                                    placeholder="Or custom months..."
                                    className={`w-full px-3 py-2 bg-slate-900/50 border ${customMonths ? 'border-indigo-500' : 'border-indigo-500/20'} rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600`}
                                />
                             </div>
                         </div>
                     </div>
                     <div className="mt-6 flex justify-end gap-3">
                         {settings.savingGoal && (
                             <button 
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 rounded-xl text-indigo-200 hover:bg-white/5 font-medium transition-colors"
                             >
                                 Cancel
                             </button>
                         )}
                         <button 
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
                         >
                             <Save size={20} />
                             Set Goal
                         </button>
                     </div>
                 </div>
             )}
         </div>
      </div>

      {/* Analysis Cards */}
      {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
                  <div>
                      <div className="flex items-center gap-2 text-slate-500 mb-2">
                          <Clock className="text-indigo-500" size={20} />
                          <h3 className="font-semibold text-sm uppercase">Time Remaining</h3>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">
                          {Math.floor(stats.remainingMonths / 12) > 0 && <span className="mr-2">{Math.floor(stats.remainingMonths / 12)}yr</span>}
                          <span>{stats.remainingMonths % 12}mo</span>
                      </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Target Date: {stats.targetDate.toLocaleDateString()}</p>
              </div>

              <div className={`p-6 rounded-xl shadow-sm border flex flex-col justify-between h-full ${currentMonthlySavings >= stats.requiredMonthly ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div>
                      <div className="flex items-center gap-2 text-slate-500 mb-2">
                          <Calculator className={currentMonthlySavings >= stats.requiredMonthly ? "text-emerald-600" : "text-rose-600"} size={20} />
                          <h3 className="font-semibold text-sm uppercase text-slate-600">Required Monthly Saving</h3>
                      </div>
                      <p className={`text-3xl font-bold ${currentMonthlySavings >= stats.requiredMonthly ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {formatCurrency(stats.requiredMonthly)}
                      </p>
                  </div>
                  <div className="mt-2 text-sm font-medium">
                      {currentMonthlySavings >= stats.requiredMonthly ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                              <Check size={16} /> You are on track!
                          </span>
                      ) : (
                          <span className="text-rose-700">
                              Shortfall: {formatCurrency(stats.requiredMonthly - currentMonthlySavings)}/mo
                          </span>
                      )}
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
                   <div>
                      <div className="flex items-center gap-2 text-slate-500 mb-2">
                          <TrendingUp className="text-blue-500" size={20} />
                          <h3 className="font-semibold text-sm uppercase">Current Savings Rate</h3>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">
                          {formatCurrency(currentMonthlySavings)}
                      </p>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                      Based on latest income ({formatCurrency(latest.income)}) minus expenses ({formatCurrency(monthlyExpenses)})
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default GoalPage;