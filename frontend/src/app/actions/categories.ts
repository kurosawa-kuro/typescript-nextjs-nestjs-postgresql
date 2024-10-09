// frontend\src\app\actions\categories.ts

'use server'

import { Category, Micropost } from '../types/models'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    cache: 'no-cache'
  })
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await fetchApi<Category[]>('/categories')
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
    const microposts = await fetchApi<Micropost[]>(`/categories/${encodeURIComponent(categoryName)}/microposts`)
    return microposts.filter((post): post is Micropost => post !== undefined)
  } catch (error) {
    console.error('Error fetching category microposts:', error)
    return []
  }
}