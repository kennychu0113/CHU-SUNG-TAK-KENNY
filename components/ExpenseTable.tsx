import React, { useState } from 'react';
import { ExpenseRecord } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Trash2, Settings2, Check, Plus, Pencil, Utensils, Bus, ShoppingBag, Zap, Film, Home, HeartPulse, MoreHorizontal } from 'lucide-react';

interface ExpenseTableProps {
  data: ExpenseRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: ExpenseRecord) => void;
  onAdd: () => void;
}

const CategoryIcon = ({ category }: { category: string }) => {
    switch (category.toLowerCase()) {
        case 'food': return <Utensils size={18} />;
        case 'transport': return <Bus size={18} />;
        case 'shopping': return <ShoppingBag size={18} />;
        case 'utilities': return <Zap size={18} />;
        case 'entertainment': return <Film size={18} />;
        case 'rent': 
        case 'housing': return <Home size={18} />;
        case 'health': return <HeartPulse size={18} />;
        default: return <MoreHorizontal size={18} />;
    }
};

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
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky top-0 z-20">
        <div>
           <h3 className="text-lg font-semibold text-slate-800">Recurring Expenses</h3>
           <span className="text-xs text-slate-500">{data.length} items</span>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={onAdd}
             className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
           >
             <Plus size={16} />
             <span className="hidden md:inline">Add Expense</span>
             <span className="md:hidden">Add</span>
           </button>
           <div className="relative hidden md:block">
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

      {/* MOBILE LIST VIEW */}
      <div className="md:hidden space-y-3">
          {data.map((record) => (
             <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                        <CategoryIcon category={record.category} />
                    </div>
                    <div>
                        <div className="font-bold text-lg text-rose-600 leading-tight">
                            {formatCurrency(record.amount)}
                        </div>
                        <div className="text-sm font-medium text-slate-700">{record.item}</div>
                        {record.note && <div className="text-xs text-slate-400">{record.note}</div>}
                    </div>
                </div>
                <div className="flex flex-col gap-1 pl-2">
                     <button onClick={() => onEdit(record)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                        <Pencil size={18} />
                     </button>
                     <button onClick={() => onDelete(record.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full">
                        <Trash2 size={18} />
                     </button>
                </div>
             </div>
          ))}
          {data.length === 0 && (
             <div className="text-center p-8 text-slate-400 text-sm">No expenses added yet.</div>
          )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
        {showColumnMenu && <div className="fixed inset-0 z-20" onClick={() => setShowColumnMenu(false)} />}
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                {isVisible('amount') && <th className="px-6 py-4 font-medium whitespace-nowrap text-rose-600">Amount</th>}
                {isVisible('category') && <th className="px-6 py-4 font-medium whitespace-nowrap">Type</th>}
                {isVisible('item') && <th className="px-6 py-4 font-medium whitespace-nowrap">Item</th>}
                {isVisible('note') && <th className="px-6 py-4 font-medium whitespace-nowrap text-slate-400">Note</th>}
                <th className="px-6 py-4 font-medium text-center sticky right-0 bg-slate-50 z-10 border-l border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                  {isVisible('amount') && <td className="px-6 py-4 font-bold text-rose-600 text-base whitespace-nowrap">{formatCurrency(record.amount)}</td>}
                  {isVisible('category') && <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-2" title={record.category}>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <CategoryIcon category={record.category} />
                        </div>
                    </div>
                  </td>}
                  {isVisible('item') && <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{record.item}</td>}
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
