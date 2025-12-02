import React, { useState, useEffect } from 'react';
import { FinanceRecord, AppSettings, Account } from '../types';
import { Save, Calculator, RefreshCw, Wallet, TrendingUp, Globe, DollarSign } from 'lucide-react';
import { getAccountTotal } from '../utils/helpers';

interface AddEntryFormProps {
  onAdd: (record: FinanceRecord) => void;
  lastRecord?: FinanceRecord;
  settings: AppSettings;
  initialData?: FinanceRecord | null;
}

interface InputGroupProps {
  label: string;
  value: number | string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col group">
    <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide truncate group-hover:text-slate-700 transition-colors" title={label}>{label}</label>
    <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
        <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "0"}
        className="w-full pl-7 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-400 transition-all font-medium text-slate-700"
        />
    </div>
  </div>
);

const SectionHeader = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <div className="col-span-full border-b border-slate-100 pb-3 mt-4 mb-2 flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${color}`}>
            <Icon size={16} />
        </div>
        <h4 className="text-base font-bold text-slate-800">{title}</h4>
    </div>
);

const AddEntryForm: React.FC<AddEntryFormProps> = ({ onAdd, lastRecord, settings, initialData }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Dynamic state: accountId -> value string
  const [accountValues, setAccountValues] = useState<Record<string, string>>({});
  
  const [income, setIncome] = useState<string>('');
  const [mpf, setMpf] = useState<string>('');

  // Auto-calculated totals
  const [cashTotal, setCashTotal] = useState(0);
  const [invTotal, setInvTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [gain, setGain] = useState(0);

  // FX Calculator State
  const [showFx, setShowFx] = useState(false);
  const [fxAmount, setFxAmount] = useState('');
  const [fxRate, setFxRate] = useState('');
  const [targetFxAccount, setTargetFxAccount] = useState<string>(''); // Which account to apply FX to
  const [currency, setCurrency] = useState('USD');
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  const COMMON_CURRENCIES = ['USD', 'JPY', 'GBP', 'EUR', 'AUD', 'CAD', 'CNY', 'SGD'];

  // Initialize form
  useEffect(() => {
    if (initialData) {
        // Format date to yyyy-mm-dd
        const dateObj = new Date(initialData.date);
        if (!isNaN(dateObj.getTime())) {
             setDate(dateObj.toISOString().split('T')[0]);
        }
        
        // Map existing values to state, convert numbers to strings
        const values: Record<string, string> = {};
        Object.keys(initialData.values).forEach(key => {
            values[key] = initialData.values[key].toString();
        });
        setAccountValues(values);
        
        setIncome(initialData.income.toString());
        setMpf(initialData.mpf.toString());
    } else {
        // Init empty values for all configured accounts
        const values: Record<string, string> = {};
        settings.accounts.forEach(acc => values[acc.id] = '');
        setAccountValues(values);
    }
  }, [initialData, settings.accounts]);

  // Handle Input Change
  const handleValueChange = (id: string, val: string) => {
      setAccountValues(prev => ({ ...prev, [id]: val }));
  };

  // Calculate Totals
  useEffect(() => {
    let cTotal = 0;
    let iTotal = 0;
    let oTotal = 0;

    settings.accounts.forEach(acc => {
        const val = parseFloat(accountValues[acc.id]) || 0;
        if (acc.type === 'cash') cTotal += val;
        else if (acc.type === 'investment') iTotal += val;
        else if (acc.type === 'other') oTotal += val;
    });

    const gTotal = cTotal + iTotal + oTotal;

    setCashTotal(cTotal);
    setInvTotal(iTotal);
    setGrandTotal(gTotal);
    
    // Gain logic
    if (lastRecord && (!initialData || lastRecord.id !== initialData.id)) {
        setGain(gTotal - lastRecord.totalAssets);
    } else if (initialData) {
        setGain(gTotal - (lastRecord?.totalAssets || 0));
    }
  }, [accountValues, settings.accounts, lastRecord, initialData]);

  const updateFx = (amt: string, rate: string) => {
      setFxAmount(amt);
      setFxRate(rate);
      const a = parseFloat(amt);
      const r = parseFloat(rate);
      if (!isNaN(a) && !isNaN(r) && targetFxAccount) {
          handleValueChange(targetFxAccount, (a * r).toFixed(0));
      }
  };

  const fetchExchangeRate = async (curr: string) => {
      setIsLoadingRate(true);
      try {
          // Using open.er-api.com for free exchange rates
          const response = await fetch(`https://open.er-api.com/v6/latest/${curr}`);
          const data = await response.json();
          // Assuming the user's base currency is HKD
          if (data && data.rates && data.rates.HKD) {
              const rate = data.rates.HKD;
              setFxRate(rate.toString());
              if (fxAmount) {
                  updateFx(fxAmount, rate.toString());
              }
          } else {
              alert('Could not fetch rate for ' + curr);
          }
      } catch (error) {
          console.error('Failed to fetch rate', error);
          alert('Network error fetching rates');
      } finally {
          setIsLoadingRate(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct values map with numbers
    const finalValues: Record<string, number> = {};
    settings.accounts.forEach(acc => {
        finalValues[acc.id] = parseFloat(accountValues[acc.id]) || 0;
    });

    const newRecord: FinanceRecord = {
      id: initialData ? initialData.id : `new-${Date.now()}`,
      date: date.replace(/-/g, '/'),
      values: finalValues,
      totalAssets: grandTotal,
      gain: gain,
      income: parseFloat(income) || 0,
      mpf: parseFloat(mpf) || 0
    };
    onAdd(newRecord);
    if (!initialData) setIncome('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-slate-100 max-w-4xl mx-auto animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">{initialData ? 'Edit Record' : 'Update Your Balances'}</h2>
            <p className="text-slate-500 text-sm mt-1">Enter the current value of your accounts.</p>
        </div>
        <div className="text-right bg-emerald-50 px-4 py-2 rounded-xl">
             <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">Total Estimated Wealth</p>
             <p className="text-xl font-bold text-emerald-700">${grandTotal.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        <div className="col-span-full mb-2">
            <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide block">Record Date</label>
            <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full md:w-1/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900/10"
                required
            />
        </div>

        {/* Cash Section */}
        <SectionHeader title="Cash & Bank Accounts" icon={Wallet} color="bg-blue-100 text-blue-600" />
        {settings.accounts.filter(a => a.type === 'cash').map(acc => (
            <InputGroup 
                key={acc.id} 
                label={acc.name} 
                value={accountValues[acc.id] || ''} 
                onChange={(val) => handleValueChange(acc.id, val)} 
            />
        ))}
        {settings.accounts.filter(a => a.type === 'cash').length === 0 && <p className="text-sm text-slate-400 italic col-span-full">No cash accounts configured.</p>}
        
        {/* Investment Section */}
        <SectionHeader title="Investments Portfolio" icon={TrendingUp} color="bg-violet-100 text-violet-600" />
        {settings.accounts.filter(a => a.type === 'investment').map(acc => (
            <InputGroup 
                key={acc.id} 
                label={acc.name} 
                value={accountValues[acc.id] || ''} 
                onChange={(val) => handleValueChange(acc.id, val)} 
            />
        ))}

        {/* Other Assets & Calculator */}
        <SectionHeader title="Other Assets" icon={Globe} color="bg-rose-100 text-rose-600" />
        {settings.accounts.filter(a => a.type === 'other').map(acc => (
             <div key={acc.id} className="relative group">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide truncate group-hover:text-slate-700 transition-colors">{acc.name}</label>
                    <button 
                        type="button"
                        onClick={() => {
                            setTargetFxAccount(acc.id);
                            setShowFx(!showFx && targetFxAccount === acc.id ? false : true);
                            if (!showFx || targetFxAccount !== acc.id) {
                                if (!fxRate) fetchExchangeRate('USD');
                            }
                        }}
                        className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition-colors"
                    >
                        <Calculator size={10} /> Converter
                    </button>
                 </div>
                 
                 {showFx && targetFxAccount === acc.id && (
                    <div className="absolute z-20 top-full left-0 w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-2xl mb-2 animate-in slide-in-from-top-2">
                        <div className="space-y-4">
                            <h5 className="text-xs font-bold text-slate-400 uppercase">Currency Converter</h5>
                            <div className="flex gap-3">
                                <select 
                                    value={currency}
                                    onChange={(e) => {
                                        setCurrency(e.target.value);
                                        fetchExchangeRate(e.target.value);
                                    }}
                                    className="w-1/3 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
                                >
                                    {COMMON_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input 
                                    type="number" 
                                    value={fxAmount}
                                    onChange={(e) => updateFx(e.target.value, fxRate)}
                                    placeholder="Foreign Amt"
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">RATE</span>
                                    <input 
                                        type="number" 
                                        value={fxRate}
                                        onChange={(e) => updateFx(fxAmount, e.target.value)}
                                        placeholder="Rate"
                                        className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                                    />
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => fetchExchangeRate(currency)}
                                    disabled={isLoadingRate}
                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                    title="Refresh Rate"
                                >
                                    <RefreshCw size={14} className={isLoadingRate ? "animate-spin" : ""} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                <span className="text-[10px] text-slate-400 font-medium">Result (HKD)</span>
                                <span className="text-sm font-bold text-emerald-600">
                                    ${parseFloat(accountValues[targetFxAccount] || '0').toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                 )}

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <input
                        type="number"
                        value={accountValues[acc.id] || ''}
                        onChange={(e) => handleValueChange(acc.id, e.target.value)}
                        className="w-full pl-7 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900/10 font-medium text-slate-700"
                    />
                </div>
             </div>
        ))}

        <SectionHeader title="Income & MPF" icon={DollarSign} color="bg-emerald-100 text-emerald-600" />
        <InputGroup label="Monthly Income" value={income} onChange={setIncome} />
        <InputGroup label="MPF / Pension Balance" value={mpf} onChange={setMpf} />
        
      </div>

      <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
        <button 
            type="submit" 
            className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-emerald-200/50 transition-all transform hover:-translate-y-0.5"
        >
            <Save size={18} />
            {initialData ? 'Update Record' : 'Save Balances'}
        </button>
      </div>
    </form>
  );
};

export default AddEntryForm;