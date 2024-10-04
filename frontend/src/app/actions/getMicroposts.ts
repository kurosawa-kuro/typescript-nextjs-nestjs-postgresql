'use server'

import { Micropost } from '../types/models';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getMicroposts(): Promise<Micropost[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/microposts`);
    if (!response.ok) {
      throw new Error('Failed to fetch microposts');
    }
    const microposts = await response.json();
    return microposts.filter((post: Micropost | undefined) => post !== undefined);
  } catch (error) {
    console.error('Error fetching microposts:', error);
    return [];
  }
}