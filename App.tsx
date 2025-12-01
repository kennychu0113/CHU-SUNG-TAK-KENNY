import React, { useState, useEffect } from 'react';
import { INITIAL_CSV_DATA } from './constants';
import { parseCSVData } from './utils/helpers';
import { FinanceRecord, ViewState } from './types';
import Dashboard from './components/Dashboard';
import TransactionTable from './components/TransactionTable';
import AddEntryForm from './components/AddEntryForm';
import AIAdvisor from './components/AIAdvisor';
import { LayoutDashboard, List, PlusCircle, Sparkles, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<FinanceRecord[]>([]);
  const [view, setView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load initial data
    const records = parseCSVData(INITIAL_CSV_DATA);
    setData(records);
  }, []);

  const handleAddRecord = (record: FinanceRecord) => {
    setData(prev => [...prev, record]);
    setView('dashboard');
  };

  const NavItem = ({ id, label, icon }: { id: ViewState, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => {
        setView(id);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full md:w-auto ${
        view === id 
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
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 px-4 space-y-2">
            <NavItem id="dashboard" label="Dashboard" icon={<LayoutDashboard size={20} />} />
            <NavItem id="list" label="Records" icon={<List size={20} />} />
            <NavItem id="add" label="Add Entry" icon={<PlusCircle size={20} />} />
            <NavItem id="ai" label="AI Advisor" icon={<Sparkles size={20} />} />
        </div>
      )}

      <div className="max-w-7xl mx-auto md:flex md:h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-full bg-white border-r border-slate-200 p-6 z-30">
          <div className="mb-10 flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <h1 className="text-xl font-bold text-slate-800">WealthTrack</h1>
          </div>
          <nav className="space-y-2 flex-1">
            <NavItem id="dashboard" label="Dashboard" icon={<LayoutDashboard size={20} />} />
            <NavItem id="list" label="Records" icon={<List size={20} />} />
            <NavItem id="add" label="Add Entry" icon={<PlusCircle size={20} />} />
            <NavItem id="ai" label="AI Advisor" icon={<Sparkles size={20} />} />
          </nav>
          <div className="text-xs text-slate-400 mt-auto pt-6 border-t border-slate-100">
             v1.0.0 &copy; 2025
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] md:h-full">
          <div className="p-4 md:p-8 md:max-w-6xl mx-auto">
            <header className="mb-8 hidden md:block">
                <h2 className="text-2xl font-bold text-slate-800 capitalize">{view === 'ai' ? 'AI Advisor' : view === 'add' ? 'New Entry' : view}</h2>
                <p className="text-slate-500 text-sm">Manage your financial growth</p>
            </header>

            {view === 'dashboard' && <Dashboard data={data} />}
            {view === 'list' && <TransactionTable data={data} />}
            {view === 'add' && <AddEntryForm onAdd={handleAddRecord} lastRecord={data[data.length - 1]} />}
            {view === 'ai' && <AIAdvisor data={data} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
