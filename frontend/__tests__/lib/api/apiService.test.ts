import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApiService } from '../../../src/app/lib/api/apiService';
import { ApiClient } from '../../../src/app/lib/api/apiClient';
import { LoginResponse } from '../../../src/app/types/models';

// Mock the ApiClient
jest.mock('../../../src/app/lib/api/apiClient');

describe('ApiService - login', () => {
  const mockEmail = 'test@example.com';
  const mockPassword = 'password123';
  const mockUser = { id: 1, name: 'Test User', email: mockEmail };
  const mockLoginResponse: LoginResponse = {
    success: true,
    message: 'Login successful',
    token: 'mock-token',
    user: mockUser,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should successfully login and return user data', async () => {
    // Mock the ApiClient.post method
    (ApiClient.post as jest.Mock).mockResolvedValue(mockLoginResponse);

    // Call the login method
    const result = await ApiService.login(mockEmail, mockPassword);

    // Assertions
    expect(ApiClient.post).toHaveBeenCalledWith('/auth/login', { email: mockEmail, password: mockPassword });
    expect(result).toEqual(mockLoginResponse);
    expect(result.success).toBe(true);
    expect(result.user).toEqual(mockUser);
    expect(result.token).toBe('mock-token');
  });
});