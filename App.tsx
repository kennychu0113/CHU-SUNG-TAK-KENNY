import React, { useState, useEffect } from 'react';
import { parseExpenseCSV } from './utils/helpers';
import { FinanceRecord, ExpenseRecord, ViewState, AppSettings, Account, BackupData } from './types';
import Dashboard from './components/Dashboard';
import TransactionTable from './components/TransactionTable';
import ExpenseTable from './components/ExpenseTable';
import AddEntryForm from './components/AddEntryForm';
import AddExpenseForm from './components/AddExpenseForm';
import SettingsForm from './components/SettingsForm';
import IncomeHistory from './components/IncomeHistory';
import MetricHistory from './components/MetricHistory';
import GoalPage from './components/GoalPage';
import { LayoutDashboard, List, CreditCard, Briefcase, Target, MoreHorizontal, CheckCircle2, Settings, Plus } from 'lucide-react';

const STORAGE_KEYS = {
  ASSETS: 'wealthtrack_assets',
  EXPENSES: 'wealthtrack_expenses',
  SETTINGS: 'wealthtrack_settings',
  LAST_SAVED: 'wealthtrack_last_saved'
};

const DEFAULT_CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Shopping', 'Entertainment', 'Health', 'Other'];

// Generic default accounts for a clean start
const DEFAULT_ACCOUNTS: Account[] = [
    { id: 'acc_bank_main', name: 'Main Bank', type: 'cash' },
    { id: 'acc_savings', name: 'Savings', type: 'cash' },
    { id: 'acc_invest', name: 'Investments', type: 'investment' }
];

const DEFAULT_SETTINGS: AppSettings = {
  accounts: DEFAULT_ACCOUNTS,
  expenseCategories: DEFAULT_CATEGORIES
};

// Helper to sort records by date and recalculate gains based on chronological order
const recalculateGains = (records: FinanceRecord[]): FinanceRecord[] => {
  // Sort by date ascending
  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return sorted.map((record, index) => {
    const prev = index > 0 ? sorted[index - 1] : null;
    // Calculate gain vs previous record in time
    const newGain = prev ? record.totalAssets - prev.totalAssets : 0;
    return { ...record, gain: newGain };
  });
};

const App: React.FC = () => {
  // Initialize Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
          const parsed = JSON.parse(stored);
          return {
              ...DEFAULT_SETTINGS,
              ...parsed,
              accounts: parsed.accounts || DEFAULT_ACCOUNTS,
              expenseCategories: parsed.expenseCategories || DEFAULT_CATEGORIES
          };
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  // Initialize Assets - Start Empty by Default
  const [data, setData] = useState<FinanceRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSETS);
      if (stored) {
          return JSON.parse(stored);
      }
      return []; // Clean start
    } catch (e) {
      console.error("Failed to load assets from storage", e);
      return [];
    }
  });

  // Initialize Expenses - Start Empty by Default
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return stored ? JSON.parse(stored) : []; // Clean start
    } catch (e) {
      console.error("Failed to load expenses from storage", e);
      return [];
    }
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    return stored ? new Date(stored) : null;
  });

  const [view, setView] = useState<ViewState>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FinanceRecord | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  
  // State for generic metric history
  const [metricConfig, setMetricConfig] = useState<{key: string, title: string, color: string} | null>(null);

  // Persistence Effects
  const updateLastSaved = () => {
    const now = new Date();
    setLastSaved(now);
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, now.toISOString());
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(data));
    updateLastSaved();
  }, [data]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    updateLastSaved();
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    updateLastSaved();
  }, [settings]);

  const handleAddOrUpdateRecord = (record: FinanceRecord) => {
    setData(prev => {
        let updatedList;
        const exists = prev.some(r => r.id === record.id);
        if (exists) {
            updatedList = prev.map(r => r.id === record.id ? record : r);
        } else {
            updatedList = [...prev, record];
        }
        // Always resort and recalculate gains to ensure consistency
        return recalculateGains(updatedList);
    });
    setEditingAsset(null);
    setView('assets');
  };

  const handleAddOrUpdateExpense = (record: ExpenseRecord) => {
    setExpenses(prev => {
        const exists = prev.some(e => e.id === record.id);
        if (exists) {
            return prev.map(e => e.id === record.id ? record : e);
        }
        return [...prev, record];
    });
    setEditingExpense(null);
    setView('expenses');
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset record?')) {
      setData(prev => {
          const filtered = prev.filter(record => record.id !== id);
          return recalculateGains(filtered);
      });
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
        setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const startEditAsset = (record: FinanceRecord) => {
    setEditingAsset(record);
    setView('add_asset');
  };

  const startEditExpense = (record: ExpenseRecord) => {
    setEditingExpense(record);
    setView('add_expense');
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (view === 'settings') {
        alert('Settings saved successfully!');
    }
  };

  const handleRestoreData = (backup: BackupData) => {
    try {
        if (backup.settings) setSettings(backup.settings);
        // Recalculate gains on restore just in case
        if (backup.assets) setData(recalculateGains(backup.assets));
        if (backup.expenses) setExpenses(backup.expenses);
        alert(`Data restored successfully from ${new Date(backup.timestamp).toLocaleDateString()}!`);
    } catch (e) {
        alert('Failed to restore data. File might be corrupted.');
    }
  };

  const handleViewMetric = (key: string, title: string, color: string) => {
    setMetricConfig({ key, title, color });
    setView('metric_history');
  };

  const handleGoToDashboard = () => {
    setView('dashboard');
    setEditingAsset(null);
    setEditingExpense(null);
    setMetricConfig(null);
    setMobileMenuOpen(false);
  };

  const handleLoadSampleData = () => {
    if (window.confirm("This will overwrite your current data with sample demo data. Continue?")) {
        // Reset to default generic accounts
        const defaultSet = { ...settings, accounts: DEFAULT_ACCOUNTS };
        setSettings(defaultSet);
        
        // Generate Generic Sample Data
        const today = new Date();
        const sampleRecords: FinanceRecord[] = [];
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today);
            d.setMonth(d.getMonth() - i);
            const dateStr = d.toISOString().split('T')[0].replace(/-/g, '/');
            
            // Simulating growth
            const baseWealth = 50000 + (5 - i) * 5000; 
            
            sampleRecords.push({
                id: `demo-${i}`,
                date: dateStr,
                values: {
                    'acc_bank_main': baseWealth * 0.4,
                    'acc_savings': baseWealth * 0.2,
                    'acc_invest': baseWealth * 0.4
                },
                totalAssets: baseWealth,
                gain: i === 5 ? 0 : 5000,
                income: 5000,
                mpf: 2000 + (5-i)*200,
                note: i === 0 ? 'Current Month' : ''
            });
        }

        const sampleExpenses: ExpenseRecord[] = [
            { id: 'demo-exp-1', category: 'Housing', item: 'Rent', amount: 1500, note: 'Monthly' },
            { id: 'demo-exp-2', category: 'Food', item: 'Groceries', amount: 600, note: 'Estimate' },
            { id: 'demo-exp-3', category: 'Transport', item: 'Commute', amount: 150, note: '' },
            { id: 'demo-exp-4', category: 'Utilities', item: 'Internet & Phone', amount: 80, note: '' },
        ];

        // Use recalculateGains to ensure sample data is perfectly consistent
        setData(recalculateGains(sampleRecords));
        setExpenses(sampleExpenses);
        alert("Sample data loaded! Redirecting to dashboard...");
        setView('dashboard');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const NavItem = ({ id, label, icon }: { id: ViewState, label: string, icon: React.ReactNode }) => {
    const isActive = view === id || (view.startsWith('add_') && id === view.replace('add_', '') + 's' as any);
    return (
      <button
        onClick={() => {
          setView(id);
          setEditingAsset(null);
          setEditingExpense(null);
          setMetricConfig(null);
        }}
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all w-full md:w-auto font-medium ${
          isActive
            ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-200/50' 
            : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-900'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  const MobileTab = ({ id, label, icon }: { id: ViewState, label: string, icon: React.ReactNode }) => {
    const isActive = view === id || (view.startsWith('add_') && id === view.replace('add_', '') + 's' as any);
    return (
        <button 
            onClick={() => {
                setView(id);
                setMobileMenuOpen(false);
                setEditingAsset(null);
                setEditingExpense(null);
                setMetricConfig(null);
            }}
            className={`flex flex-col items-center justify-center p-2 w-full transition-colors ${isActive ? 'text-emerald-800' : 'text-slate-400 hover:text-emerald-600'}`}
        >
            <div className={`mb-1 ${isActive ? 'scale-110 transform' : ''} transition-transform`}>{icon}</div>
            <span className="text-[10px] font-bold tracking-wide">{label}</span>
        </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-[90px] md:pb-0">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white/80 backdrop-blur-md px-4 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-50">
        <div 
            onClick={handleGoToDashboard}
            className="flex items-center gap-2 cursor-pointer active:opacity-70 transition-opacity"
        >
            <div className="w-8 h-8 bg-emerald-900 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">WT</div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">WealthTrack</h1>
        </div>
        {lastSaved && (
             <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                 <CheckCircle2 size={10} className="text-emerald-500" />
                 Saved
             </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-5px_10px_rgba(0,0,0,0.02)] z-50 pb-safe">
        <div className="flex justify-between items-end px-2 py-2">
            <MobileTab id="dashboard" label="Overview" icon={<LayoutDashboard size={22} />} />
            <MobileTab id="assets" label="Assets" icon={<List size={22} />} />
            <MobileTab id="expenses" label="Expenses" icon={<CreditCard size={22} />} />
            <MobileTab id="goals" label="Goals" icon={<Target size={22} />} />
            <button 
                onClick={() => setMobileMenuOpen(true)}
                className={`flex flex-col items-center justify-center p-2 w-full transition-colors ${mobileMenuOpen ? 'text-emerald-800' : 'text-slate-400 hover:text-emerald-600'}`}
            >
                <MoreHorizontal size={22} className="mb-1" />
                <span className="text-[10px] font-bold tracking-wide">More</span>
            </button>
        </div>
      </div>

      {/* Mobile "More" Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute bottom-[80px] right-4 w-56 bg-white rounded-2xl shadow-2xl p-2 border border-slate-100 animate-in slide-in-from-bottom-5 duration-200" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => { setView('mpf'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium text-sm"
                >
                    <Briefcase size={18} className="text-violet-600" /> MPF / Pension
                </button>
                <button 
                    onClick={() => { setView('settings'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium text-sm"
                >
                    <Settings size={18} className="text-slate-500" /> Settings
                </button>
            </div>
        </div>
      )}

      <div className="w-full md:flex md:h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-full bg-white border-r border-slate-100 p-6 z-30 shrink-0">
          <div 
            onClick={handleGoToDashboard}
            className="mb-10 flex items-center gap-3 cursor-pointer group px-2"
          >
            <div className="w-9 h-9 bg-emerald-900 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform shadow-lg shadow-emerald-200">W</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">WealthTrack</h1>
          </div>
          <nav className="space-y-2 flex-1">
            <NavItem id="dashboard" label="Overview" icon={<LayoutDashboard size={20} />} />
            <NavItem id="goals" label="Goals" icon={<Target size={20} />} />
            <NavItem id="assets" label="Assets" icon={<List size={20} />} />
            <NavItem id="expenses" label="Expenses" icon={<CreditCard size={20} />} />
            <NavItem id="mpf" label="MPF / Pension" icon={<Briefcase size={20} />} />
            <NavItem id="settings" label="Settings" icon={<Settings size={20} />} />
          </nav>
          
          <div className="mt-auto pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2 mb-2 px-2">
                <div className={`w-2 h-2 rounded-full ${lastSaved ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <span className="text-xs font-medium text-slate-500">Data saved on device</span>
            </div>
             <div className="text-[10px] text-slate-300 mt-2 px-2">
                Professional Edition 2025
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-full scroll-smooth">
          <div className="p-4 md:p-10 w-full mx-auto max-w-7xl">
            <header className="mb-8 hidden md:block">
                {view === 'dashboard' ? (
                   <div>
                     <p className="text-slate-500 text-sm mb-1">{getGreeting()},</p>
                     <h2 className="text-3xl font-bold text-slate-800">Welcome to your dashboard</h2>
                   </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 capitalize">
                        {view === 'add_asset' ? (editingAsset ? 'Update Asset Record' : 'New Asset Entry') : 
                        view === 'add_expense' ? (editingExpense ? 'Edit Bill' : 'Add Monthly Expense') : 
                        view === 'income_history' ? 'Income Analysis' :
                        view === 'metric_history' ? (metricConfig?.title || 'Trend Analysis') :
                        view === 'mpf' ? 'MPF Portfolio' :
                        view === 'assets' ? 'Asset History' :
                        view}
                    </h2>
                    <p className="text-slate-500 text-sm">
                      {view === 'goals' ? 'Plan your financial future' : 
                       view === 'assets' ? 'Track your wealth over time' :
                       view === 'expenses' ? 'Manage your recurring costs' :
                       'Manage your finances'}
                    </p>
                  </div>
                )}
            </header>

            {view === 'dashboard' && (
                <Dashboard 
                    data={data} 
                    expenses={expenses} 
                    settings={settings}
                    onViewIncome={() => setView('income_history')}
                    onViewExpenses={() => setView('expenses')}
                    onViewMetric={handleViewMetric}
                    onUpdateSettings={handleSaveSettings}
                />
            )}
            
            {view === 'goals' && (
                <GoalPage 
                    settings={settings}
                    data={data}
                    expenses={expenses}
                    onUpdateSettings={handleSaveSettings}
                />
            )}
            
            {view === 'income_history' && (
                <IncomeHistory 
                    data={data}
                    onBack={() => setView('dashboard')}
                />
            )}

            {view === 'metric_history' && metricConfig && (
                <MetricHistory 
                    data={data}
                    title={metricConfig.title}
                    dataKey={metricConfig.key}
                    color={metricConfig.color}
                    onBack={() => setView('dashboard')}
                />
            )}

            {view === 'mpf' && (
                <MetricHistory 
                    data={data}
                    title="MPF Portfolio"
                    dataKey="mpf"
                    color="#8b5cf6"
                    onBack={() => setView('dashboard')}
                />
            )}

            {view === 'assets' && (
                <div className="space-y-6">
                     <div className="flex justify-end">
                        <button 
                            onClick={() => {
                                setEditingAsset(null);
                                setView('add_asset');
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-200/50 w-full md:w-auto justify-center"
                        >
                            <Plus size={18} />
                            <span>Update Balances</span>
                        </button>
                     </div>
                    <TransactionTable 
                        data={data} 
                        settings={settings}
                        onDelete={handleDeleteRecord} 
                        onEdit={startEditAsset}
                    />
                </div>
            )}
            
            {view === 'expenses' && (
                <ExpenseTable 
                    data={expenses} 
                    onDelete={handleDeleteExpense} 
                    onEdit={startEditExpense}
                    onAdd={() => {
                        setEditingExpense(null);
                        setView('add_expense');
                    }} 
                />
            )}
            
            {view === 'add_asset' && (
                 <div className="max-w-4xl mx-auto">
                    <button onClick={() => setView('assets')} className="mb-4 text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium">← Back to Assets</button>
                    <AddEntryForm 
                        onAdd={handleAddOrUpdateRecord} 
                        lastRecord={data[data.length - 1]} 
                        settings={settings}
                        initialData={editingAsset}
                    />
                 </div>
            )}
            
            {view === 'add_expense' && (
                 <div className="max-w-2xl mx-auto">
                    <button onClick={() => setView('expenses')} className="mb-4 text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium">← Back to Expenses</button>
                    <AddExpenseForm 
                        onAdd={handleAddOrUpdateExpense} 
                        onCancel={() => setView('expenses')} 
                        initialData={editingExpense}
                        settings={settings}
                    />
                 </div>
            )}

            {view === 'settings' && (
                <SettingsForm 
                    settings={settings} 
                    onSave={handleSaveSettings} 
                    data={data}
                    expenses={expenses}
                    onLoadSampleData={handleLoadSampleData}
                    onRestore={handleRestoreData}
                />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;