import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostService, MicroPost } from './micropost.service';
import { Pool, QueryResult } from 'pg';

describe('MicroPostService', () => {
  let microPostService: MicroPostService;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Pool>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicroPostService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
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
      const userName = 'TestUser';
      const mockMicroPost: MicroPost = {
        id: 1,
        userId,
        title,
        userName,
        imagePath,
      };

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockMicroPost] } as QueryResult);

      const result = await microPostService.create(userId, title, imagePath);

      expect(result).toEqual(mockMicroPost);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          'INSERT INTO micropost(user_id, title, image_path)',
        ),
        [userId, title, imagePath],
      );
    });

    it('should throw error if insertion fails', async () => {
      const userId = 1;
      const title = 'Failed MicroPost';
      const imagePath = null;

      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Insertion failed'));

      await expect(
        microPostService.create(userId, title, imagePath),
      ).rejects.toThrow('Insertion failed');
    });
  });

  describe('index', () => {
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

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockMicroPosts } as QueryResult);

      const result = await microPostService.index();

      expect(result).toEqual(mockMicroPosts);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT m.id, m.user_id as "userId", m.title, m.image_path as "imagePath", u.name as "userName"',
        ),
      );
    });

    it('should return an empty array if no microposts exist', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] } as QueryResult);

      const result = await microPostService.index();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Query failed'));

      await expect(microPostService.index()).rejects.toThrow('Query failed');
    });
  });
});