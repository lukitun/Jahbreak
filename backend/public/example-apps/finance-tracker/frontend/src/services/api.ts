import axios, { AxiosResponse } from 'axios';
import { 
  User, 
  Expense, 
  Budget, 
  BudgetSummary, 
  Report, 
  ExpenseResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses by clearing token and redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    defaultCurrency?: string;
  }): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  enable2FA: async (): Promise<{ secret: string; otpAuthUrl: string }> => {
    const response = await api.post('/auth/enable-2fa');
    return response.data;
  },

  verify2FA: async (token: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/verify-2fa', { token });
    return response.data;
  },
};

// Expenses API
export const expensesAPI = {
  create: async (
    expenseData: FormData
  ): Promise<ExpenseResponse> => {
    const response = await api.post('/expenses', expenseData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<Expense[]> => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  update: async (
    id: string,
    updateData: Partial<Expense>
  ): Promise<Expense> => {
    const response = await api.put(`/expenses/${id}`, updateData);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

// Budgets API
export const budgetsAPI = {
  create: async (budgetData: {
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
    year: number;
    month?: number;
  }): Promise<Budget> => {
    const response = await api.post('/budgets', budgetData);
    return response.data;
  },

  getAll: async (params?: {
    year?: number;
    period?: 'monthly' | 'yearly';
    category?: string;
  }): Promise<Budget[]> => {
    const response = await api.get('/budgets', { params });
    return response.data;
  },

  getSummary: async (params: {
    year: number;
    month?: number;
  }): Promise<BudgetSummary[]> => {
    const response = await api.get('/budgets/summary', { params });
    return response.data;
  },

  update: async (
    id: string,
    updateData: { amount?: number; category?: string }
  ): Promise<Budget> => {
    const response = await api.put(`/budgets/${id}`, updateData);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getMonthlyReport: async (params: {
    year: number;
    month: number;
  }): Promise<Report> => {
    const response = await api.get('/reports/monthly', { params });
    return response.data;
  },

  getAnnualReport: async (params: {
    year: number;
  }): Promise<Report> => {
    const response = await api.get('/reports/annual', { params });
    return response.data;
  },

  downloadCSV: async (url: string): Promise<Blob> => {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;