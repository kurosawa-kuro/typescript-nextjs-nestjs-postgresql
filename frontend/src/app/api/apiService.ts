// frontend\src\app\api\apiService.ts

import { Micropost, LoginResponse } from '../types';

const API_URL = 'http://localhost:3001/microposts';

export const ApiService = {
  fetchMicroposts: async (): Promise<Micropost[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch microposts');
    }
    return response.json();
  },

  createMicropost: async (formData: FormData): Promise<Micropost> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to create micropost');
    }
    const data = await response.json();
    return data.micropost;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }
};