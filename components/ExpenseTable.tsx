import React, { useState } from 'react';
import { ExpenseRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Trash2, Settings2, Check, Plus, Pencil } from 'lucide-react';

interface ExpenseTableProps {
  data: ExpenseRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: ExpenseRecord) => void;
  onAdd: () => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ data, onDelete, onEdit, onAdd }) => {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const toggleColumn = (key: string) => {
    setHiddenColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isVisible = (key: string) => !hiddenColumns.includes(key);

  const columns = [
    { key: 'category', label: 'Category' },
    { key: 'item', label: 'Item' },
    { key: 'amount', label: 'Amount' },
    { key: 'note', label: 'Note' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
           <h3 className="text-lg font-semibold text-slate-800">Expense List</h3>
           <span className="text-xs text-slate-500">{data.length} transactions</span>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={onAdd}
             className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
           >
             <Plus size={16} />
             <span>Add Expense</span>
           </button>
           <div className="relative">
            <button 
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showColumnMenu ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
            >
                <Settings2 size={16} />
            </button>

            {showColumnMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-30 grid grid-cols-1 gap-1 animate-in fade-in zoom-in-95 duration-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">Columns</h4>
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
        {showColumnMenu && <div className="fixed inset-0 z-20" onClick={() => setShowColumnMenu(false)} />}
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium whitespace-nowrap sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Date</th>
                {isVisible('category') && <th className="px-6 py-4 font-medium whitespace-nowrap">Category</th>}
                {isVisible('item') && <th className="px-6 py-4 font-medium whitespace-nowrap">Item</th>}
                {isVisible('amount') && <th className="px-6 py-4 font-medium whitespace-nowrap text-rose-600">Amount</th>}
                {isVisible('note') && <th className="px-6 py-4 font-medium whitespace-nowrap text-slate-400">Note</th>}
                <th className="px-6 py-4 font-medium text-center sticky right-0 bg-slate-50 z-10 border-l border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.slice().reverse().map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-50">
                    {formatDate(record.date)}
                  </td>
                  {isVisible('category') && <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium">{record.category}</span>
                  </td>}
                  {isVisible('item') && <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{record.item}</td>}
                  {isVisible('amount') && <td className="px-6 py-4 font-bold text-rose-600 whitespace-nowrap">{formatCurrency(record.amount)}</td>}
                  {isVisible('note') && <td className="px-6 py-4 text-slate-400 italic whitespace-nowrap">{record.note || '-'}</td>}
                  <td className="px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-50">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => onEdit(record)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                        title="Edit Expense"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(record.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                        title="Delete Expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No expenses recorded yet.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTable;
