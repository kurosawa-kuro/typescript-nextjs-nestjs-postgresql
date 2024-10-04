// frontend\src\app\store\useMicropostStore.ts

import { create } from 'zustand';
import { MicropostState, Micropost } from '../types/models';
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
      set({ 
        error: 'Error fetching microposts. Please try again later.', 
        isLoading: false 
      });
      console.error('Failed to fetch microposts:', error);
    }
  },

  createMicropost: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const newMicropost = await ApiService.createMicropost(formData);
      if (newMicropost) {
        get().addMicropost(newMicropost);
      }
      set({ isLoading: false });
      return newMicropost;
    } catch (error) {
      set({ error: 'Failed to create micropost', isLoading: false });
      console.error('Failed to create micropost:', error);
      return null;
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