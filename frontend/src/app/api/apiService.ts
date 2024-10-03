// frontend\src\app\api\apiService.ts

import { Micropost, LoginResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const ApiService = {
  fetchMicroposts: async (): Promise<Micropost[]> => {
    const response = await fetch(`${API_URL}/microposts`);

    if (!response.ok) {
      throw new Error('Failed to fetch microposts');
    }

    return response.json();
  },

  createMicropost: async (formData: FormData): Promise<Micropost> => {
    const response = await fetch(`${API_URL}/microposts`, {
      method: 'POST',
      body: formData,
    });
    console.log('response' ,response);
    if (!response.ok) {
      throw new Error('Failed to create micropost');
    }
    const data = await response.json();
    return data.micropost;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }
};