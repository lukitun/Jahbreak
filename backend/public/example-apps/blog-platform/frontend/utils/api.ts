import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
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
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth token and redirect to login
      Cookies.remove('auth_token');
      window.location.href = '/auth/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    }
    
    return Promise.reject(error);
  }
);

// Generic API request function
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    }),

  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) =>
    apiRequest({
      method: 'POST',
      url: '/auth/register',
      data: userData,
    }),

  logout: () =>
    apiRequest({
      method: 'POST',
      url: '/auth/logout',
    }),

  logoutAll: () =>
    apiRequest({
      method: 'POST',
      url: '/auth/logout-all',
    }),

  getCurrentUser: () =>
    apiRequest({
      method: 'GET',
      url: '/auth/me',
    }),

  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
  }) =>
    apiRequest({
      method: 'PUT',
      url: '/auth/me',
      data,
    }),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) =>
    apiRequest({
      method: 'POST',
      url: '/auth/change-password',
      data,
    }),

  requestPasswordReset: (email: string) =>
    apiRequest({
      method: 'POST',
      url: '/auth/password-reset/request',
      data: { email },
    }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    apiRequest({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      data,
    }),

  getSessions: () =>
    apiRequest({
      method: 'GET',
      url: '/auth/sessions',
    }),

  revokeSession: (sessionId: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/auth/sessions/${sessionId}`,
    }),
};

// Posts API
export const postsAPI = {
  getPosts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    status?: string;
    featured?: boolean;
  }) =>
    apiRequest({
      method: 'GET',
      url: '/posts',
      params,
    }),

  getPost: (slug: string, incrementView = true) =>
    apiRequest({
      method: 'GET',
      url: `/posts/${slug}`,
      params: { incrementView },
    }),

  createPost: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/posts',
      data,
    }),

  updatePost: (id: number, data: any) =>
    apiRequest({
      method: 'PUT',
      url: `/posts/${id}`,
      data,
    }),

  deletePost: (id: number) =>
    apiRequest({
      method: 'DELETE',
      url: `/posts/${id}`,
    }),

  getPostsByAuthor: (username: string, params?: { page?: number; limit?: number }) =>
    apiRequest({
      method: 'GET',
      url: `/posts/author/${username}`,
      params,
    }),

  toggleLike: (id: number) =>
    apiRequest({
      method: 'POST',
      url: `/posts/${id}/like`,
    }),

  getPopularPosts: (limit = 5) =>
    apiRequest({
      method: 'GET',
      url: '/posts/popular',
      params: { limit },
    }),
};

// Comments API
export const commentsAPI = {
  getComments: (postId: number, params?: { page?: number; limit?: number; status?: string }) =>
    apiRequest({
      method: 'GET',
      url: `/comments/post/${postId}`,
      params,
    }),

  createComment: (postId: number, data: {
    content: string;
    parentId?: number;
    guestName?: string;
    guestEmail?: string;
  }) =>
    apiRequest({
      method: 'POST',
      url: `/comments/post/${postId}`,
      data,
    }),

  updateComment: (id: number, data: { content: string }) =>
    apiRequest({
      method: 'PUT',
      url: `/comments/${id}`,
      data,
    }),

  deleteComment: (id: number) =>
    apiRequest({
      method: 'DELETE',
      url: `/comments/${id}`,
    }),

  moderateComment: (id: number, action: 'approve' | 'reject' | 'spam') =>
    apiRequest({
      method: 'POST',
      url: `/comments/${id}/moderate`,
      data: { action },
    }),

  toggleCommentLike: (id: number, type: 'like' | 'dislike' = 'like') =>
    apiRequest({
      method: 'POST',
      url: `/comments/${id}/like`,
      data: { type },
    }),

  getPendingComments: (params?: { page?: number; limit?: number }) =>
    apiRequest({
      method: 'GET',
      url: '/comments/pending',
      params,
    }),
};

// Categories API
export const categoriesAPI = {
  getCategories: (includePostCount = false) =>
    apiRequest({
      method: 'GET',
      url: '/categories',
      params: { includePostCount },
    }),

  getCategory: (slug: string) =>
    apiRequest({
      method: 'GET',
      url: `/categories/${slug}`,
    }),

  getCategoryPosts: (slug: string, params?: { page?: number; limit?: number }) =>
    apiRequest({
      method: 'GET',
      url: `/categories/${slug}/posts`,
      params,
    }),

  createCategory: (data: {
    name: string;
    description?: string;
    color?: string;
  }) =>
    apiRequest({
      method: 'POST',
      url: '/categories',
      data,
    }),

  updateCategory: (id: number, data: {
    name?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
  }) =>
    apiRequest({
      method: 'PUT',
      url: `/categories/${id}`,
      data,
    }),

  deleteCategory: (id: number) =>
    apiRequest({
      method: 'DELETE',
      url: `/categories/${id}`,
    }),

  getCategoryStats: () =>
    apiRequest({
      method: 'GET',
      url: '/categories/stats/all',
    }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () =>
    apiRequest({
      method: 'GET',
      url: '/admin/dashboard',
    }),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    isActive?: boolean;
  }) =>
    apiRequest({
      method: 'GET',
      url: '/admin/users',
      params,
    }),

  updateUser: (id: number, data: {
    role?: string;
    isActive?: boolean;
    emailVerified?: boolean;
  }) =>
    apiRequest({
      method: 'PUT',
      url: `/admin/users/${id}`,
      data,
    }),

  deleteUser: (id: number) =>
    apiRequest({
      method: 'DELETE',
      url: `/admin/users/${id}`,
    }),

  getAllPosts: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    author?: string;
    category?: string;
    search?: string;
  }) =>
    apiRequest({
      method: 'GET',
      url: '/admin/posts',
      params,
    }),

  getAllComments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    postId?: number;
  }) =>
    apiRequest({
      method: 'GET',
      url: '/admin/comments',
      params,
    }),

  clearCache: (pattern?: string) =>
    apiRequest({
      method: 'POST',
      url: '/admin/cache/clear',
      data: { pattern },
    }),

  getSystemHealth: () =>
    apiRequest({
      method: 'GET',
      url: '/admin/health',
    }),
};

export default api;