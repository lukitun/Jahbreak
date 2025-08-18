import axios, { AxiosResponse } from 'axios';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  Expense,
  ExpenseFormData,
  Budget,
  BudgetFormData,
  SavingsGoal,
  SavingsGoalFormData,
  FinancialSummary,
  ApiResponse,
  PaginatedResponse,
  ExpenseFilters,
  TwoFactorSetup
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finance_tracker_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('finance_tracker_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data.user;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile', data);
    return response.data.user;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  setup2FA: async (): Promise<TwoFactorSetup> => {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },

  verify2FA: async (token: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/2fa/verify', { token });
    return response.data;
  },

  disable2FA: async (password: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/2fa/disable', { password });
    return response.data;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },
};

// Expenses API
export const expensesAPI = {
  getExpenses: async (filters?: ExpenseFilters): Promise<PaginatedResponse<Expense>> => {
    const response = await api.get('/expenses', { params: filters });
    return {
      success: response.data.success,
      data: response.data.expenses,
      pagination: response.data.pagination,
    };
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data.expense;
  },

  createExpense: async (data: ExpenseFormData): Promise<Expense> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'receipt' && value instanceof File) {
        formData.append('receipt', value);
      } else if (key === 'tags' && Array.isArray(value)) {
        formData.append('tags', JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const response = await api.post('/expenses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.expense;
  },

  updateExpense: async (id: string, data: ExpenseFormData): Promise<Expense> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'receipt' && value instanceof File) {
        formData.append('receipt', value);
      } else if (key === 'tags' && Array.isArray(value)) {
        formData.append('tags', JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const response = await api.put(`/expenses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.expense;
  },

  deleteExpense: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getExpenseStats: async (filters?: {
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }): Promise<any> => {
    const response = await api.get('/expenses/stats', { params: filters });
    return response.data;
  },
};

// Budgets API
export const budgetsAPI = {
  getBudgets: async (filters?: {
    page?: number;
    limit?: number;
    category?: string;
    period?: string;
    isActive?: boolean;
    includeExpired?: boolean;
  }): Promise<PaginatedResponse<Budget>> => {
    const response = await api.get('/budgets', { params: filters });
    return {
      success: response.data.success,
      data: response.data.budgets,
      pagination: response.data.pagination,
    };
  },

  getBudgetById: async (id: string): Promise<Budget> => {
    const response = await api.get(`/budgets/${id}`);
    return response.data.budget;
  },

  createBudget: async (data: BudgetFormData): Promise<Budget> => {
    const response = await api.post('/budgets', data);
    return response.data.budget;
  },

  updateBudget: async (id: string, data: BudgetFormData): Promise<Budget> => {
    const response = await api.put(`/budgets/${id}`, data);
    return response.data.budget;
  },

  deleteBudget: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },

  getBudgetProgress: async (id: string): Promise<any> => {
    const response = await api.get(`/budgets/${id}/progress`);
    return response.data;
  },

  getBudgetSummary: async (period?: string): Promise<any> => {
    const response = await api.get('/budgets/summary', { params: { period } });
    return response.data;
  },
};

// Savings Goals API
export const savingsGoalsAPI = {
  getSavingsGoals: async (filters?: {
    page?: number;
    limit?: number;
    category?: string;
    isCompleted?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedResponse<SavingsGoal>> => {
    const response = await api.get('/savings-goals', { params: filters });
    return {
      success: response.data.success,
      data: response.data.savingsGoals,
      pagination: response.data.pagination,
    };
  },

  getSavingsGoalById: async (id: string): Promise<SavingsGoal> => {
    const response = await api.get(`/savings-goals/${id}`);
    return response.data.savingsGoal;
  },

  createSavingsGoal: async (data: SavingsGoalFormData): Promise<SavingsGoal> => {
    const response = await api.post('/savings-goals', data);
    return response.data.savingsGoal;
  },

  updateSavingsGoal: async (id: string, data: SavingsGoalFormData): Promise<SavingsGoal> => {
    const response = await api.put(`/savings-goals/${id}`, data);
    return response.data.savingsGoal;
  },

  deleteSavingsGoal: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/savings-goals/${id}`);
    return response.data;
  },

  addToSavingsGoal: async (id: string, amount: number, note?: string): Promise<SavingsGoal> => {
    const response = await api.post(`/savings-goals/${id}/add`, { amount, note });
    return response.data.savingsGoal;
  },

  withdrawFromSavingsGoal: async (id: string, amount: number, note?: string): Promise<SavingsGoal> => {
    const response = await api.post(`/savings-goals/${id}/withdraw`, { amount, note });
    return response.data.savingsGoal;
  },

  getSavingsGoalsSummary: async (): Promise<any> => {
    const response = await api.get('/savings-goals/summary');
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getFinancialSummary: async (filters?: {
    startDate?: string;
    endDate?: string;
    currency?: string;
  }): Promise<FinancialSummary> => {
    const response = await api.get('/reports/summary', { params: filters });
    return response.data.summary;
  },

  getMonthlyReport: async (year?: number, month?: number): Promise<any> => {
    const response = await api.get('/reports/monthly', { params: { year, month } });
    return response.data.report;
  },

  getIncomeVsExpenses: async (filters?: {
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }): Promise<any> => {
    const response = await api.get('/reports/income-vs-expenses', { params: filters });
    return response.data;
  },

  exportCSV: async (filters?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<Blob> => {
    const response = await api.get('/reports/export/csv', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  exportPDF: async (filters?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<Blob> => {
    const response = await api.get('/reports/export/pdf', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;