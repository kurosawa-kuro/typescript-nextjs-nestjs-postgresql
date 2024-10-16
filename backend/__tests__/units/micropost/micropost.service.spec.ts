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
      const userId = 1;
      const title = 'Test MicroPost';
      const imagePath = 'path/to/image.jpg';
      const categoryIds = [1, 2];
      const mockMicroPost: MicroPost = {
        id: 1,
        title,
        imagePath,
        user: {
          id: userId,
          name: 'TestUser',
          avatarPath: 'path/to/avatar.jpg',
        },
        categories: [],
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

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(4);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO micropost'), [userId, title, imagePath]);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(3, expect.stringContaining('INSERT INTO micropost_category'), [mockMicroPost.id, categoryIds]);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(4, 'COMMIT');
      expect(result).toEqual(mockMicroPost);
    });

    it('should create a new micropost without categories', async () => {
      const userId = 1;
      const title = 'Test MicroPost';
      const imagePath = null;
      const categoryIds: number[] = [];
      const mockMicroPost: MicroPost = {
        id: 1,
        title,
        imagePath,
        user: {
          id: userId,
          name: 'TestUser',
          avatarPath: 'path/to/avatar.jpg',
        },
        categories: [],
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

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(3);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO micropost'), [userId, title, imagePath]);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(3, 'COMMIT');
      expect(result).toEqual(mockMicroPost);
    });

    it('should rollback transaction on error', async () => {
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
    });

    it('should rollback transaction if COMMIT fails', async () => {
      const userId = 1;
      const title = 'Test MicroPost';
      const imagePath = 'path/to/image.jpg';
      const categoryIds = [1, 2];

      const mockMicroPost: MicroPost = {
        id: 1,
        title,
        imagePath,
        user: {
          id: userId,
          name: 'TestUser',
          avatarPath: 'path/to/avatar.jpg',
        },
        categories: [],
      };

      const mockQueryResult: QueryResult = {
        rows: [mockMicroPost],
        command: '',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      mockDatabaseService.executeQuery
        .mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] }) // BEGIN
        .mockResolvedValueOnce(mockQueryResult) // INSERT micropost
        .mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] }) // INSERT categories
        .mockRejectedValueOnce(new Error('COMMIT failed')) // COMMIT fails
        .mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] }); // ROLLBACK

      await expect(microPostService.create(userId, title, imagePath, categoryIds)).rejects.toThrow('COMMIT failed');

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(5);
      expect(mockDatabaseService.executeQuery).toHaveBeenNthCalledWith(5, 'ROLLBACK');
    });
  });

  describe('list', () => {
    it('should return all microposts in descending order of id', async () => {
      const mockMicroPosts: MicroPost[] = [
        { 
          id: 2, 
          title: 'Post 2', 
          imagePath: null, 
          user: { id: 2, name: 'User2', avatarPath: 'path/to/avatar2.jpg' }, 
          categories: [] 
        },
        { 
          id: 1, 
          title: 'Post 1', 
          imagePath: 'path/to/image.jpg', 
          user: { id: 1, name: 'User1', avatarPath: 'path/to/avatar1.jpg' }, 
          categories: [] 
        },
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
      mockDatabaseService.executeQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(microPostService.list()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return a micropost when found', async () => {
      const micropostId = 1;
      const mockMicropost: MicroPost = {
        id: micropostId,
        title: 'Test Micropost',
        imagePath: 'path/to/image.jpg',
        user: {
          id: 1,
          name: 'User1',
          avatarPath: 'path/to/avatar.jpg',
        },
        categories: [{ id: 1, title: 'Category 1' }],
      };

      const mockQueryResult: QueryResult = {
        rows: [mockMicropost],
        command: '',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      mockDatabaseService.executeQuery.mockResolvedValueOnce(mockQueryResult);

      const result = await microPostService.findById(micropostId);

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(expect.any(String), [micropostId]);
      expect(result).toEqual(mockMicropost);
    });

    it('should return null when micropost is not found', async () => {
      const micropostId = 1;

      const mockQueryResult: QueryResult = {
        rows: [],
        command: '',
        rowCount: 0,
        oid: 0,
        fields: [],
      };

      mockDatabaseService.executeQuery.mockResolvedValueOnce(mockQueryResult);

      const result = await microPostService.findById(micropostId);

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(expect.any(String), [micropostId]);
      expect(result).toBeNull();
    });

    it('should throw an error if executeQuery fails in findById', async () => {
      const micropostId = 1;
      const errorMessage = 'Database error';

      mockDatabaseService.executeQuery.mockRejectedValueOnce(new Error(errorMessage));

      await expect(microPostService.findById(micropostId)).rejects.toThrow(errorMessage);

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(expect.any(String), [micropostId]);
    });
  });

  describe('getCategoriesForMicropost', () => {
    it('should return categories for a given micropost', async () => {
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
      
      mockDatabaseService.executeQuery.mockRejectedValueOnce(new Error(errorMessage));
  
      await expect(microPostService.getCategoriesForMicropost(micropostId)).rejects.toThrow(errorMessage);
      
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(expect.any(String), [micropostId]);
    });
  });
});