'use server'

import { Category, Micropost } from '../types/models'
import { ApiClient } from '../api/apiClient'

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await ApiClient.get<Category[]>('/categories')
    return categories.filter((category): category is Category => category !== undefined)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getCategoryId(categoryName: string): Promise<number | null> {
  const categories = await getCategories()
  const category = categories.find(c => c.title.toLowerCase() === categoryName.toLowerCase())
  return category ? category.id : null
}

export async function getCategoryMicroposts(categoryName: string): Promise<Micropost[]> {
  try {
    const categoryId = await getCategoryId(categoryName);
    if (!categoryId) {
      console.error('Category not found:', categoryName);
      return [];
    }
    const microposts = await ApiClient.get<Micropost[]>(`/categories/${categoryId}/microposts`);
    return microposts.filter((post): post is Micropost => post !== undefined);
  } catch (error) {
    console.error('Error fetching category microposts:', error);
    return [];
  }
}
