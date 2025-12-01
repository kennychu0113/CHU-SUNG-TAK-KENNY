import React, { useState, useEffect } from 'react';
import { INITIAL_CSV_DATA, INITIAL_EXPENSE_DATA } from './constants';
import { parseCSVData, parseExpenseCSV } from './utils/helpers';
import { FinanceRecord, ExpenseRecord, ViewState, AppSettings } from './types';
import Dashboard from './components/Dashboard';
import TransactionTable from './components/TransactionTable';
import ExpenseTable from './components/ExpenseTable';
import AddEntryForm from './components/AddEntryForm';
import AddExpenseForm from './components/AddExpenseForm';
import SettingsForm from './components/SettingsForm';
import IncomeHistory from './components/IncomeHistory';
import MetricHistory from './components/MetricHistory';
import { LayoutDashboard, List, CreditCard, Menu, X, Plus, Settings, CheckCircle2 } from 'lucide-react';

const STORAGE_KEYS = {
  ASSETS: 'wealthtrack_assets',
  EXPENSES: 'wealthtrack_expenses',
  SETTINGS: 'wealthtrack_settings',
  LAST_SAVED: 'wealthtrack_last_saved'
};

const DEFAULT_SETTINGS: AppSettings = {
  labels: {
      hsbc: 'HSBC',
      citi: 'Citi',
      other: 'Other',
      sofi: 'Sofi',
      binance: 'Binance',
      yen: 'Yen'
  }
};

const App: React.FC = () => {
  // Initialize Assets with Local Storage or Default CSV
  const [data, setData] = useState<FinanceRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSETS);
      return stored ? JSON.parse(stored) : parseCSVData(INITIAL_CSV_DATA);
    } catch (e) {
      console.error("Failed to load assets from storage", e);
      return parseCSVData(INITIAL_CSV_DATA);
    }
  });

  // Initialize Expenses with Local Storage or Default CSV
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return stored ? JSON.parse(stored) : parseExpenseCSV(INITIAL_EXPENSE_DATA);
    } catch (e) {
      console.error("Failed to load expenses from storage", e);
      return parseExpenseCSV(INITIAL_EXPENSE_DATA);
    }
  });
  
  // Initialize Settings with Local Storage or Default
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    return stored ? new Date(stored) : null;
  });

  const [view, setView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        const exists = prev.some(r => r.id === record.id);
        if (exists) {
            return prev.map(r => r.id === record.id ? record : r);
        }
        return [...prev, record];
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
      setData(prev => prev.filter(record => record.id !== id));
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
    alert('Settings saved successfully!');
  };

  const handleViewMetric = (key: string, title: string, color: string) => {
    setMetricConfig({ key, title, color });
    setView('metric_history');
  };

  const NavItem = ({ id, label, icon }: { id: ViewState, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => {
        setView(id);
        setIsMobileMenuOpen(false);
        // Reset edit states when navigating via menu
        setEditingAsset(null);
        setEditingExpense(null);
        setMetricConfig(null);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full md:w-auto ${
        (view === id || (view.startsWith('add_') && id === view.replace('add_', '') + 's' as any)) // keep parent active
          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 font-medium' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden bg-white px-4 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">WealthTrack</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 px-4 space-y-2 flex flex-col">
            <NavItem id="dashboard" label="Dashboard" icon={<LayoutDashboard size={20} />} />
            <NavItem id="assets" label="Assets" icon={<List size={20} />} />
            <NavItem id="expenses" label="Expenses" icon={<CreditCard size={20} />} />
            <NavItem id="settings" label="Settings" icon={<Settings size={20} />} />
            
            <div className="mt-auto mb-8 px-4 py-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Auto-Saved</span>
                </div>
                 {lastSaved && (
                    <p className="text-xs text-slate-400">
                        {lastSaved.toLocaleDateString()} {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                )}
            </div>
        </div>
      )}

      <div className="w-full md:flex md:h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-full bg-white border-r border-slate-200 p-6 z-30 shrink-0">
          <div className="mb-10 flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <h1 className="text-xl font-bold text-slate-800">WealthTrack</h1>
          </div>
          <nav className="space-y-2 flex-1">
            <NavItem id="dashboard" label="Dashboard" icon={<LayoutDashboard size={20} />} />
            <NavItem id="assets" label="Assets" icon={<List size={20} />} />
            <NavItem id="expenses" label="Expenses" icon={<CreditCard size={20} />} />
            <NavItem id="settings" label="Settings" icon={<Settings size={20} />} />
          </nav>
          
          <div className="mt-auto pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${lastSaved ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                <span className="text-xs font-medium text-slate-500">Device Storage Active</span>
            </div>
             {lastSaved && (
                <p className="text-[10px] text-slate-400 pl-4">
                    Saved: {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
            )}
             <div className="text-[10px] text-slate-300 mt-4">
                v1.6.0 &copy; 2025
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] md:h-full">
          <div className="p-4 md:p-8 w-full mx-auto">
            <header className="mb-8 hidden md:block">
                <h2 className="text-2xl font-bold text-slate-800 capitalize">
                    {view === 'add_asset' ? (editingAsset ? 'Edit Asset Record' : 'Add Asset Record') : 
                     view === 'add_expense' ? (editingExpense ? 'Edit Expense' : 'Log Expense') : 
                     view === 'income_history' ? 'Income Analysis' :
                     view === 'metric_history' ? (metricConfig?.title || 'History') :
                     view}
                </h2>
                <p className="text-slate-500 text-sm">Manage your financial growth</p>
            </header>

            {view === 'dashboard' && (
                <Dashboard 
                    data={data} 
                    expenses={expenses} 
                    settings={settings}
                    onViewIncome={() => setView('income_history')}
                    onViewExpenses={() => setView('expenses')}
                    onViewMetric={handleViewMetric}
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

            {view === 'assets' && (
                <div className="space-y-4">
                     <div className="flex justify-end">
                        <button 
                            onClick={() => {
                                setEditingAsset(null);
                                setView('add_asset');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            <span>Update Assets</span>
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
                    <button onClick={() => setView('assets')} className="mb-4 text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">← Back to Assets</button>
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
                    <button onClick={() => setView('expenses')} className="mb-4 text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">← Back to Expenses</button>
                    <AddExpenseForm 
                        onAdd={handleAddOrUpdateExpense} 
                        onCancel={() => setView('expenses')} 
                        initialData={editingExpense}
                    />
                 </div>
            )}

            {view === 'settings' && (
                <SettingsForm 
                    settings={settings} 
                    onSave={handleSaveSettings} 
                    data={data}
                    expenses={expenses}
                />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
