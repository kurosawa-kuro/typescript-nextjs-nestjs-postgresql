'use server'

import { Category } from '../types/models';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      cache: 'no-cache'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const categories = await response.json();
    return categories.filter((category: Category | undefined) => category !== undefined);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}