// frontend\src\app\actions\users.ts

import { User } from '../types/models';
import { cookies } from 'next/headers';

export async function getUserProfile(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value; // Change 'jwt' to 'token'

    if (!token) {
      console.log('No token found in cookies');
      return null;
    }

    const response = await fetch('http://localhost:3001/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}