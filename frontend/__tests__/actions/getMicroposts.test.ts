import { getMicroposts } from '../../src/app/actions/microposts';
import { ApiClient } from '../../src/app/api/apiClient';

jest.mock('../../src/app/api/apiClient');

describe('getMicroposts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and return microposts successfully', async () => {
    const mockMicroposts = [
      { id: 1, userId: 1, title: 'Test Post 1', userName: 'User1' },
      { id: 2, userId: 2, title: 'Test Post 2', userName: 'User2' },
    ];

    (ApiClient.get as jest.Mock).mockResolvedValue(mockMicroposts);

    const result = await getMicroposts();

    expect(ApiClient.get).toHaveBeenCalledWith('/microposts');
    expect(result).toEqual(mockMicroposts);
  });

  it('should handle fetch error and return empty array', async () => {
    (ApiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await getMicroposts();

    expect(ApiClient.get).toHaveBeenCalledWith('/microposts');
    expect(result).toEqual([]);
  });

  it('should filter out undefined posts', async () => {
    const mockMicroposts = [
      { id: 1, userId: 1, title: 'Test Post 1', userName: 'User1' },
      undefined,
      { id: 2, userId: 2, title: 'Test Post 2', userName: 'User2' },
    ];

    (ApiClient.get as jest.Mock).mockResolvedValue(mockMicroposts);

    const result = await getMicroposts();

    expect(ApiClient.get).toHaveBeenCalledWith('/microposts');
    expect(result).toEqual([
      { id: 1, userId: 1, title: 'Test Post 1', userName: 'User1' },
      { id: 2, userId: 2, title: 'Test Post 2', userName: 'User2' },
    ]);
  });
});