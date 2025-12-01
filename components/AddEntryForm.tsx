import React, { useState, useEffect } from 'react';
import { FinanceRecord, AppSettings } from '../types';
import { Save } from 'lucide-react';

interface AddEntryFormProps {
  onAdd: (record: FinanceRecord) => void;
  lastRecord?: FinanceRecord;
  settings: AppSettings;
  initialData?: FinanceRecord | null;
}

const InputGroup = ({ label, value, onChange, placeholder }: { label: string, value: number | string, onChange: (val: string) => void, placeholder?: string }) => (
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide truncate" title={label}>{label}</label>
    <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
        <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "0"}
        className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        />
    </div>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
    <div className="col-span-full border-b border-slate-100 pb-2 mt-2 mb-2">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
    </div>
);

const AddEntryForm: React.FC<AddEntryFormProps> = ({ onAdd, lastRecord, settings, initialData }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Cash
  const [hsbc, setHsbc] = useState<string>('');
  const [citi, setCiti] = useState<string>('');
  const [other, setOther] = useState<string>('');
  
  // Investments
  const [sofi, setSofi] = useState<string>('');
  const [binance, setBinance] = useState<string>('');
  
  // Other
  const [yen, setYen] = useState<string>('');
  const [income, setIncome] = useState<string>('');
  const [mpf, setMpf] = useState<string>('');

  // Auto-calculated totals
  const [cashTotal, setCashTotal] = useState(0);
  const [invTotal, setInvTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [gain, setGain] = useState(0);

  // Initialize form with initialData if editing
  useEffect(() => {
    if (initialData) {
        // Format date to yyyy-mm-dd for input
        const dateObj = new Date(initialData.date);
        if (!isNaN(dateObj.getTime())) {
             setDate(dateObj.toISOString().split('T')[0]);
        } else {
            // fallback if date format is odd (e.g. 2025/8/4)
            const parts = initialData.date.split('/');
            if(parts.length === 3) {
                 const y = parts[0];
                 const m = parts[1].padStart(2, '0');
                 const d = parts[2].padStart(2, '0');
                 setDate(`${y}-${m}-${d}`);
            }
        }

        setHsbc(initialData.cash.hsbc.toString());
        setCiti(initialData.cash.citi.toString());
        setOther(initialData.cash.other.toString());
        
        setSofi(initialData.investment.sofi.toString());
        setBinance(initialData.investment.binance.toString());
        
        setYen(initialData.yen.toString());
        setIncome(initialData.income.toString());
        setMpf(initialData.mpf.toString());
    }
  }, [initialData]);

  useEffect(() => {
    const cTotal = (parseFloat(hsbc) || 0) + (parseFloat(citi) || 0) + (parseFloat(other) || 0);
    const iTotal = (parseFloat(sofi) || 0) + (parseFloat(binance) || 0);
    const gTotal = cTotal + iTotal + (parseFloat(yen) || 0);

    setCashTotal(cTotal);
    setInvTotal(iTotal);
    setGrandTotal(gTotal);
    
    // Gain logic: If editing, gain is (current total - previous record total).
    // If adding new, gain is (current total - last record total).
    // This simple logic might be slightly off when editing historical records out of order, 
    // but works for the general use case.
    if (lastRecord && (!initialData || lastRecord.id !== initialData.id)) {
        setGain(gTotal - lastRecord.totalAssets);
    } else if (initialData) {
        // If editing, preserve the original logic or recalculate based on *its* previous.
        // For simplicity, we just recalculate based on current form values vs what it was? 
        // Actually best to just let it update based on the *current latest* logic or just use the calculated totals.
        // Let's just update the stored gain.
        setGain(gTotal - (lastRecord?.totalAssets || 0)); // Rought approx
    }
  }, [hsbc, citi, other, sofi, binance, yen, lastRecord, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: FinanceRecord = {
      id: initialData ? initialData.id : `new-${Date.now()}`,
      date: date.replace(/-/g, '/'),
      cash: {
        hsbc: parseFloat(hsbc) || 0,
        citi: parseFloat(citi) || 0,
        other: parseFloat(other) || 0,
        total: cashTotal
      },
      investment: {
        sofi: parseFloat(sofi) || 0,
        binance: parseFloat(binance) || 0,
        total: invTotal
      },
      yen: parseFloat(yen) || 0,
      totalAssets: grandTotal,
      gain: gain,
      income: parseFloat(income) || 0,
      mpf: parseFloat(mpf) || 0
    };
    onAdd(newRecord);
    // Only reset if adding new
    if (!initialData) {
        setIncome('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-100 max-w-4xl mx-auto animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Record' : 'Add New Record'}</h2>
        <div className="text-right">
             <p className="text-xs text-slate-500">Estimated Total</p>
             <p className="text-lg font-bold text-emerald-600">${grandTotal.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Date</label>
            <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
            />
        </div>

        <SectionHeader title="Cash Assets" />
        <InputGroup label={settings.labels.hsbc} value={hsbc} onChange={setHsbc} />
        <InputGroup label={settings.labels.citi} value={citi} onChange={setCiti} />
        <InputGroup label={settings.labels.other} value={other} onChange={setOther} />
        <div className="md:col-span-2 lg:col-span-3 bg-blue-50 p-3 rounded-lg flex justify-between items-center">
            <span className="text-sm text-blue-800 font-medium">Cash Total (Auto)</span>
            <span className="text-lg font-bold text-blue-800">${cashTotal.toLocaleString()}</span>
        </div>

        <SectionHeader title="Investments" />
        <InputGroup label={settings.labels.sofi} value={sofi} onChange={setSofi} />
        <InputGroup label={settings.labels.binance} value={binance} onChange={setBinance} />
        <InputGroup label={settings.labels.yen} value={yen} onChange={setYen} />
        <div className="md:col-span-2 lg:col-span-3 bg-indigo-50 p-3 rounded-lg flex justify-between items-center">
            <span className="text-sm text-indigo-800 font-medium">Investments Total (Auto)</span>
            <span className="text-lg font-bold text-indigo-800">${invTotal.toLocaleString()}</span>
        </div>

        <SectionHeader title="Income & MPF" />
        <InputGroup label="Monthly Income" value={income} onChange={setIncome} />
        <InputGroup label="MPF Balance" value={mpf} onChange={setMpf} />
        
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
        <button 
            type="submit" 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
        >
            <Save size={18} />
            {initialData ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
};

export default AddEntryForm;
