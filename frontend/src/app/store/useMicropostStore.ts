import { create } from 'zustand';
import { Micropost } from '../types/models';
import { ApiService } from '../lib/api/apiService';

interface MicropostState {
  microposts: Micropost[];
  isLoading: boolean;
  error: string | null;
  setMicroposts: (microposts: Micropost[]) => void;
  addMicropost: (newMicropost: Micropost) => void;
  fetchMicroposts: () => Promise<void>;
  createMicropost: (formData: FormData) => Promise<Micropost | null>;
}

export const useMicropostStore = create<MicropostState>((set, get) => ({
  microposts: [],
  isLoading: false,
  error: null,
  setMicroposts: (microposts) => set({ microposts: microposts.filter(post => post !== undefined) }),
  addMicropost: (newMicropost) => {
    if (newMicropost !== undefined) {
      set((state) => ({
        microposts: [newMicropost, ...state.microposts]
      }));
    }
  },
  fetchMicroposts: async () => {
    set({ isLoading: true, error: null });
    try {
      const microposts = await ApiService.fetchMicroposts();
      set({ microposts: microposts.filter(post => post !== undefined), isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch microposts', isLoading: false });
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
      return null;
    }
  },
}));