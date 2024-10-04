import { create } from 'zustand';
import { User } from '../types/models';
import { ApiService } from '../lib/api/apiService';

interface AuthState {
  isLoggedIn: boolean;
  currentUser: User | null;
  loginStatus: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  currentUser: null,
  loginStatus: null,

  login: async (email: string, password: string) => {
    try {
      const data = await ApiService.login(email, password);
      if (data.success) {
        set({
          isLoggedIn: true,
          currentUser: data.user,
          loginStatus: 'Login successful'
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        set({ loginStatus: 'Login failed' });
        return false;
      }
    } catch (error) {
      set({ loginStatus: 'Error occurred during login' });
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
      loginStatus: 'Logged out successfully'
    });
  }
}));

// Hydrate the store with persisted data
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  if (storedUser && storedToken) {
    useAuthStore.setState({
      isLoggedIn: true,
      currentUser: JSON.parse(storedUser)
    });
  }
}