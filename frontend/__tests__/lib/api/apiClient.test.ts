import { ApiClient } from '../../../src/app/lib/api/apiClient';

// Mock the global fetch function
global.fetch = jest.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should make a successful POST request', async () => {
    // Mock data
    const mockResponse = { data: 'test data' };
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchPromise = Promise.resolve({
      ok: true,
      json: () => mockJsonPromise,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);

    // Test data
    const endpoint = '/test-endpoint';
    const body = { key: 'value' };

    // Make the API call
    const result = await ApiClient.post(endpoint, body);

    // Assertions
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/test-endpoint',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
        body: JSON.stringify(body),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle FormData correctly', async () => {
    // Mock data
    const mockResponse = { data: 'test data' };
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchPromise = Promise.resolve({
      ok: true,
      json: () => mockJsonPromise,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);

    // Test data
    const endpoint = '/test-endpoint';
    const formData = new FormData();
    formData.append('key', 'value');

    // Make the API call
    const result = await ApiClient.postFormData(endpoint, formData);

    // Assertions
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/test-endpoint',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
        body: formData,
      })
    );
    expect(result).toEqual(mockResponse);
  });
});