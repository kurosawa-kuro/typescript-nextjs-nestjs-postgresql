// frontend\src\app\store\useMicropostStore.ts

import { create } from 'zustand';
import { MicropostState, Micropost, ApiError } from '../types/models';
import { ApiService } from '../lib/api/apiService';

export const useMicropostStore = create<MicropostState>((set, get) => ({
  microposts: [],
  isLoading: false,
  error: null,

  setMicroposts: (microposts: Micropost[]) => set({ 
    microposts: microposts.filter(post => post !== undefined) 
  }),

  addMicropost: (newMicropost: Micropost) => {
    set((state) => ({
      microposts: [newMicropost, ...state.microposts]
    }));
  },

  fetchMicroposts: async () => {
    set({ isLoading: true, error: null });
    try {
      const microposts = await ApiService.fetchMicroposts();
      set({ 
        microposts: microposts.filter(post => post !== undefined), 
        isLoading: false 
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({ 
        error: `Error fetching microposts: ${apiError.message || 'Please try again later.'}`, 
        isLoading: false 
      });
      console.error('Failed to fetch microposts:', apiError);
    }
  },

  // 初期化関数を追加
  initializeMicroposts: () => {
    get().fetchMicroposts();
  }
}));

// コンポーネントのマウント時に初期化を行う
if (typeof window !== 'undefined') {
  useMicropostStore.getState().initializeMicroposts();
}