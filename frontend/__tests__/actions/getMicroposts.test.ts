import { getMicroposts } from '../../src/app/actions/getMicroposts';
import { Micropost } from '../../src/app/types/models';

// Mock the global fetch function
global.fetch = jest.fn();

describe('getMicroposts', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch and return microposts successfully', async () => {
    // Mock data
    const mockMicroposts: Micropost[] = [
      { id: 1, userId: 1, title: 'Test Post 1', userName: 'User1' },
      { id: 2, userId: 2, title: 'Test Post 2', userName: 'User2' },
    ];

    // Mock the fetch function to return the mock data
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockMicroposts),
    });

    // Call the function
    const result = await getMicroposts();

    // Assertions
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/microposts');
    expect(result).toEqual(mockMicroposts);
  });
});