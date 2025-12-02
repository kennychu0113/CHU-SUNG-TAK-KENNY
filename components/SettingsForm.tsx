import React, { useState, useRef, useEffect } from 'react';
import { AppSettings, FinanceRecord, ExpenseRecord, Account, AccountType, BackupData } from '../types';
import { Save, Download, FileSpreadsheet, Trash2, AlertTriangle, Database, Plus, X, Wallet, TrendingUp, Globe, Upload, HardDriveDownload, Copy, Clipboard, ArrowRight, ChevronDown, ChevronUp, Sliders, ShieldCheck, Smartphone } from 'lucide-react';
import { downloadCSV } from '../utils/helpers';

interface SettingsFormProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  data: FinanceRecord[];
  expenses: ExpenseRecord[];
  onLoadSampleData: () => void;
  onRestore: (data: BackupData) => void;
}

const SettingsCard = ({ 
    title, 
    icon: Icon, 
    children, 
    defaultOpen = false,
    danger = false
}: { 
    title: string, 
    icon?: any, 
    children?: React.ReactNode, 
    defaultOpen?: boolean,
    danger?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`rounded-xl shadow-sm border overflow-hidden transition-all ${
            danger 
                ? 'bg-red-50 border-red-100' 
                : 'bg-white border-slate-100 shadow-lg'
        }`}>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-6 text-left transition-colors ${
                    danger ? 'hover:bg-red-100/50' : 'hover:bg-slate-50'
                }`}
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className={danger ? "text-red-600" : "text-slate-500"} size={24} />}
                    <h2 className={`text-xl font-bold ${danger ? 'text-red-800' : 'text-slate-800'}`}>{title}</h2>
                </div>
                {isOpen ? <ChevronUp className={danger ? "text-red-400" : "text-slate-400"} /> : <ChevronDown className={danger ? "text-red-400" : "text-slate-400"} />}
            </button>
            
            {isOpen && (
                <div className={`p-6 md:p-8 border-t animate-in slide-in-from-top-2 duration-200 ${
                    danger ? 'border-red-200/50' : 'border-slate-100'
                }`}>
                    {children}
                </div>
            )}
        </div>
    );
};

// Extracted to prevent re-rendering/focus loss issues
const AccountSection = ({ 
    type, 
    title, 
    icon: Icon, 
    colorClass, 
    bgClass,
    accounts,
    onRename,
    onDelete
}: { 
    type: AccountType, 
    title: string, 
    icon: any, 
    colorClass: string, 
    bgClass: string,
    accounts: Account[],
    onRename: (id: string, val: string) => void,
    onDelete: (id: string) => void
}) => (
     <div className="space-y-3">
        <h3 className={`text-sm font-bold ${colorClass} uppercase tracking-wide ${bgClass} p-2 rounded-lg flex items-center gap-2`}>
            <Icon size={16} /> {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {accounts.filter(a => a.type === type).map(acc => (
                <div key={acc.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <input 
                        type="text" 
                        value={acc.name} 
                        onChange={(e) => onRename(acc.id, e.target.value)}
                        className="flex-1 bg-transparent border-none text-sm focus:ring-0 text-slate-700 font-medium"
                    />
                    <button type="button" onClick={() => onDelete(acc.id)} className="text-slate-400 hover:text-rose-500 p-1">
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
     </div>
);

const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onSave, data, expenses, onLoadSampleData, onRestore }) => {
  const [categories, setCategories] = useState<string[]>(settings.expenseCategories || []);
  const [newCategory, setNewCategory] = useState('');
  
  // Accounts State
  const [accounts, setAccounts] = useState<Account[]>(settings.accounts || []);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<AccountType>('cash');

  // Text Import State
  const [showTextImport, setShowTextImport] = useState(false);
  const [importString, setImportString] = useState('');

  // Storage Stats
  const [storageSize, setStorageSize] = useState<string>('0 KB');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      // Calculate local storage usage
      let total = 0;
      for (let x in localStorage) {
          if (localStorage.hasOwnProperty(x)) {
              total += ((localStorage[x].length + x.length) * 2);
          }
      }
      setStorageSize((total / 1024).toFixed(2) + ' KB');
  }, [data, expenses, settings]);

  const handleAddCategory = () => {
      if (newCategory.trim()) {
          if (!categories.includes(newCategory.trim())) {
              setCategories([...categories, newCategory.trim()]);
              setNewCategory('');
          } else {
              alert('Category already exists');
          }
      }
  };

  const handleDeleteCategory = (cat: string) => {
      if (window.confirm(`Delete category "${cat}"?`)) {
          setCategories(categories.filter(c => c !== cat));
      }
  };

  const handleAddAccount = () => {
    if (newAccountName.trim()) {
        const id = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        setAccounts([...accounts, { id, name: newAccountName.trim(), type: newAccountType }]);
        setNewAccountName('');
    }
  };

  const handleDeleteAccount = (id: string) => {
      if (window.confirm('Delete this account column? Historical data associated with this column ID will be hidden but not deleted from raw records.')) {
          setAccounts(accounts.filter(a => a.id !== id));
      }
  };
  
  const handleRenameAccount = (id: string, newName: string) => {
      setAccounts(accounts.map(a => a.id === id ? { ...a, name: newName } : a));
  };

  const handleClearAllData = () => {
      if (window.confirm('Are you absolutely sure? This will delete ALL your assets and expenses history. This action cannot be undone.')) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ accounts, expenseCategories: categories });
  };

  const handleExportAssets = () => {
    // Generate header based on current accounts
    const accountHeaders = accounts.map(a => a.name).join(',');
    const header = `Date,Total Assets,Gain,Income,MPF,${accountHeaders}`;
    
    const rows = data.map(r => {
        const accountValues = accounts.map(a => r.values[a.id] || 0).join(',');
        return `${r.date},${r.totalAssets},${r.gain},${r.income},${r.mpf},${accountValues}`;
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

  const getBackupObject = () => {
      return {
          version: 1,
          timestamp: new Date().toISOString(),
          assets: data,
          expenses: expenses,
          settings: { accounts, expenseCategories: categories } // Save current UI state
      };
  };

  const handleBackup = () => {
      const backup = getBackupObject();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `WealthTrack_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (window.confirm(`Restore data from backup created on ${new Date(json.timestamp).toLocaleString()}? This will overwrite current data.`)) {
                  onRestore(json);
              }
          } catch (error) {
              alert("Invalid backup file.");
          }
          // Reset input
          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsText(file);
  };

  const handleCopyToClipboard = () => {
      const backup = getBackupObject();
      const jsonString = JSON.stringify(backup);
      // Encode to Base64 with Unicode support
      try {
          const encoded = btoa(unescape(encodeURIComponent(jsonString)));
          navigator.clipboard.writeText(encoded).then(() => {
              alert("Data copied to clipboard! You can paste this into the 'Load Data' box on another device.");
          });
      } catch (e) {
          alert("Failed to encode data. It might be too large.");
      }
  };

  const handleImportFromText = () => {
      try {
          if (!importString) return;
          // Decode from Base64 with Unicode support
          const decoded = decodeURIComponent(escape(atob(importString)));
          const json = JSON.parse(decoded);
          
          if (json && json.assets) {
               if (window.confirm(`Restore data from backup created on ${new Date(json.timestamp).toLocaleString()}? This will overwrite current data.`)) {
                  onRestore(json);
                  setImportString('');
                  setShowTextImport(false);
              }
          } else {
              throw new Error("Invalid structure");
          }
      } catch (e) {
          alert("Invalid data code. Please ensure you copied the entire string.");
      }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-300 space-y-5 pb-12">
      
      {/* Settings Section */}
      <SettingsCard title="App Configuration" icon={Sliders} defaultOpen={true}>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Account Management */}
          <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <div className="flex-1">
                       <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">New Account Name</label>
                       <input 
                            type="text"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            placeholder="e.g. Crypto Wallet, Safe"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50"
                       />
                   </div>
                   <div className="w-full md:w-40">
                       <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type</label>
                       <select 
                            value={newAccountType}
                            onChange={(e) => setNewAccountType(e.target.value as AccountType)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50"
                       >
                           <option value="cash">Cash</option>
                           <option value="investment">Investment</option>
                           <option value="other">Other</option>
                       </select>
                   </div>
                   <button 
                        type="button" 
                        onClick={handleAddAccount}
                        disabled={!newAccountName.trim()}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2"
                   >
                        <Plus size={16} /> Add
                   </button>
              </div>

              <AccountSection 
                type="cash" 
                title="Cash Accounts" 
                icon={Wallet} 
                colorClass="text-blue-700" 
                bgClass="bg-blue-50"
                accounts={accounts}
                onRename={handleRenameAccount}
                onDelete={handleDeleteAccount}
              />
              <AccountSection 
                type="investment" 
                title="Investment Accounts" 
                icon={TrendingUp} 
                colorClass="text-indigo-700" 
                bgClass="bg-indigo-50"
                accounts={accounts}
                onRename={handleRenameAccount}
                onDelete={handleDeleteAccount}
              />
              <AccountSection 
                type="other" 
                title="Other Assets (Currencies, etc)" 
                icon={Globe} 
                colorClass="text-rose-700" 
                bgClass="bg-rose-50"
                accounts={accounts}
                onRename={handleRenameAccount}
                onDelete={handleDeleteAccount}
              />
          </div>

          <div className="border-t border-slate-100 my-4"></div>

          {/* Expense Categories */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide bg-slate-50 p-2 rounded-lg">Expense Categories</h3>
             <div className="flex gap-2">
                 <input 
                    type="text" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50"
                 />
                 <button 
                    type="button" 
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                    className="bg-emerald-600 text-white px-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <Plus size={20} />
                 </button>
             </div>
             <div className="flex flex-wrap gap-2">
                 {categories.map(cat => (
                     <div key={cat} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700">
                         <span>{cat}</span>
                         <button 
                            type="button" 
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-slate-400 hover:text-rose-500"
                         >
                             <X size={14} />
                         </button>
                     </div>
                 ))}
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
      </SettingsCard>

      {/* Quick Transfer Section */}
      <SettingsCard title="Quick Device Transfer" icon={ArrowRight}>
         <p className="text-sm text-slate-500 mb-6">
             Easily move your data between Phone and Computer without downloading files.
             Copy the code from one device and paste it into the other.
         </p>

         <div className="space-y-4">
             {!showTextImport ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={handleCopyToClipboard}
                        className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-all group"
                    >
                        <Copy size={32} className="text-slate-400 group-hover:text-violet-600 mb-2 transition-colors" />
                        <span className="font-semibold text-slate-700 group-hover:text-violet-800">Copy Data Code</span>
                        <span className="text-xs text-slate-400 mt-1">Export to Clipboard</span>
                    </button>
                    
                    <button 
                        onClick={() => setShowTextImport(true)}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-all group"
                    >
                        <Clipboard size={32} className="text-slate-400 group-hover:text-violet-600 mb-2 transition-colors" />
                        <span className="font-semibold text-slate-700 group-hover:text-violet-800">Paste Data Code</span>
                        <span className="text-xs text-slate-400 mt-1">Import from Clipboard</span>
                    </button>
                </div>
             ) : (
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95">
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Paste your data code here</label>
                     <textarea 
                        value={importString}
                        onChange={e => setImportString(e.target.value)}
                        className="w-full h-32 p-3 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/50 mb-3"
                        placeholder="Paste the code you copied from your other device..."
                     ></textarea>
                     <div className="flex gap-2 justify-end">
                         <button 
                            onClick={() => setShowTextImport(false)}
                            className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg text-sm font-medium"
                         >
                             Cancel
                         </button>
                         <button 
                            onClick={handleImportFromText}
                            disabled={!importString}
                            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                         >
                             Load Data
                         </button>
                     </div>
                 </div>
             )}
         </div>
      </SettingsCard>

      {/* Backup & Restore Section */}
      <SettingsCard title="File Backup & Restore" icon={HardDriveDownload}>
         <p className="text-sm text-slate-500 mb-6">
             Save your portfolio to a JSON file. Useful for long-term storage or backups.
         </p>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={handleBackup}
                className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
                <Download size={32} className="text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                <span className="font-semibold text-slate-700 group-hover:text-blue-800">Download Backup File</span>
            </button>
            
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group cursor-pointer"
            >
                <Upload size={32} className="text-slate-400 group-hover:text-emerald-600 mb-2 transition-colors" />
                <span className="font-semibold text-slate-700 group-hover:text-emerald-800">Restore from File</span>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".json" 
                    className="hidden" 
                />
            </div>
         </div>
      </SettingsCard>

      {/* CSV Export Section */}
      <SettingsCard title="Export Data to CSV" icon={FileSpreadsheet}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={handleExportAssets}
                className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
                <FileSpreadsheet size={32} className="text-slate-400 group-hover:text-emerald-600 mb-2 transition-colors" />
                <span className="font-semibold text-slate-700 group-hover:text-emerald-800">Export Assets CSV</span>
            </button>
             <button 
                onClick={handleExportExpenses}
                className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-all group"
            >
                <FileSpreadsheet size={32} className="text-slate-400 group-hover:text-rose-600 mb-2 transition-colors" />
                <span className="font-semibold text-slate-700 group-hover:text-rose-800">Export Expenses CSV</span>
            </button>
         </div>

         {/* Load Sample Data */}
         <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
                    <h3 className="text-sm font-bold text-slate-800">Need sample data?</h3>
                    <p className="text-xs text-slate-500 mt-1">Reset and populate with demo records.</p>
            </div>
            <button 
                onClick={onLoadSampleData}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200"
            >
                <Database size={16} />
                Load Demo Data
            </button>
         </div>
      </SettingsCard>

      {/* Privacy & Storage Info */}
      <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 flex flex-col md:flex-row items-start md:items-center gap-4">
         <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
            <ShieldCheck size={24} />
         </div>
         <div className="flex-1">
            <h3 className="text-base font-bold text-emerald-900">Your Data is Private & Secure</h3>
            <p className="text-sm text-emerald-700 mt-1">
                This app runs entirely in your browser. No data is sent to the cloud. 
                Everything is stored in a private "Local Database" on this specific device.
            </p>
         </div>
         <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-emerald-200/50 shadow-sm">
             <Smartphone size={16} className="text-slate-400" />
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Local Storage</span>
                <span className="text-sm font-bold text-slate-700">{storageSize}</span>
             </div>
         </div>
      </div>

      {/* Danger Zone */}
      <SettingsCard title="Danger Zone" icon={AlertTriangle} danger={true}>
         <p className="text-sm text-red-700 mb-4">
            Delete all data and reset the application to its factory state. 
            This will remove all your asset records and expenses from this device.
        </p>
        <button 
            onClick={handleClearAllData}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
        >
            <Trash2 size={18} />
            Clear All Data
        </button>
      </SettingsCard>

    </div>
  );
};

export default SettingsForm;