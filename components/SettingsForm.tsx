import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Save, RefreshCw } from 'lucide-react';

interface SettingsFormProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onSave }) => {
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

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
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
