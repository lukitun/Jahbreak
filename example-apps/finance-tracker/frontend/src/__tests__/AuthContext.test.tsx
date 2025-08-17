import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

// Mock the API
jest.mock('../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    enable2FA: jest.fn(),
    verify2FA: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('initializes with default state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.state.user).toBeNull();
    expect(result.current.state.token).toBeNull();
    expect(result.current.state.isAuthenticated).toBe(false);
  });

  test('initializes with existing token from localStorage', () => {
    const mockToken = 'existing-token';
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    localStorageMock.getItem
      .mockReturnValueOnce(mockToken) // First call for token
      .mockReturnValueOnce(JSON.stringify(mockUser)); // Second call for user

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.state.user).toEqual(mockUser);
    expect(result.current.state.token).toBe(mockToken);
    expect(result.current.state.isAuthenticated).toBe(true);
  });

  test('handles corrupted user data in localStorage', () => {
    const mockToken = 'existing-token';
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken) // First call for token
      .mockReturnValueOnce('invalid-json'); // Second call for corrupted user data

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.state.user).toBeNull();
    expect(result.current.state.token).toBeNull();
    expect(result.current.state.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  test('login updates state and localStorage', async () => {
    const mockResponse = {
      token: 'new-token',
      user: {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
    };

    (authAPI.login as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.state.user).toEqual(mockResponse.user);
    expect(result.current.state.token).toBe(mockResponse.token);
    expect(result.current.state.isAuthenticated).toBe(true);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.token);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.user));
  });

  test('login throws error on API failure', async () => {
    const errorMessage = 'Invalid credentials';
    (authAPI.login as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(async () => {
      await act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      });
    }).rejects.toThrow(errorMessage);

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  test('register updates state and localStorage', async () => {
    const userData = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      defaultCurrency: 'EUR'
    };

    const mockResponse = {
      token: 'registration-token',
      user: {
        id: 'user456',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    };

    (authAPI.register as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register(userData);
    });

    expect(result.current.state.user).toEqual(mockResponse.user);
    expect(result.current.state.token).toBe(mockResponse.token);
    expect(result.current.state.isAuthenticated).toBe(true);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.token);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.user));
  });

  test('register throws error on API failure', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith'
    };

    const errorMessage = 'User already exists';
    (authAPI.register as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(async () => {
      await act(async () => {
        await result.current.register(userData);
      });
    }).rejects.toThrow(errorMessage);

    expect(result.current.state.isAuthenticated).toBe(false);
  });

  test('logout clears state and localStorage', () => {
    // First set up an authenticated state
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    localStorageMock.getItem
      .mockReturnValueOnce('existing-token')
      .mockReturnValueOnce(JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Verify initial authenticated state
    expect(result.current.state.isAuthenticated).toBe(true);

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.state.user).toBeNull();
    expect(result.current.state.token).toBeNull();
    expect(result.current.state.isAuthenticated).toBe(false);
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  test('enable2FA calls API correctly', async () => {
    const mockResponse = {
      secret: 'test-secret',
      otpAuthUrl: 'otpauth://totp/FinanceTracker'
    };

    (authAPI.enable2FA as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.enable2FA();
    });

    expect(response).toEqual(mockResponse);
    expect(authAPI.enable2FA).toHaveBeenCalledTimes(1);
  });

  test('enable2FA throws error on API failure', async () => {
    const errorMessage = 'Failed to enable 2FA';
    (authAPI.enable2FA as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(async () => {
      await act(async () => {
        await result.current.enable2FA();
      });
    }).rejects.toThrow(errorMessage);
  });

  test('verify2FA calls API correctly', async () => {
    const token = '123456';
    (authAPI.verify2FA as jest.Mock).mockResolvedValue({ message: 'Success' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.verify2FA(token);
    });

    expect(authAPI.verify2FA).toHaveBeenCalledWith(token);
  });

  test('verify2FA throws error on API failure', async () => {
    const token = '123456';
    const errorMessage = 'Invalid token';
    (authAPI.verify2FA as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(async () => {
      await act(async () => {
        await result.current.verify2FA(token);
      });
    }).rejects.toThrow(errorMessage);
  });

  test('throws error when useAuth is used outside provider', () => {
    // Temporarily mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  test('handles missing localStorage gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.state.user).toBeNull();
    expect(result.current.state.token).toBeNull();
    expect(result.current.state.isAuthenticated).toBe(false);
  });
});