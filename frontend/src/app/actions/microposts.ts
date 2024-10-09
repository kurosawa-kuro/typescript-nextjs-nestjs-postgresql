'use server'

import { revalidatePath } from 'next/cache'
import { Micropost } from '../types/models'
import { ApiClient } from '../lib/api/apiClient'

export async function createMicropost(formData: FormData): Promise<{ success: boolean; micropost?: Micropost; error?: string }> {
  try {
    const newMicropost = await ApiClient.postFormData<Micropost>('/microposts', formData)
    revalidatePath('/') // Revalidate the home page to show the new micropost
    return { success: true, micropost: newMicropost }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function getMicroposts(): Promise<Micropost[]> {
  try {
    const microposts = await ApiClient.get<Micropost[]>('/microposts')
    return microposts.filter((post): post is Micropost => post !== undefined)
  } catch (error) {
    console.error('Error fetching microposts:', error)
    return []
  }
}