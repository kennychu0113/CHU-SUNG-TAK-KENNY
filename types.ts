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

export interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  item: string;
  amount: number;
  note?: string;
}

export interface AppSettings {
  labels: {
    hsbc: string;
    citi: string;
    other: string;
    sofi: string;
    binance: string;
    yen: string;
  }
}

export type ViewState = 'dashboard' | 'assets' | 'expenses' | 'add_asset' | 'add_expense' | 'settings';
