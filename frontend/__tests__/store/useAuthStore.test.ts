import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuthStore } from '../../src/app/store/useAuthStore';
import { ApiService } from '../../src/app/lib/api/apiService';

// APIサービスのモック
jest.mock('../../src/app/lib/api/apiService');

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.loginStatus).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should log in successfully', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockLoginResponse = { success: true, token: 'fake-token', user: mockUser };
    (ApiService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      const success = await result.current.login('test@example.com', 'password');
      expect(success).toBe(true);
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.currentUser).toEqual(mockUser);
    expect(result.current.loginStatus).toBe('Login successful');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('should log out successfully', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.loginStatus).toBe('Logged out successfully');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should initialize auth from localStorage', () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.initializeAuth();
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.currentUser).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});