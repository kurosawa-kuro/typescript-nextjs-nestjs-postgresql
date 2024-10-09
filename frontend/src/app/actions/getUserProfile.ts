import { User } from '../types/models';
import { cookies } from 'next/headers';

export async function getUserProfile(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    console.log('All cookies:', cookieStore.getAll()); // Keep this for debugging

    const token = cookieStore.get('token')?.value; // Change 'jwt' to 'token'

    if (!token) {
      console.log('No token found in cookies');
      return null;
    }

    console.log('getUserProfile token:', token);

    const response = await fetch('http://localhost:3001/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    console.log('getUserProfile Response:', response);

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