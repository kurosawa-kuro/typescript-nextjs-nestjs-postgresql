'use server'

import { revalidatePath } from 'next/cache'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export async function createMicropost(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const image = formData.get('image') as File | null
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

    const response = await fetch(`${API_BASE_URL}/microposts`, {
      method: 'POST',
      body: newFormData,
    })

    if (!response.ok) {
      throw new Error(`Failed to create micropost: ${response.status} ${response.statusText}`)
    }

    const newMicropost = await response.json()

    revalidatePath('/') // Revalidate the home page to show the new micropost
    return { success: true, micropost: newMicropost }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}