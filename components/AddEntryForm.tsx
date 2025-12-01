import React, { useState, useEffect } from 'react';
import { FinanceRecord } from '../types';
import { Save } from 'lucide-react';

interface AddEntryFormProps {
  onAdd: (record: FinanceRecord) => void;
  lastRecord?: FinanceRecord;
}

const InputGroup = ({ label, value, onChange, placeholder }: { label: string, value: number | string, onChange: (val: string) => void, placeholder?: string }) => (
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
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

const AddEntryForm: React.FC<AddEntryFormProps> = ({ onAdd, lastRecord }) => {
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

  useEffect(() => {
    const cTotal = (parseFloat(hsbc) || 0) + (parseFloat(citi) || 0) + (parseFloat(other) || 0);
    const iTotal = (parseFloat(sofi) || 0) + (parseFloat(binance) || 0);
    const gTotal = cTotal + iTotal + (parseFloat(yen) || 0);

    setCashTotal(cTotal);
    setInvTotal(iTotal);
    setGrandTotal(gTotal);
    
    if (lastRecord) {
        setGain(gTotal - lastRecord.totalAssets);
    }
  }, [hsbc, citi, other, sofi, binance, yen, lastRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: FinanceRecord = {
      id: `new-${Date.now()}`,
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
    // Reset optional
    setIncome('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-100 max-w-4xl mx-auto animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Add New Record</h2>
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
        <InputGroup label="HSBC" value={hsbc} onChange={setHsbc} />
        <InputGroup label="Citi" value={citi} onChange={setCiti} />
        <InputGroup label="Other Cash" value={other} onChange={setOther} />
        <div className="md:col-span-2 lg:col-span-3 bg-blue-50 p-3 rounded-lg flex justify-between items-center">
            <span className="text-sm text-blue-800 font-medium">Cash Total (Auto)</span>
            <span className="text-lg font-bold text-blue-800">${cashTotal.toLocaleString()}</span>
        </div>

        <SectionHeader title="Investments" />
        <InputGroup label="Sofi" value={sofi} onChange={setSofi} />
        <InputGroup label="Binance" value={binance} onChange={setBinance} />
        <InputGroup label="Yen Holdings" value={yen} onChange={setYen} />
        <div className="md:col-span-2 lg:col-span-3 bg-indigo-50 p-3 rounded-lg flex justify-between items-center">
            <span className="text-sm text-indigo-800 font-medium">Investments Total (Auto)</span>
            <span className="text-lg font-bold text-indigo-800">${invTotal.toLocaleString()}</span>
        </div>

        <SectionHeader title="Income & MPF" />
        <InputGroup label="Monthly Income" value={income} onChange={setIncome} />
        <InputGroup label="MPF Balance" value={mpf} onChange={setMpf} />
        <div className="flex flex-col justify-center">
            <span className="text-xs text-slate-400 mb-1">Gain since last</span>
            <span className={`text-lg font-bold ${gain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {gain >= 0 ? '+' : ''}{gain.toLocaleString()}
            </span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
        <button 
            type="submit" 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
        >
            <Save size={18} />
            Save Entry
        </button>
      </div>
    </form>
  );
};

export default AddEntryForm;
