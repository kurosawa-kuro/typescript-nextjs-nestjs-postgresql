import { Test, TestingModule } from '@nestjs/testing';
import { MicropostCategoryService } from './micropost-category.service';
import { Pool } from 'pg';

// Create a mock type for Pool
type MockPool = {
  query: jest.Mock;
};

describe('MicropostCategoryService', () => {
  let service: MicropostCategoryService;
  let mockPool: MockPool;

  beforeEach(async () => {
    // Create a mock pool
    mockPool = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicropostCategoryService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<MicropostCategoryService>(MicropostCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMicropostCategories', () => {
    it('should return categories for a given micropost', async () => {
      const mockCategories = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];
      mockPool.query.mockResolvedValue({ rows: mockCategories });

      const result = await service.getMicropostCategories(1);

      expect(result).toEqual(mockCategories);
      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [1]);
    });
  });

  describe('getCategoryMicroposts', () => {
    it('should return microposts for a given category', async () => {
      const mockMicroposts = [
        { id: 1, title: 'Micropost 1', user_id: 1, user_name: 'User 1' },
        { id: 2, title: 'Micropost 2', user_id: 2, user_name: 'User 2' },
      ];
      mockPool.query.mockResolvedValue({ rows: mockMicroposts });

      const result = await service.getCategoryMicroposts(1);

      expect(result).toEqual(mockMicroposts);
      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [1]);
    });
  });

  describe('addCategoryToMicropost', () => {
    it('should add a category to a micropost', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 1 });

      await service.addCategoryToMicropost(1, 1);

      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [1, 1]);
    });

    it('should throw an error if the insertion fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Insertion failed'));

      await expect(service.addCategoryToMicropost(1, 1)).rejects.toThrow('Insertion failed');
    });
  });
});