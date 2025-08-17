import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.request(config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      // Server responded with error status
      return new Error(error.response.data?.error || 'An error occurred');
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Authentication methods
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>({
      method: 'POST',
      url: '/auth/login',
      data,
    });
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
  }

  async logout(): Promise<void> {
    return this.request<void>({
      method: 'POST',
      url: '/auth/logout',
    });
  }

  async getProfile(): Promise<{ user: any }> {
    return this.request<{ user: any }>({
      method: 'GET',
      url: '/auth/profile',
    });
  }

  async updateProfile(data: any): Promise<{ user: any }> {
    return this.request<{ user: any }>({
      method: 'PUT',
      url: '/auth/profile',
      data,
    });
  }

  // Task methods
  async getTasks(params?: any): Promise<{ tasks: any[] }> {
    return this.request<{ tasks: any[] }>({
      method: 'GET',
      url: '/tasks',
      params,
    });
  }

  async getTask(id: string): Promise<{ task: any }> {
    return this.request<{ task: any }>({
      method: 'GET',
      url: `/tasks/${id}`,
    });
  }

  async createTask(data: any): Promise<{ task: any }> {
    return this.request<{ task: any }>({
      method: 'POST',
      url: '/tasks',
      data,
    });
  }

  async updateTask(id: string, data: any): Promise<{ task: any }> {
    return this.request<{ task: any }>({
      method: 'PUT',
      url: `/tasks/${id}`,
      data,
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/tasks/${id}`,
    });
  }

  async reorderTasks(tasks: { id: string; position: number }[]): Promise<void> {
    return this.request<void>({
      method: 'PATCH',
      url: '/tasks/reorder',
      data: { tasks },
    });
  }

  // Task List methods
  async getTaskLists(): Promise<{ taskLists: any[] }> {
    return this.request<{ taskLists: any[] }>({
      method: 'GET',
      url: '/task-lists',
    });
  }

  async getTaskList(id: string): Promise<{ taskList: any }> {
    return this.request<{ taskList: any }>({
      method: 'GET',
      url: `/task-lists/${id}`,
    });
  }

  async createTaskList(data: any): Promise<{ taskList: any }> {
    return this.request<{ taskList: any }>({
      method: 'POST',
      url: '/task-lists',
      data,
    });
  }

  async updateTaskList(id: string, data: any): Promise<{ taskList: any }> {
    return this.request<{ taskList: any }>({
      method: 'PUT',
      url: `/task-lists/${id}`,
      data,
    });
  }

  async deleteTaskList(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/task-lists/${id}`,
    });
  }

  async addMemberToTaskList(id: string, data: { email: string; role?: string }): Promise<{ taskList: any }> {
    return this.request<{ taskList: any }>({
      method: 'POST',
      url: `/task-lists/${id}/members`,
      data,
    });
  }

  async removeMemberFromTaskList(id: string, memberId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/task-lists/${id}/members/${memberId}`,
    });
  }

  async updateMemberRole(id: string, memberId: string, role: string): Promise<void> {
    return this.request<void>({
      method: 'PATCH',
      url: `/task-lists/${id}/members/${memberId}/role`,
      data: { role },
    });
  }

  // User methods
  async getUsers(params?: any): Promise<{ users: any[] }> {
    return this.request<{ users: any[] }>({
      method: 'GET',
      url: '/users',
      params,
    });
  }

  async getUser(id: string): Promise<{ user: any }> {
    return this.request<{ user: any }>({
      method: 'GET',
      url: `/users/${id}`,
    });
  }

  async getUserStats(id: string): Promise<{ stats: any }> {
    return this.request<{ stats: any }>({
      method: 'GET',
      url: `/users/${id}/stats`,
    });
  }

  async getOnlineUsers(): Promise<{ users: any[] }> {
    return this.request<{ users: any[] }>({
      method: 'GET',
      url: '/users/online',
    });
  }

  async updateUserRole(id: string, role: string): Promise<{ user: any }> {
    return this.request<{ user: any }>({
      method: 'PUT',
      url: `/users/${id}/role`,
      data: { role },
    });
  }

  async deactivateUser(id: string): Promise<void> {
    return this.request<void>({
      method: 'PATCH',
      url: `/users/${id}/deactivate`,
    });
  }

  async reactivateUser(id: string): Promise<void> {
    return this.request<void>({
      method: 'PATCH',
      url: `/users/${id}/reactivate`,
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: '/health',
    });
  }
}

export default new ApiService();