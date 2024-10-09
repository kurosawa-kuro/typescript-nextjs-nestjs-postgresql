'use server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getCategoryId(categoryName: string): Promise<number | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      cache: 'no-cache'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const categories = await response.json();
    const category = categories.find((c: any) => c.title.toLowerCase() === categoryName.toLowerCase());
    return category ? category.id : null;
  } catch (error) {
    console.error('Error fetching category id:', error);
    return null;
  }
}