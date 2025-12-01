import React, { useState, useEffect } from 'react';
import { ExpenseRecord } from '../types';
import { Save, X } from 'lucide-react';

interface AddExpenseFormProps {
  onAdd: (record: ExpenseRecord) => void;
  onCancel: () => void;
  initialData?: ExpenseRecord | null;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onAdd, onCancel, initialData }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Food');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const categories = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Housing', 'Health', 'Other'];

  useEffect(() => {
    if (initialData) {
        const dateObj = new Date(initialData.date);
        if (!isNaN(dateObj.getTime())) {
             setDate(dateObj.toISOString().split('T')[0]);
        }
        setCategory(initialData.category);
        setItem(initialData.item);
        setAmount(initialData.amount.toString());
        setNote(initialData.note || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: ExpenseRecord = {
      id: initialData ? initialData.id : `exp-${Date.now()}`,
      date: date.replace(/-/g, '/'),
      category,
      item: item || 'Expense',
      amount: parseFloat(amount) || 0,
      note
    };
    onAdd(newRecord);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-100 max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Expense' : 'Log New Expense'}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Date</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                />
            </div>
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
        </div>

        <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Item / Description</label>
            <input 
                type="text" 
                value={item} 
                onChange={e => setItem(e.target.value)}
                placeholder="e.g. Lunch with team"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
            />
        </div>

        <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Amount</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    required
                />
            </div>
        </div>

        <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Note (Optional)</label>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
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
                {initialData ? 'Update Expense' : 'Save Expense'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpenseForm;
