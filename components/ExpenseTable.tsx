import React, { useState, useMemo } from 'react';
import { ExpenseRecord } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Trash2, Settings2, Check, Plus, Pencil, Utensils, Bus, ShoppingBag, Zap, Film, Home, HeartPulse, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, LayoutList, Search, Filter } from 'lucide-react';

interface ExpenseTableProps {
  data: ExpenseRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: ExpenseRecord) => void;
  onAdd: () => void;
}

type SortKey = keyof Pick<ExpenseRecord, 'amount' | 'category' | 'item' | 'note'>;

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
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Generate unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
      const cats = new Set(data.map(d => d.category));
      return ['All', ...Array.from(cats).sort()];
  }, [data]);

  // Filter logic
  const filteredData = useMemo(() => {
      return data.filter(record => {
          const matchesSearch = record.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (record.note && record.note.toLowerCase().includes(searchTerm.toLowerCase()));
          const matchesCategory = filterCategory === 'All' || record.category === filterCategory;
          return matchesSearch && matchesCategory;
      });
  }, [data, searchTerm, filterCategory]);

  // Calculate total based on FILTERED data
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);

  const toggleColumn = (key: string) => {
    setHiddenColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSort = (key: SortKey) => {
      setSortConfig(current => {
          if (current?.key === key) {
              // Toggle direction: asc -> desc -> asc
              return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
          }
          // Default to descending for Amount, ascending for text
          const defaultDirection = key === 'amount' ? 'desc' : 'asc';
          return { key, direction: defaultDirection };
      });
      setShowSortMenu(false);
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === undefined || bVal === undefined) return 0;
      if (aVal === bVal) return 0;

      // Type-safe comparison
      const comparison = aVal > bVal ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  const isVisible = (key: string) => !hiddenColumns.includes(key);

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
      if (sortConfig?.key !== columnKey) return <ArrowUpDown size={14} className="opacity-30" />;
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-emerald-600" /> : <ArrowDown size={14} className="text-emerald-600" />;
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: 'category', label: 'Category' },
    { key: 'item', label: 'Item' },
    { key: 'amount', label: 'Amount' },
    { key: 'note', label: 'Note' },
  ];

  return (
    <div className="space-y-4">
      {/* Sticky Header with Totals, Filters, and Actions */}
      <div className="sticky top-0 z-20 bg-white rounded-xl shadow-sm border border-slate-100 overflow-visible">
          
          {/* Top Row: Totals and Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-between items-center p-4 border-b border-slate-50">
            <div>
               <h3 className="text-lg font-semibold text-slate-800">Recurring Expenses</h3>
               <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-rose-600">{formatCurrency(totalAmount)}</span>
                        <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200"></div>
                    <span className="text-xs text-slate-500">{filteredData.length} items {filteredData.length !== data.length && '(filtered)'}</span>
               </div>
            </div>
            <div className="flex gap-2">
               {/* Mobile Sort Button */}
               <div className="relative md:hidden">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortConfig ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                  >
                     <ArrowUpDown size={16} />
                  </button>
                  {showSortMenu && (
                     <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-30 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">Sort By</h4>
                        <button onClick={() => handleSort('amount')} className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-slate-50 text-left text-sm text-slate-700">
                            <span>Amount</span>
                            <SortIcon columnKey="amount" />
                        </button>
                        <button onClick={() => handleSort('category')} className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-slate-50 text-left text-sm text-slate-700">
                            <span>Category</span>
                            <SortIcon columnKey="category" />
                        </button>
                        <button onClick={() => handleSort('item')} className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-slate-50 text-left text-sm text-slate-700">
                            <span>Item Name</span>
                            <SortIcon columnKey="item" />
                        </button>
                     </div>
                  )}
               </div>

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

          {/* Bottom Row: Search and Filters */}
          <div className="px-4 py-3 bg-slate-50/50 flex flex-col md:flex-row gap-3 border-t border-slate-100">
             <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
                 />
             </div>
             <div className="relative min-w-[160px]">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer text-slate-700"
                 >
                    {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                     <ArrowUpDown size={12} />
                 </div>
             </div>
          </div>
      </div>

      {/* MOBILE LIST VIEW - Use sorted data here too */}
      <div className="md:hidden space-y-3">
          {showSortMenu && <div className="fixed inset-0 z-20" onClick={() => setShowSortMenu(false)} />}
          
          {sortConfig && (
              <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
                  <span className="font-semibold">Sorted by:</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      {columns.find(c => c.key === sortConfig.key)?.label}
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                  <button onClick={() => setSortConfig(null)} className="text-slate-400 hover:text-slate-600 underline">Reset</button>
              </div>
          )}

          {sortedData.map((record) => (
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
          {sortedData.length === 0 && (
             <div className="text-center p-8 text-slate-400 text-sm">
                 {data.length === 0 ? "No expenses added yet." : "No expenses match your search."}
             </div>
          )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
        {showColumnMenu && <div className="fixed inset-0 z-20" onClick={() => setShowColumnMenu(false)} />}
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                {isVisible('amount') && (
                    <th 
                        className="px-6 py-4 font-medium whitespace-nowrap text-rose-600 cursor-pointer hover:bg-slate-100 transition-colors group"
                        onClick={() => handleSort('amount')}
                    >
                        <div className="flex items-center gap-2">
                            Amount <SortIcon columnKey="amount" />
                        </div>
                    </th>
                )}
                {isVisible('category') && (
                    <th 
                        className="px-6 py-4 font-medium whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors group"
                        onClick={() => handleSort('category')}
                    >
                        <div className="flex items-center gap-2">
                            Type <SortIcon columnKey="category" />
                        </div>
                    </th>
                )}
                {isVisible('item') && (
                    <th 
                        className="px-6 py-4 font-medium whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors group"
                        onClick={() => handleSort('item')}
                    >
                         <div className="flex items-center gap-2">
                            Item <SortIcon columnKey="item" />
                        </div>
                    </th>
                )}
                {isVisible('note') && (
                     <th 
                        className="px-6 py-4 font-medium whitespace-nowrap text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors group"
                        onClick={() => handleSort('note')}
                    >
                         <div className="flex items-center gap-2">
                            Note <SortIcon columnKey="note" />
                        </div>
                    </th>
                )}
                <th className="px-6 py-4 font-medium text-center sticky right-0 bg-slate-50 z-10 border-l border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedData.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                  {isVisible('amount') && <td className="px-6 py-4 font-bold text-rose-600 text-base whitespace-nowrap">{formatCurrency(record.amount)}</td>}
                  {isVisible('category') && <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-2" title={record.category}>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <CategoryIcon category={record.category} />
                        </div>
                        {record.category}
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
              {sortedData.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        {data.length === 0 ? "No expenses recorded yet." : "No expenses match your search."}
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