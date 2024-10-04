// src/app/lib/api/apiService.ts

import { Micropost, LoginResponse } from '../../types/models';
import { ApiClient } from './apiClient';

export const ApiService = {
  fetchMicroposts: async (): Promise<Micropost[]> => {
    try {
      return await ApiClient.get<Micropost[]>('/microposts', { cache: 'no-store' });
    } catch (error) {
      console.error('Failed to fetch microposts:', error);
      return [];  // エラー時は空の配列を返す
    }
  },

  createMicropost: async (formData: FormData): Promise<Micropost | null> => {
    try {
      return await ApiClient.postFormData<Micropost>('/microposts', formData);
    } catch (error) {
      console.error('Failed to create micropost:', error);
      return null;
    }
  },

  login: async (email: string, password: string): Promise<LoginResponse | null> => {
    try {
      return await ApiClient.post<LoginResponse>('/auth/login', { email, password });
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  }
};