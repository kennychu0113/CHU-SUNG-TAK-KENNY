import React from 'react';
import { FinanceRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

interface TransactionTableProps {
  data: FinanceRecord[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Record History</h3>
        <span className="text-xs text-slate-500">{data.length} entries</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-medium whitespace-nowrap sticky left-0 bg-slate-50 z-10">Date</th>
              <th className="px-6 py-4 font-medium text-emerald-600">Total Assets</th>
              <th className="px-6 py-4 font-medium">Gain</th>
              <th className="px-6 py-4 font-medium">Income</th>
              <th className="px-6 py-4 font-medium text-blue-600">Cash Total</th>
              <th className="px-6 py-4 font-medium text-slate-400">HSBC</th>
              <th className="px-6 py-4 font-medium text-slate-400">Citi</th>
              <th className="px-6 py-4 font-medium text-slate-400">Other</th>
              <th className="px-6 py-4 font-medium text-indigo-600">Inv Total</th>
              <th className="px-6 py-4 font-medium text-slate-400">Sofi</th>
              <th className="px-6 py-4 font-medium text-slate-400">Binance</th>
              <th className="px-6 py-4 font-medium text-rose-600">Yen</th>
              <th className="px-6 py-4 font-medium">MPF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.slice().reverse().map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-slate-50 shadow-[4px_0_4px_-2px_rgba(0,0,0,0.05)]">
                  {formatDate(record.date)}
                </td>
                <td className="px-6 py-4 font-bold text-emerald-700">{formatCurrency(record.totalAssets)}</td>
                <td className={`px-6 py-4 ${record.gain > 0 ? 'text-emerald-600' : record.gain < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {record.gain ? formatCurrency(record.gain) : '-'}
                </td>
                <td className="px-6 py-4 text-slate-600">{record.income ? formatCurrency(record.income) : '-'}</td>
                <td className="px-6 py-4 font-medium text-blue-700 bg-blue-50/30">{formatCurrency(record.cash.total)}</td>
                <td className="px-6 py-4 text-slate-500">{formatCurrency(record.cash.hsbc)}</td>
                <td className="px-6 py-4 text-slate-500">{formatCurrency(record.cash.citi)}</td>
                <td className="px-6 py-4 text-slate-500">{formatCurrency(record.cash.other)}</td>
                <td className="px-6 py-4 font-medium text-indigo-700 bg-indigo-50/30">{formatCurrency(record.investment.total)}</td>
                <td className="px-6 py-4 text-slate-500">{formatCurrency(record.investment.sofi)}</td>
                <td className="px-6 py-4 text-slate-500">{formatCurrency(record.investment.binance)}</td>
                <td className="px-6 py-4 text-rose-600">{formatCurrency(record.yen)}</td>
                <td className="px-6 py-4 text-slate-600">{formatCurrency(record.mpf)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
