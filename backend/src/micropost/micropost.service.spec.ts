import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostService, MicroPost } from './micropost.service';
import { DatabaseService } from '../database/database.service';
import { BadRequestException } from '@nestjs/common';

describe('MicroPostService', () => {
  let microPostService: MicroPostService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    mockDatabaseService = {
      executeQuery: jest.fn(),
    } as unknown as jest.Mocked<DatabaseService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicroPostService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    microPostService = module.get<MicroPostService>(MicroPostService);
  });

  describe('create', () => {
    it('should create a new micropost', async () => {
      const userId = 1;
      const title = 'Test MicroPost';
      const imagePath = 'path/to/image.jpg';
      const mockMicroPost: MicroPost = {
        id: 1,
        userId,
        title,
        userName: 'TestUser',
        imagePath,
      };

      mockDatabaseService.executeQuery.mockResolvedValue({
        rows: [mockMicroPost],
        command: '',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await microPostService.create(userId, title, imagePath);

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        expect.any(String),
        [userId, title, imagePath]
      );
      expect(result).toEqual(mockMicroPost);
    });

    it('should create a new micropost with null image path', async () => {
      const userId = 1;
      const title = 'Test MicroPost';
      const imagePath = null;
      const mockMicroPost: MicroPost = {
        id: 1,
        userId,
        title,
        userName: 'TestUser',
        imagePath,
      };

      mockDatabaseService.executeQuery.mockResolvedValue({
        rows: [mockMicroPost],
        command: '',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await microPostService.create(userId, title, imagePath);

      expect(result).toEqual(mockMicroPost);
    });

    it('should throw error if creation fails due to database constraint', async () => {
      const userId = 1;
      const title = 'Test MicroPost';
      const imagePath = 'path/to/image.jpg';

      mockDatabaseService.executeQuery.mockRejectedValue(new Error('Unique constraint violation'));

      await expect(
        microPostService.create(userId, title, imagePath)
      ).rejects.toThrow('Unique constraint violation');
    });
  });

  describe('list', () => {
    it('should return all microposts in descending order of id', async () => {
      const mockMicroPosts: MicroPost[] = [
        {
          id: 2,
          userId: 2,
          title: 'MicroPost 2',
          userName: 'User2',
          imagePath: null,
        },
        {
          id: 1,
          userId: 1,
          title: 'MicroPost 1',
          userName: 'User1',
          imagePath: 'path/to/image1.jpg',
        },
      ];

      mockDatabaseService.executeQuery.mockResolvedValue({
        rows: mockMicroPosts,
        command: '',
        rowCount: mockMicroPosts.length,
        oid: 0,
        fields: []
      });

      const result = await microPostService.list();

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(expect.stringContaining('ORDER BY m.id DESC'));
      expect(result).toEqual(mockMicroPosts);
      expect(result[0].id).toBeGreaterThan(result[1].id);
    });

    it('should return an empty array if no microposts exist', async () => {
      mockDatabaseService.executeQuery.mockResolvedValue({
        rows: [],
        command: '',
        rowCount: 0,
        oid: 0,
        fields: []
      });

      const result = await microPostService.list();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      mockDatabaseService.executeQuery.mockRejectedValue(new Error('Query failed'));

      await expect(microPostService.list()).rejects.toThrow('Query failed');
    });
  });
});