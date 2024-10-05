import { createMicropost } from '../../src/app/actions/createMicropost';
import { Micropost } from '../../src/app/types/models';

// Mock the global fetch function
global.fetch = jest.fn();

// Mock the revalidatePath function
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('createMicropost', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should create a micropost successfully', async () => {
    // Mock data
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

    // Create FormData for the test
    const formData = new FormData();
    formData.append('title', mockTitle);
    formData.append('userId', mockUserId);
    formData.append('image', mockImage);

    // Mock the fetch function to return the mock data
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockNewMicropost),
    });

    // Call the function
    const result = await createMicropost(formData);

    // Assertions
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/microposts', {
      method: 'POST',
      body: expect.any(FormData),
    });
    expect(result).toEqual({ success: true, micropost: mockNewMicropost });
    expect(require('next/cache').revalidatePath).toHaveBeenCalledWith('/');
  });
});