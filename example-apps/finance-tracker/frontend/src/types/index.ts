export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isTwoFactorEnabled?: boolean;
}

export interface Expense {
  _id: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  currency: string;
  receiptImage?: string;
}

export interface Budget {
  _id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  year: number;
  month?: number;
}

export interface BudgetSummary {
  category: string;
  budgetAmount: number;
  totalExpense: number;
  percentageSpent: number;
  period: 'monthly' | 'yearly';
  year: number;
  month?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface BudgetAlert {
  message: string;
  percentage: number;
}

export interface ExpenseResponse {
  expense: Expense;
  budgetAlert?: BudgetAlert;
}

export interface Report {
  pdfReport?: string;
  csvReport: string;
  totalMonthlySpending?: number;
  totalAnnualSpending?: number;
  categoryBreakdown?: CategoryBreakdown[];
  monthlyBreakdown?: MonthlyBreakdown[];
}

export interface CategoryBreakdown {
  _id: string;
  totalAmount: number;
  expenses: Expense[];
}

export interface MonthlyBreakdown {
  _id: number;
  categories: {
    category: string;
    totalAmount: number;
  }[];
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Housing',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Utilities',
  'Other'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY'
] as const;

export type Currency = typeof CURRENCIES[number];