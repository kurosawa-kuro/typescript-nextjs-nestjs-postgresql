// frontend\src\app\actions\users.ts

import { User } from '../types/models';
import { cookies } from 'next/headers';
import { ApiClient } from '../services/apiClient';

export async function getUserProfile(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const user = await ApiClient.get<User>('/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}