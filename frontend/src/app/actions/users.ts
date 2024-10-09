import { User } from '../types/models';
import { cookies } from 'next/headers';
import { ApiClient } from '../api/apiClient';

export async function getUserProfile(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      console.log('No token found in cookies');
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