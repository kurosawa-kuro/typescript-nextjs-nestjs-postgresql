import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostService, MicroPost } from './micropost.service';
import { DatabaseService } from '../database/database.service';

describe('MicroPostService', () => {
  let microPostService: MicroPostService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    mockDatabaseService = {
      createMicroPost: jest.fn(),
      listMicroPosts: jest.fn(),
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

      mockDatabaseService.createMicroPost.mockResolvedValue(mockMicroPost);

      const result = await microPostService.create(userId, title, imagePath);

      expect(result).toEqual(mockMicroPost);
      expect(mockDatabaseService.createMicroPost).toHaveBeenCalledWith(userId, title, imagePath);
    });

    it('should throw error if creation fails', async () => {
      const userId = 1;
      const title = 'Failed MicroPost';
      const imagePath = null;

      mockDatabaseService.createMicroPost.mockRejectedValue(new Error('Creation failed'));

      await expect(
        microPostService.create(userId, title, imagePath),
      ).rejects.toThrow('Creation failed');
    });
  });

  describe('list', () => {
    it('should return all microposts', async () => {
      const mockMicroPosts: MicroPost[] = [
        {
          id: 1,
          userId: 1,
          title: 'MicroPost 1',
          userName: 'User1',
          imagePath: 'path/to/image1.jpg',
        },
        {
          id: 2,
          userId: 2,
          title: 'MicroPost 2',
          userName: 'User2',
          imagePath: null,
        },
      ];

      mockDatabaseService.listMicroPosts.mockResolvedValue(mockMicroPosts);

      const result = await microPostService.list();

      expect(result).toEqual(mockMicroPosts);
      expect(mockDatabaseService.listMicroPosts).toHaveBeenCalled();
    });

    it('should return an empty array if no microposts exist', async () => {
      mockDatabaseService.listMicroPosts.mockResolvedValue([]);

      const result = await microPostService.list();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      mockDatabaseService.listMicroPosts.mockRejectedValue(new Error('Query failed'));

      await expect(microPostService.list()).rejects.toThrow('Query failed');
    });
  });
});