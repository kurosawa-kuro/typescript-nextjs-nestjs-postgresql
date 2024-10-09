import { LoginResponse } from '../types/models';
import { ApiClient } from './apiClient';

export const ApiService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await ApiClient.post<LoginResponse>('/auth/login', { email, password });
    if (!response || !response.success) {
      throw new Error(response?.message || 'Login failed');
    }
    return response;
  }
};