import React, { useState } from 'react';
import { AppSettings, FinanceRecord, ExpenseRecord } from '../types';
import { Save, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';
import { downloadCSV } from '../utils/helpers';

interface SettingsFormProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  data: FinanceRecord[];
  expenses: ExpenseRecord[];
}

const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onSave, data, expenses }) => {
  const [labels, setLabels] = useState(settings.labels);

  const handleChange = (key: keyof AppSettings['labels'], value: string) => {
    setLabels(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (window.confirm('Reset all labels to default?')) {
        setLabels({
            hsbc: 'HSBC',
            citi: 'Citi',
            other: 'Other',
            sofi: 'Sofi',
            binance: 'Binance',
            yen: 'Yen'
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ labels });
  };

  const handleExportAssets = () => {
    // Reconstruct CSV format compatible with the import structure
    const header = `Date,Total Assets,Gain,Income,Cash Total,${labels.hsbc},${labels.citi},${labels.other},Inv Total,${labels.sofi},${labels.binance},${labels.yen},MPF`;
    const rows = data.map(r => {
        return `${r.date},${r.totalAssets},${r.gain},${r.income},${r.cash.total},${r.cash.hsbc},${r.cash.citi},${r.cash.other},${r.investment.total},${r.investment.sofi},${r.investment.binance},${r.yen},${r.mpf}`;
    });
    const csvContent = [header, ...rows].join('\n');
    downloadCSV(csvContent, `WealthTrack_Assets_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportExpenses = () => {
    const header = `Category,Item,Amount,Note`;
    const rows = expenses.map(e => `${e.category},"${e.item}",${e.amount},"${e.note || ''}"`);
    const csvContent = [header, ...rows].join('\n');
    downloadCSV(csvContent, `WealthTrack_Recurring_Expenses.csv`);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300 space-y-8">
      
      {/* Export Section */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-100">
         <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Download size={24} className="text-emerald-600" />
            Data Management
         </h2>
         <p className="text-sm text-slate-500 mb-6">Export your data to CSV format. You can upload these files to Google Drive or open them in Excel.</p>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={handleExportAssets}
                className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
                <FileSpreadsheet size={32} className="text-slate-400 group-hover:text-emerald-600 mb-2 transition-colors" />
                <span className="font-semibold text-slate-700 group-hover:text-emerald-800">Export Assets CSV</span>
                <span className="text-xs text-slate-400 mt-1">Full record history</span>
            </button>
             <button 
                onClick={handleExportExpenses}
                className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-all group"
            >
                <FileSpreadsheet size={32} className="text-slate-400 group-hover:text-rose-600 mb-2 transition-colors" />
                <span className="font-semibold text-slate-700 group-hover:text-rose-800">Export Expenses CSV</span>
                <span className="text-xs text-slate-400 mt-1">All recurring items</span>
            </button>
         </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-100">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Column Settings</h2>
            <p className="text-sm text-slate-500">Customize the names of your asset accounts.</p>
          </div>
          <button onClick={handleReset} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full" title="Reset Defaults">
            <RefreshCw size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide bg-emerald-50 p-2 rounded-lg">Cash Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-500 mb-1">Slot 1 (Default: HSBC)</label>
                    <input 
                        type="text" 
                        value={labels.hsbc} 
                        onChange={e => handleChange('hsbc', e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-500 mb-1">Slot 2 (Default: Citi)</label>
                    <input 
                        type="text" 
                        value={labels.citi} 
                        onChange={e => handleChange('citi', e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-500 mb-1">Slot 3 (Default: Other)</label>
                    <input 
                        type="text" 
                        value={labels.other} 
                        onChange={e => handleChange('other', e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50"
                    />
                </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wide bg-indigo-50 p-2 rounded-lg">Investment Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-500 mb-1">Slot 1 (Default: Sofi)</label>
                    <input 
                        type="text" 
                        value={labels.sofi} 
                        onChange={e => handleChange('sofi', e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-500 mb-1">Slot 2 (Default: Binance)</label>
                    <input 
                        type="text" 
                        value={labels.binance} 
                        onChange={e => handleChange('binance', e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50"
                    />
                </div>
            </div>
          </div>

           <div className="space-y-4">
            <h3 className="text-sm font-bold text-rose-700 uppercase tracking-wide bg-rose-50 p-2 rounded-lg">Other Assets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-500 mb-1">Foreign Currency (Default: Yen)</label>
                    <input 
                        type="text" 
                        value={labels.yen} 
                        onChange={e => handleChange('yen', e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50"
                    />
                </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
                type="submit" 
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
            >
                <Save size={18} />
                Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsForm;
