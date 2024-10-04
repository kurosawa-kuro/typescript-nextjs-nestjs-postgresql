// src/app/lib/api/apiService.ts
import { Micropost, LoginResponse } from '../../types/models';
import { ApiClient } from './apiClient';

export const ApiService = {
  fetchMicroposts: async (): Promise<Micropost[]> => {
    const response = await ApiClient.get('/microposts', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to fetch microposts');
    }
    return response.json();
  },

  createMicropost: async (formData: FormData): Promise<Micropost> => {
    const response = await ApiClient.postFormData('/microposts', formData);
    if (!response.ok) {
      throw new Error('Failed to create micropost');
    }
    const data = await response.json();
    return data.micropost;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await ApiClient.post('/auth/login', { email, password });
    return response.json();
  }
};