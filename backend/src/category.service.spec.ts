import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { Pool } from 'pg';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(async () => {
    // Poolのモックを作成
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
    } as unknown as jest.Mocked<Pool>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
  });

  describe('createCategory', () => {
    it('should insert a new category', async () => {
      const title = 'Test Category';
      (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      await categoryService.createCategory(title);

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO category(title) VALUES($1)',
        [title]
      );
    });

    it('should throw an error if insertion fails', async () => {
      const title = 'Failed Category';
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Insertion failed'));

      await expect(categoryService.createCategory(title)).rejects.toThrow('Insertion failed');
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockCategories });

      const result = await categoryService.getCategories();

      expect(result).toEqual(mockCategories);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM category');
    });

    it('should return an empty array if no categories exist', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await categoryService.getCategories();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Query failed'));

      await expect(categoryService.getCategories()).rejects.toThrow('Query failed');
    });
  });
});