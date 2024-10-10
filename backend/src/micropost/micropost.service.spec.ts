import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostService, MicroPost } from './micropost.service';
import { DatabaseService } from '../database/database.service';
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
    //   console.log('Starting test: log appropriate messages');
    //   const userId = 1;
    //   const title = 'Test MicroPost';
    //   const imagePath = 'path/to/image.jpg';
    //   const categoryIds = [1, 2];
    //   const mockMicroPost: MicroPost = {
    //     id: 1,
    //     userId,
    //     title,
    //     userName: 'TestUser',
    //     imagePath,
    //   };

    //   const mockQueryResult: QueryResult = {
    //     rows: [mockMicroPost],
    //     command: '',
    //     rowCount: 1,
    //     oid: 0,
    //     fields: [],
    //   };

    //   mockDatabaseService.executeQuery
    //     .mockResolvedValueOnce(mockQueryResult)
    //     .mockResolvedValueOnce(mockQueryResult)
    //     .mockResolvedValueOnce({ ...mockQueryResult, rows: [] })
    //     .mockResolvedValueOnce({ ...mockQueryResult, rows: [] });

    //   await microPostService.create(userId, title, imagePath, categoryIds);

    //   expect(mockLogger.log).toHaveBeenCalledWith(`Creating micropost: userId=${userId}, title=${title}, imagePath=${imagePath}, categoryIds=${categoryIds}`);
    //   expect(mockLogger.debug).toHaveBeenCalledWith('Transaction begun');
    //   expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Micropost created:'));
    //   expect(mockLogger.debug).toHaveBeenCalledWith(`Categories associated: micropostId=1, categoryIds=${categoryIds}`);
    //   expect(mockLogger.debug).toHaveBeenCalledWith('Transaction committed');
    //   expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Micropost created successfully:'));

    //   console.log('Test completed: log appropriate messages');
    // });
  });
});