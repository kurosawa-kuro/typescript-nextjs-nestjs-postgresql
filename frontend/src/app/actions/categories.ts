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
  try {
    const categories = await getCategories()
    const category = categories.find(c => c.title.toLowerCase() === categoryName.toLowerCase())
    return category ? category.id : null
  } catch (error) {
    console.error('Error fetching category id:', error)
    return null
  }
}

export async function getCategoryMicroposts(categoryName: string): Promise<Micropost[]> {
  try {
    const microposts = await ApiClient.get<Micropost[]>(`/categories/${encodeURIComponent(categoryName)}/microposts`)
    return microposts.filter((post): post is Micropost => post !== undefined)
  } catch (error) {
    console.error('Error fetching category microposts:', error)
    return []
  }
}