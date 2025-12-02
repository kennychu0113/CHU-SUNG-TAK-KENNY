import { FinanceRecord, ExpenseRecord, Account } from '../types';

export const parseCurrency = (val: string | number | undefined | null): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const clean = val.replace(/[$,]/g, '').trim();
  const float = parseFloat(clean);
  return isNaN(float) ? 0 : float;
};

export const formatCurrency = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) {
    return '$0';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper to sum values by account type
export const getAccountTotal = (record: FinanceRecord, accounts: Account[], type: 'cash' | 'investment' | 'other'): number => {
    return accounts
        .filter(a => a.type === type)
        .reduce((sum, acc) => sum + (record.values[acc.id] || 0), 0);
};

export const parseCSVData = (csv: string): any[] => {
  // This is a legacy parser for the default hardcoded string in constants.ts
  // It returns objects compatible with the OLD structure, which App.tsx will migrate.
  const lines = csv.split('\n');
  const records: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let parts: string[] = [];
    let current = '';
    let inQuote = false;
    for (let char of line) {
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            parts.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    parts.push(current);
    const cleanParts = parts.map(p => p ? p.replace(/^"|"$/g, '').trim() : '');

    if (!cleanParts[0] && parseCurrency(cleanParts[9]) === 0) continue;

    // Map legacy CSV columns to temporary structure
    records.push({
      id: `rec-${i}-${Date.now()}`,
      date: cleanParts[0] || 'Unknown Date',
      cash: {
        hsbc: parseCurrency(cleanParts[2]),
        citi: parseCurrency(cleanParts[3]),
        other: parseCurrency(cleanParts[4]),
        total: parseCurrency(cleanParts[1]), 
      },
      investment: {
        sofi: parseCurrency(cleanParts[6]),
        binance: parseCurrency(cleanParts[7]),
        total: parseCurrency(cleanParts[5]),
      },
      yen: parseCurrency(cleanParts[8]),
      totalAssets: parseCurrency(cleanParts[9]),
      gain: parseCurrency(cleanParts[10]),
      income: parseCurrency(cleanParts[11]),
      mpf: parseCurrency(cleanParts[12]),
      note: cleanParts[13]
    });
  }
  return records;
};

export const parseExpenseCSV = (csv: string): ExpenseRecord[] => {
  const lines = csv.split('\n');
  const records: ExpenseRecord[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(p => p.trim());
    if (parts.length < 3) continue;

    const isDate = parts[0].includes('/') || parts[0].includes('-');
    const offset = isDate ? 1 : 0;

    records.push({
      id: `exp-${i}-${Date.now()}`,
      category: parts[0 + offset] || 'Uncategorized',
      item: parts[1 + offset] || 'Expense',
      amount: parseCurrency(parts[2 + offset]),
      note: parts[3 + offset] || ''
    });
  }
  return records;
};

export const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};