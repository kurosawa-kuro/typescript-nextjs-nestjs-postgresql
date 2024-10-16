'use server'

import { revalidatePath } from 'next/cache'
import { MicroPost } from '../types/models'
import { ApiClient } from '../services/apiClient'

export async function createMicropost(formData: FormData): Promise<{ success: boolean; micropost?: MicroPost; error?: string }> {
  try {
    // Check for required fields
    const title = formData.get('title');
    const userId = formData.get('userId');
    const image = formData.get('image');

    if (!title || !userId || !image) {
      return { success: false, error: 'Missing required fields' };
    }

    const newMicropost = await ApiClient.postFormData<MicroPost>('/microposts', formData)
    revalidatePath('/') // Revalidate the home page to show the new micropost
    return { success: true, micropost: newMicropost }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    } else {
      return { success: false, error: 'An unknown error occurred' };
    }
  }
}

export async function getMicroposts(): Promise<MicroPost[]> {
  try {
    const microposts = await ApiClient.get<MicroPost[]>('/microposts')
    return microposts.filter((post): post is MicroPost => post !== undefined)
  } catch (error) {
    console.error('Error fetching microposts:', error)
    return []
  }
}