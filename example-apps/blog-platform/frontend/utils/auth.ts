import Cookies from 'js-cookie';
import { User, AuthUser } from '@/types';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export const authUtils = {
  // Token management
  setToken: (token: string) => {
    Cookies.set(AUTH_TOKEN_KEY, token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  },

  getToken: (): string | undefined => {
    return Cookies.get(AUTH_TOKEN_KEY);
  },

  removeToken: () => {
    Cookies.remove(AUTH_TOKEN_KEY);
  },

  // User management
  setUser: (user: User) => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  removeUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  },

  // Authentication state
  setAuthData: (authData: { token: string; user: User }) => {
    authUtils.setToken(authData.token);
    authUtils.setUser(authData.user);
  },

  clearAuthData: () => {
    authUtils.removeToken();
    authUtils.removeUser();
  },

  isAuthenticated: (): boolean => {
    return !!authUtils.getToken();
  },

  // Role checks
  hasRole: (user: User | null, roles: User['role'][]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  },

  isAdmin: (user: User | null): boolean => {
    return authUtils.hasRole(user, ['admin']);
  },

  isAuthor: (user: User | null): boolean => {
    return authUtils.hasRole(user, ['author', 'admin']);
  },

  canModerate: (user: User | null): boolean => {
    return authUtils.hasRole(user, ['author', 'admin']);
  },

  canEditPost: (user: User | null, postAuthorId: number): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'author' && user.id === postAuthorId) return true;
    return false;
  },

  canEditComment: (user: User | null, commentAuthorId?: number, postAuthorId?: number): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (commentAuthorId && user.id === commentAuthorId) return true;
    if (user.role === 'author' && postAuthorId && user.id === postAuthorId) return true;
    return false;
  },

  // Permission checks for UI
  canCreatePost: (user: User | null): boolean => {
    return authUtils.hasRole(user, ['author', 'admin']);
  },

  canManageUsers: (user: User | null): boolean => {
    return authUtils.hasRole(user, ['admin']);
  },

  canManageCategories: (user: User | null): boolean => {
    return authUtils.hasRole(user, ['admin']);
  },

  canAccessAdmin: (user: User | null): boolean => {
    return authUtils.hasRole(user, ['admin']);
  },

  canAccessAuthorPanel: (user: User | null): boolean => {
    return authUtils.hasRole(user, ['author', 'admin']);
  },
};

// JWT token utilities
export const tokenUtils = {
  isTokenExpired: (token: string): boolean => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },

  getTokenPayload: (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  },

  getTokenExpiry: (token: string): Date | null => {
    const payload = tokenUtils.getTokenPayload(token);
    if (!payload?.exp) return null;
    return new Date(payload.exp * 1000);
  },
};

// Route protection utilities
export const routeUtils = {
  requireAuth: (user: User | null): boolean => {
    return !!user;
  },

  requireRole: (user: User | null, roles: User['role'][]): boolean => {
    return authUtils.hasRole(user, roles);
  },

  getLoginRedirect: (currentPath: string): string => {
    return `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
  },

  getRedirectPath: (searchParams: URLSearchParams): string => {
    return searchParams.get('redirect') || '/';
  },
};

export default authUtils;