import React, { useState } from 'react';
import { FinanceRecord, AppSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Trash2, Settings2, Check, Pencil } from 'lucide-react';

interface TransactionTableProps {
  data: FinanceRecord[];
  settings: AppSettings;
  onDelete: (id: string) => void;
  onEdit: (record: FinanceRecord) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ data, settings, onDelete, onEdit }) => {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const toggleColumn = (key: string) => {
    setHiddenColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isVisible = (key: string) => !hiddenColumns.includes(key);

  const columns = [
    { key: 'totalAssets', label: 'Total Assets' },
    { key: 'gain', label: 'Gain' },
    { key: 'income', label: 'Income' },
    { key: 'cashTotal', label: 'Cash Total' },
    { key: 'hsbc', label: settings.labels.hsbc },
    { key: 'citi', label: settings.labels.citi },
    { key: 'other', label: settings.labels.other },
    { key: 'invTotal', label: 'Inv Total' },
    { key: 'sofi', label: settings.labels.sofi },
    { key: 'binance', label: settings.labels.binance },
    { key: 'yen', label: settings.labels.yen },
    { key: 'mpf', label: 'MPF' },
  ];

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
           <h3 className="text-lg font-semibold text-slate-800">Record History</h3>
           <span className="text-xs text-slate-500">{data.length} entries</span>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showColumnMenu ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            <Settings2 size={16} />
            <span>Columns</span>
          </button>

          {showColumnMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-30 grid grid-cols-1 gap-1 animate-in fade-in zoom-in-95 duration-200">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Visible Columns</h4>
               {columns.map(col => (
                 <button
                   key={col.key}
                   onClick={() => toggleColumn(col.key)}
                   className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-50 text-left text-sm text-slate-700"
                 >
                   <span>{col.label}</span>
                   {isVisible(col.key) && <Check size={14} className="text-emerald-600" />}
                 </button>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
        {showColumnMenu && <div className="fixed inset-0 z-20" onClick={() => setShowColumnMenu(false)} />}
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium whitespace-nowrap sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Date</th>
                {isVisible('totalAssets') && <th className="px-6 py-4 font-medium text-emerald-600 whitespace-nowrap">Total Assets</th>}
                {isVisible('gain') && <th className="px-6 py-4 font-medium whitespace-nowrap">Gain</th>}
                {isVisible('income') && <th className="px-6 py-4 font-medium whitespace-nowrap">Income</th>}
                {isVisible('cashTotal') && <th className="px-6 py-4 font-medium text-blue-600 whitespace-nowrap">Cash Total</th>}
                {isVisible('hsbc') && <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">{settings.labels.hsbc}</th>}
                {isVisible('citi') && <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">{settings.labels.citi}</th>}
                {isVisible('other') && <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">{settings.labels.other}</th>}
                {isVisible('invTotal') && <th className="px-6 py-4 font-medium text-indigo-600 whitespace-nowrap">Inv Total</th>}
                {isVisible('sofi') && <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">{settings.labels.sofi}</th>}
                {isVisible('binance') && <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">{settings.labels.binance}</th>}
                {isVisible('yen') && <th className="px-6 py-4 font-medium text-rose-600 whitespace-nowrap">{settings.labels.yen}</th>}
                {isVisible('mpf') && <th className="px-6 py-4 font-medium whitespace-nowrap">MPF</th>}
                <th className="px-6 py-4 font-medium text-center sticky right-0 bg-slate-50 z-10 border-l border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.slice().reverse().map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-50 shadow-[4px_0_4px_-2px_rgba(0,0,0,0.05)]">
                    {formatDate(record.date)}
                  </td>
                  {isVisible('totalAssets') && <td className="px-6 py-4 font-bold text-emerald-700 whitespace-nowrap">{formatCurrency(record.totalAssets)}</td>}
                  {isVisible('gain') && <td className={`px-6 py-4 whitespace-nowrap ${record.gain > 0 ? 'text-emerald-600' : record.gain < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {record.gain ? formatCurrency(record.gain) : '-'}
                  </td>}
                  {isVisible('income') && <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{record.income ? formatCurrency(record.income) : '-'}</td>}
                  {isVisible('cashTotal') && <td className="px-6 py-4 font-medium text-blue-700 bg-blue-50/30 whitespace-nowrap">{formatCurrency(record.cash.total)}</td>}
                  {isVisible('hsbc') && <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatCurrency(record.cash.hsbc)}</td>}
                  {isVisible('citi') && <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatCurrency(record.cash.citi)}</td>}
                  {isVisible('other') && <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatCurrency(record.cash.other)}</td>}
                  {isVisible('invTotal') && <td className="px-6 py-4 font-medium text-indigo-700 bg-indigo-50/30 whitespace-nowrap">{formatCurrency(record.investment.total)}</td>}
                  {isVisible('sofi') && <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatCurrency(record.investment.sofi)}</td>}
                  {isVisible('binance') && <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatCurrency(record.investment.binance)}</td>}
                  {isVisible('yen') && <td className="px-6 py-4 text-rose-600 whitespace-nowrap">{formatCurrency(record.yen)}</td>}
                  {isVisible('mpf') && <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{formatCurrency(record.mpf)}</td>}
                  <td className="px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-50">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => onEdit(record)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                        title="Edit Record"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(record.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                        title="Delete Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
