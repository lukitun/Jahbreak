export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredCurrency: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  requiresTwoFactor?: boolean;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredCurrency?: string;
}

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  date: string;
  receiptUrl?: string;
  receiptPublicId?: string;
  paymentMethod: PaymentMethod;
  location?: string;
  tags: string[];
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = 
  | 'Food'
  | 'Housing'
  | 'Transportation'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Utilities'
  | 'Other';

export type PaymentMethod = 
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Digital Wallet'
  | 'Other';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ExpenseFormData {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  paymentMethod: PaymentMethod;
  currency?: string;
  location?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  receipt?: File;
}

export interface Budget {
  _id: string;
  userId: string;
  name: string;
  amount: number;
  currency: string;
  category?: ExpenseCategory;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  spent: number;
  alertAt80Percent: boolean;
  alertAt100Percent: boolean;
  alert80PercentSent: boolean;
  alert100PercentSent: boolean;
  isActive: boolean;
  progressPercentage: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  name: string;
  amount: number;
  category?: ExpenseCategory;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  currency?: string;
  alertAt80Percent?: boolean;
  alertAt100Percent?: boolean;
}

export interface SavingsGoal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string;
  category: SavingsGoalCategory;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  progressPercentage: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
}

export type SavingsGoalCategory = 
  | 'Emergency Fund'
  | 'Vacation'
  | 'Car'
  | 'House'
  | 'Education'
  | 'Retirement'
  | 'Investment'
  | 'Other';

export interface SavingsGoalFormData {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  category: SavingsGoalCategory;
  description?: string;
  currency?: string;
}

export interface FinancialSummary {
  totalExpenses: number;
  totalBudgeted: number;
  budgetVariance: number;
  budgetUtilization: number;
  totalSavingsTarget: number;
  totalSavingsCurrent: number;
  savingsProgress: number;
  expenseChange: number;
  categoryBreakdown: { [category: string]: number };
  currency: string;
  period: {
    start: string;
    end: string;
  };
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  name: string;
  income: number;
  expenses: number;
  net: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: PaymentMethod;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  message: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR';