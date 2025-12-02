export type AccountType = 'cash' | 'investment' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
}

export interface FinanceRecord {
  id: string;
  date: string;
  // Key is Account.id, value is amount
  values: Record<string, number>;
  income: number;
  mpf: number;
  note?: string;
  
  // Computed helpers (Totals)
  totalAssets: number;
  gain: number;
}

export interface ExpenseRecord {
  id: string;
  category: string;
  item: string;
  amount: number;
  note?: string;
}

export interface SavingGoal {
  amount: number;
  months: number; // Duration in months
  startDate: string;
}

export interface AppSettings {
  accounts: Account[];
  expenseCategories: string[];
  savingGoal?: SavingGoal;
}

export type ViewState = 'dashboard' | 'assets' | 'expenses' | 'goals' | 'add_asset' | 'add_expense' | 'settings' | 'income_history' | 'metric_history' | 'mpf';

export interface BackupData {
  version: number;
  timestamp: string;
  assets: FinanceRecord[];
  expenses: ExpenseRecord[];
  settings: AppSettings;
}