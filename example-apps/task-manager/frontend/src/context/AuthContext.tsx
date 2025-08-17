import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '@/types';
import apiService from '@/utils/api';
import socketService from '@/utils/socket';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/helpers';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getStorageItem<string | null>('auth_token', null);
        const storedUser = getStorageItem<User | null>('user', null);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Verify token is still valid
          try {
            const response = await apiService.getProfile();
            setUser(response.user);
            setStorageItem('user', response.user);

            // Connect to socket
            socketService.connect(storedToken);
          } catch (error) {
            // Token is invalid, clear auth state
            clearAuthState();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthState = () => {
    setUser(null);
    setToken(null);
    removeStorageItem('auth_token');
    removeStorageItem('user');
    socketService.disconnect();
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await apiService.login(credentials);
      
      setUser(response.user);
      setToken(response.token);
      setStorageItem('auth_token', response.token);
      setStorageItem('user', response.user);

      // Connect to socket
      socketService.connect(response.token);
    } catch (error) {
      clearAuthState();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setLoading(true);
      const response = await apiService.register(userData);
      
      setUser(response.user);
      setToken(response.token);
      setStorageItem('auth_token', response.token);
      setStorageItem('user', response.user);

      // Connect to socket
      socketService.connect(response.token);
    } catch (error) {
      clearAuthState();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearAuthState();
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(userData);
      setUser(response.user);
      setStorageItem('user', response.user);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};