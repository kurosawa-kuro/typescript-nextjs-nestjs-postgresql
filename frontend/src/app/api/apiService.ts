import { LoginResponse, User } from '../types/models';
import { ApiClient } from './apiClient';

export const ApiService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await ApiClient.post<LoginResponse>('/auth/login', { email, password });
    if (!response || !response.success) {
      throw new Error(response?.message || 'Login failed');
    }
    return response;
  },

  getUserProfile: async (): Promise<User> => {
    const response = await ApiClient.get<User>('/auth/profile');
    if (!response) {
      throw new Error('Failed to get user profile');
    }
    return response;
  }
};