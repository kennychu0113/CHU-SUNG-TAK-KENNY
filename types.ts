export interface FinanceRecord {
  id: string;
  date: string;
  cash: {
    hsbc: number;
    citi: number;
    other: number;
    total: number;
  };
  investment: {
    sofi: number;
    binance: number;
    total: number;
  };
  yen: number;
  totalAssets: number;
  gain: number;
  income: number;
  mpf: number;
  note?: string;
}

export type ViewState = 'dashboard' | 'list' | 'add' | 'ai';
