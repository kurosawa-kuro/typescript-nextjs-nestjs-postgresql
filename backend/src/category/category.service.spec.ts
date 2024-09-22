import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { DatabaseService } from '../database/database.service';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    mockDatabaseService = {
      executeQuery: jest.fn(),
      createCategory: jest.fn(),
      listCategories: jest.fn(),
    } as unknown as jest.Mocked<DatabaseService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
  });

  describe('create', () => {
    it('should insert a new category', async () => {
      const title = 'Test Category';
      mockDatabaseService.createCategory.mockResolvedValue({ id: 1, title });

      await categoryService.create(title);

      expect(mockDatabaseService.createCategory).toHaveBeenCalledWith(title);
    });

    it('should throw an error if insertion fails', async () => {
      const title = 'Failed Category';
      mockDatabaseService.createCategory.mockRejectedValue(new Error('Insertion failed'));

      await expect(categoryService.create(title)).rejects.toThrow('Insertion failed');
    });
  });

  describe('list', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];
      mockDatabaseService.listCategories.mockResolvedValue(mockCategories);

      const result = await categoryService.list();

      expect(result).toEqual(mockCategories);
      expect(mockDatabaseService.listCategories).toHaveBeenCalled();
    });

    it('should return an empty array if no categories exist', async () => {
      mockDatabaseService.listCategories.mockResolvedValue([]);

      const result = await categoryService.list();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      mockDatabaseService.listCategories.mockRejectedValue(new Error('Query failed'));

      await expect(categoryService.list()).rejects.toThrow('Query failed');
    });
  });
});