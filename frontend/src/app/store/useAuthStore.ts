import { create } from 'zustand';
import { AuthState, User, ApiError } from '../types/models';
import { ApiService } from '../api/apiService';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  currentUser: null,
  loginStatus: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await ApiService.login(email, password);

      if (data && data.success) {
        set({
          isLoggedIn: true,
          currentUser: data.user,
          loginStatus: 'Login successful',
          isLoading: false,
          error: null
        });
        setCookie('token', data.token, { maxAge: 30 * 24 * 60 * 60 });
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        set({
          isLoggedIn: false,
          currentUser: null,
          loginStatus: 'Login failed',
          isLoading: false,
          error: 'Invalid credentials'
        });
        return false;
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({ 
        isLoggedIn: false,
        currentUser: null,
        loginStatus: 'Error occurred during login', 
        isLoading: false, 
        error: apiError.message || 'An unknown error occurred'
      });
      console.error('Error occurred during login:', apiError);
      return false;
    }
  },

  logout: () => {
    deleteCookie('token');
    localStorage.removeItem('user');
    set({
      isLoggedIn: false,
      currentUser: null,
      loginStatus: 'Logged out successfully',
      isLoading: false,
      error: null
    });
  },

  initializeAuth: () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = getCookie('token');
    if (storedUser && storedToken) {
      try {
        const user: User = JSON.parse(storedUser);
        set({
          isLoggedIn: true,
          currentUser: user,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        set({
          isLoggedIn: false,
          currentUser: null,
          isLoading: false,
          error: 'Error initializing auth'
        });
      }
    } else {
      set({
        isLoggedIn: false,
        currentUser: null,
        isLoading: false,
        error: null
      });
    }
  }
}));

// Hydrate the store with persisted data on the client side
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}