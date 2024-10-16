// frontend\src\app\store\useMicropostStore.ts

import { create } from 'zustand';
import { MicroPostState, MicroPost } from '../types/models';

export const useMicropostStore = create<MicroPostState>((set) => ({
  MicroPosts: [],
  isLoading: false,
  error: null,

  setMicroPosts: (MicroPosts: MicroPost[]) => set({ 
    MicroPosts: MicroPosts.filter(post => post !== undefined),
    isLoading: false,
    error: null
  }),

  addMicroPost: (newMicroPost: MicroPost) => set((state) => ({
    MicroPosts: [newMicroPost, ...state.MicroPosts]
  })),

  setError: (error: string) => set({ error, isLoading: false }),

  setLoading: (isLoading: boolean) => set({ isLoading })
}));