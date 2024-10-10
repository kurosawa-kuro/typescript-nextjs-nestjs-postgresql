import { createMicropost } from '../../src/app/actions/microposts';
import { ApiClient } from '../../src/app/api/apiClient';
import { Micropost } from '../../src/app/types/models';

jest.mock('../../src/app/api/apiClient');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('createMicropost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a micropost successfully and revalidate the path', async () => {
    const mockTitle = 'Test Micropost';
    const mockUserId = '1';
    const mockImage = new File(['test'], 'test.png', { type: 'image/png' });
    const mockNewMicropost: Micropost = {
      id: 1,
      userId: 1,
      title: mockTitle,
      userName: 'TestUser',
      imagePath: '/uploads/test.png'
    };

    const formData = new FormData();
    formData.append('title', mockTitle);
    formData.append('userId', mockUserId);
    formData.append('image', mockImage);

    (ApiClient.postFormData as jest.Mock).mockResolvedValue(mockNewMicropost);

    const result = await createMicropost(formData);

    expect(ApiClient.postFormData).toHaveBeenCalledWith('/microposts', formData);
    expect(result).toEqual({ success: true, micropost: mockNewMicropost });
    expect(require('next/cache').revalidatePath).toHaveBeenCalledWith('/');
  });

  it('should handle missing required fields', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Micropost');
    // Missing userId and image

    const result = await createMicropost(formData);

    expect(result).toEqual({
      success: false,
      error: 'Missing required fields'
    });
  });

  it('should handle network error', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Micropost');
    formData.append('userId', '1');
    formData.append('image', new File(['test'], 'test.png', { type: 'image/png' }));

    (ApiClient.postFormData as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await createMicropost(formData);

    expect(result).toEqual({
      success: false,
      error: 'Network error'
    });
  });

  it('should handle server error response', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Micropost');
    formData.append('userId', '1');
    formData.append('image', new File(['test'], 'test.png', { type: 'image/png' }));

    (ApiClient.postFormData as jest.Mock).mockRejectedValue(new Error('HTTP error! status: 500'));

    const result = await createMicropost(formData);

    expect(result).toEqual({
      success: false,
      error: 'HTTP error! status: 500'
    });
  });

  it('should handle unknown error', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Micropost');
    formData.append('userId', '1');
    formData.append('image', new File(['test'], 'test.png', { type: 'image/png' }));

    (ApiClient.postFormData as jest.Mock).mockRejectedValue('Unknown error');

    const result = await createMicropost(formData);

    expect(result).toEqual({
      success: false,
      error: 'An unknown error occurred'
    });
  });
});