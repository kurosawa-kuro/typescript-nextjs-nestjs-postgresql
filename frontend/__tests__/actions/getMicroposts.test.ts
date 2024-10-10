import { getMicroposts } from '../../src/app/actions/microposts';
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
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/microposts', { cache: 'no-cache' });
    expect(result).toEqual(mockMicroposts);
  });

  it('should handle fetch error and return empty array', async () => {
    // Mock fetch to simulate a network error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Call the function
    const result = await getMicroposts();

    // Assertions
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/microposts', { cache: 'no-cache' });
    expect(result).toEqual([]);
  });

  it('should handle non-ok response and return empty array', async () => {
    // Mock fetch to simulate a non-ok response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    // Call the function
    const result = await getMicroposts();

    // Assertions
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/microposts', { cache: 'no-cache' });
    expect(result).toEqual([]);
  });

  it('should filter out undefined posts', async () => {
    // Mock data with an undefined post
    const mockMicroposts = [
      { id: 1, userId: 1, title: 'Test Post 1', userName: 'User1' },
      undefined,
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
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/microposts', { cache: 'no-cache' });
    expect(result).toEqual([
      { id: 1, userId: 1, title: 'Test Post 1', userName: 'User1' },
      { id: 2, userId: 2, title: 'Test Post 2', userName: 'User2' },
    ]);
  });
});