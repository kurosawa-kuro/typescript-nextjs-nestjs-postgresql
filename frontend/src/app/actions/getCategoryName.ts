'use server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getCategoryName(categoryId: string): Promise<string> {
  try {
    console.log('categoryId:', categoryId);
    const response = await fetch(`${API_BASE_URL}/categories`, {
      cache: 'no-cache'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const categories = await response.json();
    console.log('categories:', categories);
    const category = categories.find((c: any) => c.id === parseInt(categoryId, 10));
    return category ? category.title : 'Unknown Category';
  } catch (error) {
    console.error('Error fetching category name:', error);
    return 'Unknown Category';
  }
}