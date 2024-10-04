import { create } from 'zustand';
import { User } from '../types/models';
import { ApiService } from '../lib/api/apiService';

interface AuthState {
  isLoggedIn: boolean;
  currentUser: User | null;
  loginStatus: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  currentUser: null,
  loginStatus: null,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const data = await ApiService.login(email, password);
      if (data.success) {
        set({
          isLoggedIn: true,
          currentUser: data.user,
          loginStatus: 'Login successful',
          isLoading: false
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        set({ loginStatus: 'Login failed', isLoading: false });
        return false;
      }
    } catch (error) {
      set({ loginStatus: 'Error occurred during login', isLoading: false });
      console.error('Error occurred during login:', error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      isLoggedIn: false,
      currentUser: null,
      loginStatus: 'Logged out successfully',
      isLoading: false
    });
  },

  initializeAuth: () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      set({
        isLoggedIn: true,
        currentUser: JSON.parse(storedUser),
        isLoading: false
      });
    } else {
      set({ isLoading: false });
    }
  }
}));

// Hydrate the store with persisted data on the client side
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}