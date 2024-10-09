'use server'

import { Micropost } from '../types/models';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getCategoryMicroposts(categoryId: string): Promise<Micropost[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/microposts`, {
      cache: 'no-cache'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch category microposts');
    }
    const microposts = await response.json();
    return microposts.filter((post: Micropost | undefined) => post !== undefined);
  } catch (error) {
    console.error('Error fetching category microposts:', error);
    return [];
  }
}