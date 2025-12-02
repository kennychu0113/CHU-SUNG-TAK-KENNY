import React, { useState, useEffect } from 'react';
import { ExpenseRecord, AppSettings } from '../types';
import { Save, X } from 'lucide-react';

interface AddExpenseFormProps {
  onAdd: (record: ExpenseRecord) => void;
  onCancel: () => void;
  initialData?: ExpenseRecord | null;
  settings: AppSettings;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onAdd, onCancel, initialData, settings }) => {
  const [category, setCategory] = useState(settings.expenseCategories[0] || 'Food');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Fallback if settings.expenseCategories is empty for some reason
  const categories = settings.expenseCategories.length > 0 ? settings.expenseCategories : ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Other'];

  const formatValue = (val: string | number) => {
    if (val === '' || val === undefined || val === null) return '';
    const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    if (initialData) {
        setCategory(initialData.category);
        setItem(initialData.item);
        setAmount(formatValue(initialData.amount));
        setNote(initialData.note || '');
    } else {
        // Reset category to first default when adding new
        setCategory(categories[0]);
        setAmount('');
    }
  }, [initialData, categories]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits, dots and commas
    if (/^[\d,.]*$/.test(val)) {
        setAmount(val);
    }
  };

  const handleAmountBlur = () => {
      // Format on blur
      if (amount) {
          const clean = amount.replace(/,/g, '');
          const num = parseFloat(clean);
          if (!isNaN(num)) {
              setAmount(formatValue(num));
          }
      }
  };

  const handleAmountFocus = () => {
      // Strip formatting for easy editing
      if (amount) {
          const clean = amount.replace(/,/g, '');
          const num = parseFloat(clean);
          if (!isNaN(num)) {
             setAmount(num.toString());
          }
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount.replace(/,/g, '')) || 0;
    
    const newRecord: ExpenseRecord = {
      id: initialData ? initialData.id : `exp-${Date.now()}`,
      category,
      item: item || 'Expense',
      amount: cleanAmount,
      note
    };
    onAdd(newRecord);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-100 max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Recurring Expense' : 'Add Monthly Expense'}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Category</label>
            <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>

        <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Item Name</label>
            <input 
                type="text" 
                value={item} 
                onChange={e => setItem(e.target.value)}
                placeholder="e.g. Spotify Subscription"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
            />
        </div>

        <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Monthly Cost</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    onBlur={handleAmountBlur}
                    onFocus={handleAmountFocus}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium text-slate-700"
                    required
                />
            </div>
        </div>

        <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Note (Optional)</label>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
        </div>

        <div className="pt-4 flex justify-end gap-3">
            <button 
                type="button" 
                onClick={onCancel}
                className="px-6 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-8 rounded-lg shadow-md shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
            >
                <Save size={18} />
                {initialData ? 'Update' : 'Save'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpenseForm;