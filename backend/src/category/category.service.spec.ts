import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { DatabaseService } from '../database/database.service';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    mockDatabaseService = {
      executeQuery: jest.fn(),
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
      const mockCategory = { id: 1, title };
      mockDatabaseService.executeQuery.mockResolvedValue({
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        rows: [mockCategory],
        fields: [],
      });

      const result = await categoryService.create(title);

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        'INSERT INTO category(title) VALUES($1) RETURNING id, title',
        [title]
      );
      expect(result).toEqual(mockCategory);
    });

    it('should throw an error if insertion fails', async () => {
      const title = 'Failed Category';
      mockDatabaseService.executeQuery.mockRejectedValue(new Error('Insertion failed'));

      await expect(categoryService.create(title)).rejects.toThrow('Insertion failed');
    });
  });

  describe('list', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];
      mockDatabaseService.executeQuery.mockResolvedValue({
        command: '',
        rowCount: mockCategories.length,
        oid: 0,
        rows: mockCategories,
        fields: [],
      });

      const result = await categoryService.list();

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith('SELECT * FROM category');
      expect(result).toEqual(mockCategories);
    });

    it('should return an empty array if no categories exist', async () => {
      mockDatabaseService.executeQuery.mockResolvedValue({
        command: '',
        rowCount: 0,
        oid: 0,
        rows: [],
        fields: [],
      });

      const result = await categoryService.list();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      mockDatabaseService.executeQuery.mockRejectedValue(new Error('Query failed'));

      await expect(categoryService.list()).rejects.toThrow('Query failed');
    });
  });
});
