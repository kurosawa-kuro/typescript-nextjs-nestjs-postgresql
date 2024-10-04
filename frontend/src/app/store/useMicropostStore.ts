// src/app/store/useMicropostStore.ts
import { create } from 'zustand';
import { Micropost } from '../types/models';
import { ApiService } from '../lib/api/apiService';

interface MicropostState {
  microposts: Micropost[];
  setMicroposts: (microposts: Micropost[]) => void;
  addMicropost: (newMicropost: Micropost) => void;
  createMicropost: (formData: FormData) => Promise<void>;
}

export const useMicropostStore = create<MicropostState>((set) => ({
  microposts: [],
  setMicroposts: (microposts) => {
    console.log('Setting microposts in store:', microposts);
    set({ microposts });
  },
  addMicropost: (newMicropost) => set((state) => {
    console.log('Adding new micropost:', newMicropost);
    return { microposts: [newMicropost, ...state.microposts] };
  }),
  createMicropost: async (formData: FormData) => {
    try {
      await ApiService.createMicropost(formData);
      const updatedMicroposts = await ApiService.fetchMicroposts();
      set({ microposts: updatedMicroposts });
      console.log('Microposts updated after creation');
    } catch (err) {
      console.error('Error creating micropost:', err);
    }
  },
}));