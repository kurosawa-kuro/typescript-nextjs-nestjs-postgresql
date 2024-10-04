import { create } from 'zustand';
import { AuthState, User } from '../types/models';
import { ApiService } from '../lib/api/apiService';

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  currentUser: null,
  loginStatus: null,
  isLoading: true,
  error: null,

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
        set({ loginStatus: 'Login failed', isLoading: false, error: 'Invalid credentials' });
        return false;
      }
    } catch (error: any) {
      set({ loginStatus: 'Error occurred during login', isLoading: false, error: error.message });
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