'use server'

import { revalidatePath } from 'next/cache'
import { Micropost } from '../types/models'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, options)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function createMicropost(formData: FormData): Promise<{ success: boolean; micropost?: Micropost; error?: string }> {
  try {
    const title = formData.get('title') as string
    const image = formData.get('image') as File | null
    const userId = formData.get('userId') as string
    const categoryIds = formData.getAll('categoryIds[]') as string[]

    if (!title || !userId) {
      throw new Error('Missing required fields')
    }

    const newFormData = new FormData()
    newFormData.append('title', title)
    newFormData.append('userId', userId)
    if (image) {
      newFormData.append('image', image)
    }
    categoryIds.forEach((categoryId) => {
      newFormData.append('categoryIds[]', categoryId)
    })

    const newMicropost = await fetchApi<Micropost>('/microposts', {
      method: 'POST',
      body: newFormData,
    })

    revalidatePath('/') // Revalidate the home page to show the new micropost
    return { success: true, micropost: newMicropost }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function getMicroposts(): Promise<Micropost[]> {
  try {
    const microposts = await fetchApi<Micropost[]>('/microposts', {
      cache: 'no-cache'
    })
    return microposts.filter((post): post is Micropost => post !== undefined)
  } catch (error) {
    console.error('Error fetching microposts:', error)
    return []
  }
}