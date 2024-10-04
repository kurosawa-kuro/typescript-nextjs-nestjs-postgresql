// app/actions/createMicropost.ts
'use server'

import { revalidatePath } from 'next/cache'
import { ApiService } from '../lib/api/apiService'

export async function createMicropost(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const image = formData.get('image') as File
    const userId = formData.get('userId') as string

    if (!title || !userId) {
      throw new Error('Missing required fields')
    }

    const newFormData = new FormData()
    newFormData.append('title', title)
    newFormData.append('userId', userId)
    if (image) {
      newFormData.append('image', image)
    }

    const newMicropost = await ApiService.createMicropost(newFormData)

    if (newMicropost) {
      revalidatePath('/') // Revalidate the home page to show the new micropost
      return { success: true, micropost: newMicropost }
    } else {
      return { success: false, error: 'Failed to create micropost' }
    }
  } catch (error) {
    console.error('Error in createMicropost:', error)
    return { success: false, error: 'An error occurred while creating the micropost' }
  }
}