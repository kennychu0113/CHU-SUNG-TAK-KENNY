import { FinanceRecord } from '../types';

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

    // Simple CSV split handling quoted strings with commas
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // Fallback if regex fails or simple split is needed (the regex above is basic)
    // For this specific dataset which is uniform, we can try a simpler approach if matches is null
    // But let's do a robust simple parse:
    
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

    // Filter out completely empty rows (like ,$0,,,,$0,,,,) which have lots of empty fields but 0s
    const hasMeaningfulData = parts.some((p, idx) => idx > 0 && parseCurrency(p) > 100); 
    if (!hasMeaningfulData && !parts[0]) continue;

    // Mapping based on user's column order:
    // 0: Date, 1: CashTotal, 2: HSBC, 3: CITI, 4: Other, 
    // 5: InvTotal, 6: Sofi, 7: Binance, 8: Yen, 
    // 9: Total, 10: Gain, 11: Income, 12: MPF, 13: Notes/Goal
    
    // Clean quotes
    const cleanParts = parts.map(p => p ? p.replace(/^"|"$/g, '').trim() : '');

    const record: FinanceRecord = {
      id: `rec-${i}-${Date.now()}`,
      date: cleanParts[0] || 'Unknown Date', // Handle missing date in row 7
      cash: {
        hsbc: parseCurrency(cleanParts[2]),
        citi: parseCurrency(cleanParts[3]),
        other: parseCurrency(cleanParts[4]),
        total: parseCurrency(cleanParts[1]), // Or sum manually if preferred
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
