import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { User, LoginFormData, RegisterFormData } from '@/types';
import { authAPI } from '@/utils/api';
import { authUtils } from '@/utils/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authUtils.getToken();
      const savedUser = authUtils.getUser();

      if (token && savedUser) {
        try {
          // Verify token with server
          const response = await authAPI.getCurrentUser();
          
          if (response.success) {
            setState({
              user: response.data.user,
              loading: false,
              isAuthenticated: true,
            });
            authUtils.setUser(response.data.user);
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          // Token is invalid, clear auth data
          authUtils.clearAuthData();
          setState({
            user: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginFormData) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { token, user } = response.data;
        
        authUtils.setAuthData({ token, user });
        setState({
          user,
          loading: false,
          isAuthenticated: true,
        });

        toast.success('Logged in successfully!');
        
        // Redirect to intended page or home
        const redirect = router.query.redirect as string;
        router.push(redirect || '/');
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [router]);

  const register = useCallback(async (userData: RegisterFormData) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { token, user } = response.data;
        
        authUtils.setAuthData({ token, user });
        setState({
          user,
          loading: false,
          isAuthenticated: true,
        });

        toast.success('Account created successfully!');
        router.push('/');
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [router]);

  const logout = useCallback(async (logoutAll = false) => {
    try {
      if (logoutAll) {
        await authAPI.logoutAll();
      } else {
        await authAPI.logout();
      }
    } catch (error) {
      // Continue with local logout even if server request fails
      console.error('Logout error:', error);
    }

    authUtils.clearAuthData();
    setState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });

    toast.success('Logged out successfully');
    router.push('/');
  }, [router]);

  const updateProfile = useCallback(async (data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
  }) => {
    if (!state.user) return { success: false, error: 'Not authenticated' };

    try {
      const response = await authAPI.updateProfile(data);
      
      if (response.success) {
        const updatedUser = response.data.user;
        
        setState(prev => ({
          ...prev,
          user: updatedUser,
        }));
        
        authUtils.setUser(updatedUser);
        toast.success('Profile updated successfully!');
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [state.user]);

  const changePassword = useCallback(async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    if (!state.user) return { success: false, error: 'Not authenticated' };

    try {
      const response = await authAPI.changePassword(data);
      
      if (response.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [state.user]);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const response = await authAPI.requestPasswordReset(email);
      
      if (response.success) {
        toast.success('Password reset email sent!');
        return { success: true };
      } else {
        throw new Error(response.message || 'Request failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Request failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const resetPassword = useCallback(async (data: {
    token: string;
    newPassword: string;
  }) => {
    try {
      const response = await authAPI.resetPassword(data);
      
      if (response.success) {
        toast.success('Password reset successfully!');
        router.push('/auth/login');
        return { success: true };
      } else {
        throw new Error(response.message || 'Reset failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [router]);

  // Permission helpers
  const hasRole = useCallback((roles: User['role'][]) => {
    return authUtils.hasRole(state.user, roles);
  }, [state.user]);

  const isAdmin = useCallback(() => {
    return authUtils.isAdmin(state.user);
  }, [state.user]);

  const isAuthor = useCallback(() => {
    return authUtils.isAuthor(state.user);
  }, [state.user]);

  const canModerate = useCallback(() => {
    return authUtils.canModerate(state.user);
  }, [state.user]);

  return {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    hasRole,
    isAdmin,
    isAuthor,
    canModerate,
  };
};

export default useAuth;