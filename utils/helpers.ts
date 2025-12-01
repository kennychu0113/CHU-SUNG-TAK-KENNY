import { FinanceRecord, ExpenseRecord } from '../types';

export const parseCurrency = (val: string | number | undefined | null): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const clean = val.replace(/[$,]/g, '').trim();
  const float = parseFloat(clean);
  return isNaN(float) ? 0 : float;
};

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Assuming $ symbol implies dollar (HKD/USD), using generic $ formatting
    maximumFractionDigits: 0,
  }).format(val);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  // Handle 2025/8/4 format
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const parseCSVData = (csv: string): FinanceRecord[] => {
  const lines = csv.split('\n');
  const records: FinanceRecord[] = [];
  
  // Skip header (index 0)
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

    // Basic validation to check if row has data
    if (!cleanParts[0] && parseCurrency(cleanParts[9]) === 0) continue;

    const record: FinanceRecord = {
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
    };
    
    records.push(record);
  }
  return records;
};

export const parseExpenseCSV = (csv: string): ExpenseRecord[] => {
  const lines = csv.split('\n');
  const records: ExpenseRecord[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(p => p.trim());
    if (parts.length < 3) continue;

    // OLD Format: Date, Category, Item, Amount, Note
    // NEW Format: Category, Item, Amount, Note
    // Check if first part looks like a date (simple check) to handle backward compatibility lightly
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
