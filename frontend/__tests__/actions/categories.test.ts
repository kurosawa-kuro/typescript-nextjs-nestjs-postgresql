// frontend\__tests__\actions\categories.test.ts

import { getCategories, getCategoryId, getCategoryMicroposts } from '../../src/app/actions/categories';
import { ApiClient } from '../../src/app/api/apiClient';
import { Category, Micropost } from '../../src/app/types/models';

jest.mock('../../src/app/api/apiClient');

describe('Category Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should fetch and return categories successfully', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategories();

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual(mockCategories);
    });

    it('should handle fetch error and return empty array', async () => {
      (ApiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await getCategories();

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual([]);
    });

    it('should filter out undefined categories', async () => {
      const mockCategories = [
        { id: 1, title: 'Category 1' },
        undefined,
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategories();

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual([
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ]);
    });
  });

  describe('getCategoryId', () => {
    it('should return the correct category id', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategoryId('Category 1');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toBe(1);
    });

    it('should return null if category is not found', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategoryId('Non-existent Category');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toBeNull();
    });

    it('should handle fetch error and return null', async () => {
      (ApiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await getCategoryId('Category 1');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toBeNull();
    });

    it('should handle case when getCategories returns an empty array', async () => {
      (ApiClient.get as jest.Mock).mockResolvedValue([]);

      const result = await getCategoryId('Category 1');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toBeNull();
    });

    it('should handle case-insensitive category name matching', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategoryId('cAtEgOrY 1');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toBe(1);
    });
  });

  describe('getCategoryMicroposts', () => {
    it('should fetch and return microposts for a category successfully', async () => {
      const mockMicroposts: Micropost[] = [
        { id: 1, userId: 1, title: 'Post 1', userName: 'User1' },
        { id: 2, userId: 2, title: 'Post 2', userName: 'User2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockMicroposts);

      const result = await getCategoryMicroposts('Category 1');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories/Category%201/microposts');
      expect(result).toEqual(mockMicroposts);
    });

    it('should handle fetch error and return empty array', async () => {
      (ApiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await getCategoryMicroposts('Category 1');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories/Category%201/microposts');
      expect(result).toEqual([]);
    });

    it('should filter out undefined microposts', async () => {
      const mockMicroposts = [
        { id: 1, userId: 1, title: 'Post 1', userName: 'User1' },
        undefined,
        { id: 2, userId: 2, title: 'Post 2', userName: 'User2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockMicroposts);

      const result = await getCategoryMicroposts('Category 1');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories/Category%201/microposts');
      expect(result).toEqual([
        { id: 1, userId: 1, title: 'Post 1', userName: 'User1' },
        { id: 2, userId: 2, title: 'Post 2', userName: 'User2' },
      ]);
    });
  });
});