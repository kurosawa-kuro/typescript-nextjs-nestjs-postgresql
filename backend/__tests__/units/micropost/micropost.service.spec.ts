import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostService, MicroPost, Category } from '../../../src/micropost/micropost.service';
import { DatabaseService } from '../../../src/database/database.service';
import { QueryResult } from 'pg';
import { Logger } from '@nestjs/common';

describe('MicroPostService', () => {
  let microPostService: MicroPostService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    mockDatabaseService = {
      executeQuery: jest.fn(),
    } as unknown as jest.Mocked<DatabaseService>;

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicroPostService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    microPostService = module.get<MicroPostService>(MicroPostService);
  });

  describe('create', () => {
    it('should create a new micropost with categories', async () => {
      console.log('Starting test: create a new micropost with categories');
      const userId = 1;
      const title = 'Test MicroPost';
      const imagePath = 'path/to/image.jpg';
      const categoryIds = [1, 2];
      const mockMicroPost: MicroPost = {
        id: 1,
        userId,
        title,
        userName: 'TestUser',
        imagePath,
      };

      const mockQueryResult: QueryResult = {
        rows: [mockMicroPost],
        command: '',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      mockDatabaseService.executeQuery
        .mockResolvedValueOnce(mockQueryResult) // BEGIN
        .mockResolvedValueOnce(mockQueryResult) // INSERT micropost
        .mockResolvedValueOnce({ ...mockQueryResult, rows: [] }) // INSERT categories
        .mockResolvedValueOnce({ ...mockQueryResult, rows: [] }); // COMMIT

      const result = await microPostService.create(userId, title, imagePath, categoryIds);
      console.log('Micropost created:', result);

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(4);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO micropost'), [userId, title, imagePath]);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(3, expect.stringContaining('INSERT INTO micropost_category'), [mockMicroPost.id, categoryIds]);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(4, 'COMMIT');
      expect(result).toEqual(mockMicroPost);

      console.log('Test completed: create a new micropost with categories');
    });

    it('should create a new micropost without categories', async () => {
      console.log('Starting test: create a new micropost without categories');
      const userId = 1;
      const title = 'Test MicroPost';
      const imagePath = null;
      const categoryIds: number[] = [];
      const mockMicroPost: MicroPost = {
        id: 1,
        userId,
        title,
        userName: 'TestUser',
        imagePath,
      };

      const mockQueryResult: QueryResult = {
        rows: [mockMicroPost],
        command: '',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      mockDatabaseService.executeQuery
        .mockResolvedValueOnce(mockQueryResult) // BEGIN
        .mockResolvedValueOnce(mockQueryResult) // INSERT micropost
        .mockResolvedValueOnce({ ...mockQueryResult, rows: [] }); // COMMIT

      const result = await microPostService.create(userId, title, imagePath, categoryIds);
      console.log('Micropost created:', result);

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(3);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO micropost'), [userId, title, imagePath]);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(3, 'COMMIT');
      expect(result).toEqual(mockMicroPost);

      console.log('Test completed: create a new micropost without categories');
    });

    it('should rollback transaction on error', async () => {
      console.log('Starting test: rollback transaction on error');
      const userId = 1;
      const title = 'Test MicroPost';
      const imagePath = 'path/to/image.jpg';
      const categoryIds = [1, 2];

      const mockQueryResult: QueryResult = {
        rows: [],
        command: '',
        rowCount: 0,
        oid: 0,
        fields: [],
      };

      mockDatabaseService.executeQuery
        .mockResolvedValueOnce(mockQueryResult) // BEGIN
        .mockRejectedValueOnce(new Error('Database error')) // INSERT micropost fails
        .mockResolvedValueOnce(mockQueryResult); // ROLLBACK

      await expect(microPostService.create(userId, title, imagePath, categoryIds)).rejects.toThrow('Database error');

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(3);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO micropost'), [userId, title, imagePath]);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(3, 'ROLLBACK');

      console.log('Test completed: rollback transaction on error');
    });
  });

  describe('list', () => {
    it('should return all microposts in descending order of id', async () => {
      console.log('Starting test: list all microposts');
      const mockMicroPosts: MicroPost[] = [
        { id: 2, userId: 2, title: 'Post 2', userName: 'User2', imagePath: null },
        { id: 1, userId: 1, title: 'Post 1', userName: 'User1', imagePath: 'path/to/image.jpg' },
      ];

      const mockQueryResult: QueryResult = {
        rows: mockMicroPosts,
        command: '',
        rowCount: mockMicroPosts.length,
        oid: 0,
        fields: [],
      };

      mockDatabaseService.executeQuery.mockResolvedValueOnce(mockQueryResult);

      const result = await microPostService.list();

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(expect.stringContaining('ORDER BY m.id DESC'));
      expect(result).toEqual(mockMicroPosts);
      expect(result[0].id).toBeGreaterThan(result[1].id);
    });

    it('should throw an error if query fails', async () => {
      console.log('Starting test: list microposts error');
      mockDatabaseService.executeQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(microPostService.list()).rejects.toThrow('Database error');
    });
  });

  describe('getCategoriesForMicropost', () => {
    it('should return categories for a given micropost', async () => {
      console.log('Starting test: get categories for micropost');
      const micropostId = 1;
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      const mockQueryResult: QueryResult = {
        rows: mockCategories,
        command: '',
        rowCount: mockCategories.length,
        oid: 0,
        fields: [],
      };

      mockDatabaseService.executeQuery.mockResolvedValueOnce(mockQueryResult);

      const result = await microPostService.getCategoriesForMicropost(micropostId);

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(expect.any(String), [micropostId]);
      expect(result).toEqual(mockCategories);
    });

    it('should return null if no categories are found', async () => {
      console.log('Starting test: no categories found for micropost');
      const micropostId = 1;

      const mockQueryResult: QueryResult = {
        rows: [],
        command: '',
        rowCount: 0,
        oid: 0,
        fields: [],
      };

      mockDatabaseService.executeQuery.mockResolvedValueOnce(mockQueryResult);

      const result = await microPostService.getCategoriesForMicropost(micropostId);

      expect(result).toBeNull();
    });

    it('should throw an error if the query fails', async () => {
      const micropostId = 1;
      const errorMessage = 'Database query failed';
      
      // Mock the executeQuery method to reject with an error
      mockDatabaseService.executeQuery.mockRejectedValueOnce(new Error(errorMessage));
  
      // Expect the service method to throw the same error
      await expect(microPostService.getCategoriesForMicropost(micropostId)).rejects.toThrow(errorMessage);
      
      // Ensure executeQuery was called with the correct arguments
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(expect.any(String), [micropostId]);
    });
  });
});