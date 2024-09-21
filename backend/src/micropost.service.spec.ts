import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostService, MicroPost } from './micropost.service';
import { Pool } from 'pg';

describe('MicroPostService', () => {
  let microPostService: MicroPostService;
  let mockPool: jest.Mocked<Pool>;
  let mockClient: jest.Mocked<any>;

  beforeEach(async () => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
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

  describe('createMicroPost', () => {
    it('should create a new micropost', async () => {
      const userId = 1;
      const title = 'Test MicroPost';
      const mockMicroPost: MicroPost = { id: 1, userId, title };

      (mockClient.query as jest.Mock).mockImplementation((query) => {
        if (query === 'BEGIN' || query === 'COMMIT') {
          return Promise.resolve();
        }
        return Promise.resolve({ rows: [mockMicroPost] });
      });

      const result = await microPostService.createMicroPost(userId, title);

      expect(result).toEqual(mockMicroPost);
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO micropost(user_id, title) VALUES($1, $2) RETURNING id, user_id as "userId", title',
        [userId, title]
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback and throw error if insertion fails', async () => {
      const userId = 1;
      const title = 'Failed MicroPost';

      (mockClient.query as jest.Mock).mockImplementation((query) => {
        if (query === 'BEGIN') {
          return Promise.resolve();
        }
        if (query === 'ROLLBACK') {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Insertion failed'));
      });

      await expect(microPostService.createMicroPost(userId, title)).rejects.toThrow('Insertion failed');

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getMicroPosts', () => {
    it('should return all microposts', async () => {
      const mockMicroPosts: MicroPost[] = [
        { id: 1, userId: 1, title: 'MicroPost 1' },
        { id: 2, userId: 2, title: 'MicroPost 2' },
      ];

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockMicroPosts });

      const result = await microPostService.getMicroPosts();

      expect(result).toEqual(mockMicroPosts);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT id, user_id as "userId", title FROM micropost');
    });

    it('should return an empty array if no microposts exist', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await microPostService.getMicroPosts();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Query failed'));

      await expect(microPostService.getMicroPosts()).rejects.toThrow('Query failed');
    });
  });
});