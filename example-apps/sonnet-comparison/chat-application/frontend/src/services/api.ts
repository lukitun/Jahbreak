import axios, { AxiosResponse, AxiosError } from 'axios';
import { AuthTokens, User, Group, Message, FileData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (tokens: AuthTokens) => {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

export const getTokens = (): AuthTokens | null => {
  const storedAccessToken = localStorage.getItem('accessToken');
  const storedRefreshToken = localStorage.getItem('refreshToken');
  
  if (storedAccessToken && storedRefreshToken) {
    accessToken = storedAccessToken;
    refreshToken = storedRefreshToken;
    return { accessToken: storedAccessToken, refreshToken: storedRefreshToken };
  }
  
  return null;
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const newTokens = response.data;
          setTokens(newTokens);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  logoutAll: async (): Promise<void> => {
    await api.post('/auth/logout-all');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  updateProfile: async (data: {
    username?: string;
    avatar?: string;
  }): Promise<User> => {
    const response = await api.put('/auth/profile', data);
    return response.data.user;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.put('/auth/password', data);
  },
};

// Groups API
export const groupsApi = {
  getGroups: async (): Promise<Group[]> => {
    const response = await api.get('/groups');
    return response.data.groups;
  },

  createGroup: async (data: {
    name: string;
    description?: string;
    isPrivate?: boolean;
    maxMembers?: number;
  }): Promise<Group> => {
    const response = await api.post('/groups', data);
    return response.data.group;
  },

  getGroup: async (groupId: string): Promise<Group> => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data.group;
  },

  updateGroup: async (
    groupId: string,
    data: {
      name?: string;
      description?: string;
      avatar?: string;
      maxMembers?: number;
    }
  ): Promise<Group> => {
    const response = await api.put(`/groups/${groupId}`, data);
    return response.data.group;
  },

  deleteGroup: async (groupId: string): Promise<void> => {
    await api.delete(`/groups/${groupId}`);
  },

  joinGroup: async (groupId: string): Promise<void> => {
    await api.post(`/groups/${groupId}/join`);
  },

  leaveGroup: async (groupId: string): Promise<void> => {
    await api.post(`/groups/${groupId}/leave`);
  },

  addMember: async (groupId: string, userId: string): Promise<void> => {
    await api.post(`/groups/${groupId}/members`, { userId });
  },

  removeMember: async (groupId: string, memberId: string): Promise<void> => {
    await api.delete(`/groups/${groupId}/members/${memberId}`);
  },

  promoteToAdmin: async (groupId: string, userId: string): Promise<void> => {
    await api.post(`/groups/${groupId}/admins`, { userId });
  },

  transferOwnership: async (groupId: string, userId: string): Promise<void> => {
    await api.post(`/groups/${groupId}/transfer-ownership`, { userId });
  },

  searchGroups: async (query: string, page = 1, limit = 20): Promise<{
    groups: Group[];
    pagination: { currentPage: number; limit: number; hasMore: boolean };
  }> => {
    const response = await api.get(`/groups/search/${query}`, {
      params: { page, limit },
    });
    return response.data;
  },
};

// Messages API
export const messagesApi = {
  getMessages: async (
    groupId: string,
    page = 1,
    limit = 50
  ): Promise<{
    messages: Message[];
    pagination: { currentPage: number; limit: number; hasMore: boolean };
  }> => {
    const response = await api.get(`/messages/group/${groupId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  sendMessage: async (data: {
    content: string;
    groupId: string;
    messageType?: string;
    isEncrypted?: boolean;
  }): Promise<Message> => {
    const response = await api.post('/messages', data);
    return response.data.data;
  },

  editMessage: async (messageId: string, content: string): Promise<Message> => {
    const response = await api.put(`/messages/${messageId}`, { content });
    return response.data.data;
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/messages/${messageId}`);
  },

  markAsRead: async (messageId: string): Promise<void> => {
    await api.post(`/messages/${messageId}/read`);
  },

  getUnreadCount: async (groupId: string): Promise<number> => {
    const response = await api.get(`/messages/group/${groupId}/unread`);
    return response.data.unreadCount;
  },

  searchMessages: async (
    query: string,
    groupId?: string,
    page = 1,
    limit = 20
  ): Promise<{
    messages: Message[];
    pagination: { currentPage: number; limit: number; hasMore: boolean };
  }> => {
    const response = await api.get('/messages/search', {
      params: { query, groupId, page, limit },
    });
    return response.data;
  },
};

// Files API
export const filesApi = {
  uploadFile: async (
    file: File,
    groupId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ file: FileData; messageData: Message }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('groupId', groupId);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  getFile: async (fileId: string): Promise<FileData> => {
    const response = await api.get(`/files/${fileId}`);
    return response.data.file;
  },

  downloadFile: async (fileId: string): Promise<Blob> => {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },

  getGroupFiles: async (
    groupId: string,
    page = 1,
    limit = 20
  ): Promise<{
    files: FileData[];
    pagination: { currentPage: number; limit: number; hasMore: boolean };
  }> => {
    const response = await api.get(`/files/group/${groupId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  getGroupStats: async (groupId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    totalDownloads: number;
    fileTypes: Record<string, number>;
  }> => {
    const response = await api.get(`/files/group/${groupId}/stats`);
    return response.data.stats;
  },

  searchFiles: async (
    query: string,
    groupId?: string,
    page = 1,
    limit = 20
  ): Promise<{
    files: FileData[];
    pagination: { currentPage: number; limit: number; hasMore: boolean };
  }> => {
    const response = await api.get(`/files/search/${query}`, {
      params: { groupId, page, limit },
    });
    return response.data;
  },
};

// Error handler utility
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const errorData = error.response.data as any;
    return errorData.error?.message || errorData.message || 'An error occurred';
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Network error occurred';
};

export default api;