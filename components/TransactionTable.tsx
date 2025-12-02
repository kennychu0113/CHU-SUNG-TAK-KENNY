import React, { useState } from 'react';
import { FinanceRecord, AppSettings, Account } from '../types';
import { formatCurrency, formatDate, getAccountTotal } from '../utils/helpers';
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

  // Calculate latest net worth
  const latestRecord = data.length > 0 ? data[data.length - 1] : null;
  const currentNetWorth = latestRecord ? latestRecord.totalAssets : 0;

  const toggleColumn = (key: string) => {
    setHiddenColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isVisible = (key: string) => !hiddenColumns.includes(key);

  const renderAccountColumns = (type: 'cash' | 'investment' | 'other', colorClass: string) => {
      return settings.accounts
        .filter(acc => acc.type === type)
        .map(acc => (
            isVisible(acc.id) && (
                <td key={acc.id} className={`px-6 py-4 whitespace-nowrap ${colorClass}`}>
                    {/* We need to handle the case where a record might be old and missing this new account key */}
                     {/* However, the AddForm ensures keys are present. For backward comp, check undefined */}
                    {formatCurrency(latestRecord ? 0 : 0) /* Just for type safety in map, actual render is below */}
                </td>
            )
      ));
  };

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
           <h3 className="text-lg font-bold text-slate-800">History Log</h3>
           <div className="flex items-center gap-3 text-sm mt-1">
                <span className="text-xs text-slate-500 font-medium">{data.length} records found</span>
           </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showColumnMenu ? 'bg-slate-100 text-slate-900 border border-slate-300' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Settings2 size={16} />
            <span>Customize Columns</span>
          </button>

          {showColumnMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 max-h-[400px] overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-30 grid grid-cols-1 gap-1 animate-in fade-in zoom-in-95 duration-200">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Visible Columns</h4>
               
               {['totalAssets', 'gain', 'income', 'cashTotal', 'invTotal', 'mpf'].map(key => (
                   <button key={key} onClick={() => toggleColumn(key)} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-50 text-left text-sm text-slate-700">
                       <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                       {isVisible(key) && <Check size={14} className="text-emerald-600" />}
                   </button>
               ))}
               
               <div className="my-1 border-t border-slate-100"></div>
               
               {settings.accounts.map(acc => (
                 <button
                   key={acc.id}
                   onClick={() => toggleColumn(acc.id)}
                   className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-50 text-left text-sm text-slate-700"
                 >
                   <span className="truncate max-w-[180px]">{acc.name}</span>
                   {isVisible(acc.id) && <Check size={14} className="text-emerald-600" />}
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
                <th className="px-6 py-4 font-bold whitespace-nowrap sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Date</th>
                {isVisible('totalAssets') && <th className="px-6 py-4 font-bold text-emerald-600 whitespace-nowrap">Net Worth</th>}
                {isVisible('gain') && <th className="px-6 py-4 font-bold whitespace-nowrap">Gain/Loss</th>}
                {isVisible('income') && <th className="px-6 py-4 font-bold whitespace-nowrap">Income</th>}
                
                {/* Cash Group */}
                {isVisible('cashTotal') && <th className="px-6 py-4 font-bold text-blue-600 whitespace-nowrap">Total Cash</th>}
                {settings.accounts.filter(a => a.type === 'cash').map(acc => 
                    isVisible(acc.id) && <th key={acc.id} className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">{acc.name}</th>
                )}

                {/* Investment Group */}
                {isVisible('invTotal') && <th className="px-6 py-4 font-bold text-indigo-600 whitespace-nowrap">Total Inv.</th>}
                {settings.accounts.filter(a => a.type === 'investment').map(acc => 
                    isVisible(acc.id) && <th key={acc.id} className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">{acc.name}</th>
                )}

                {/* Other Group */}
                {settings.accounts.filter(a => a.type === 'other').map(acc => 
                    isVisible(acc.id) && <th key={acc.id} className="px-6 py-4 font-medium text-rose-600 whitespace-nowrap">{acc.name}</th>
                )}

                {isVisible('mpf') && <th className="px-6 py-4 font-bold whitespace-nowrap">MPF</th>}
                <th className="px-6 py-4 font-bold text-center sticky right-0 bg-slate-50 z-10 border-l border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.slice().reverse().map((record) => {
                  const cashTotal = getAccountTotal(record, settings.accounts, 'cash');
                  const invTotal = getAccountTotal(record, settings.accounts, 'investment');

                  return (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-50 shadow-[4px_0_4px_-2px_rgba(0,0,0,0.05)]">
                        {formatDate(record.date)}
                    </td>
                    {isVisible('totalAssets') && <td className="px-6 py-4 font-bold text-emerald-700 whitespace-nowrap">{formatCurrency(record.totalAssets)}</td>}
                    {isVisible('gain') && <td className={`px-6 py-4 whitespace-nowrap ${record.gain > 0 ? 'text-emerald-600' : record.gain < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {record.gain ? formatCurrency(record.gain) : '-'}
                    </td>}
                    {isVisible('income') && <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{record.income ? formatCurrency(record.income) : '-'}</td>}
                    
                    {/* Cash */}
                    {isVisible('cashTotal') && <td className="px-6 py-4 font-medium text-blue-700 bg-blue-50/30 whitespace-nowrap">{formatCurrency(cashTotal)}</td>}
                    {settings.accounts.filter(a => a.type === 'cash').map(acc => 
                        isVisible(acc.id) && <td key={acc.id} className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatCurrency(record.values[acc.id])}</td>
                    )}

                    {/* Investments */}
                    {isVisible('invTotal') && <td className="px-6 py-4 font-medium text-indigo-700 bg-indigo-50/30 whitespace-nowrap">{formatCurrency(invTotal)}</td>}
                    {settings.accounts.filter(a => a.type === 'investment').map(acc => 
                        isVisible(acc.id) && <td key={acc.id} className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatCurrency(record.values[acc.id])}</td>
                    )}

                    {/* Other */}
                    {settings.accounts.filter(a => a.type === 'other').map(acc => 
                        isVisible(acc.id) && <td key={acc.id} className="px-6 py-4 text-rose-600 whitespace-nowrap">{formatCurrency(record.values[acc.id])}</td>
                    )}

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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;