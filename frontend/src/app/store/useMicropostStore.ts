import { create } from 'zustand';
import { MicropostState, Micropost } from '../types/models';

export const useMicropostStore = create<MicropostState>((set) => ({
  microposts: [],
  isLoading: false,
  error: null,

  setMicroposts: (microposts: Micropost[]) => set({ 
    microposts: microposts.filter(post => post !== undefined),
    isLoading: false,
    error: null
  }),

  addMicropost: (newMicropost: Micropost) => set((state) => ({
    microposts: [newMicropost, ...state.microposts]
  })),

  setError: (error: string) => set({ error, isLoading: false }),

  setLoading: (isLoading: boolean) => set({ isLoading })
}));