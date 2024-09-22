import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostService, MicroPost } from './micropost.service';
import { DatabaseService } from '../database/database.service';

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
        `
      INSERT INTO micropost(user_id, title, image_path) 
      VALUES($1, $2, $3) 
      RETURNING id, user_id as "userId", title, image_path as "imagePath",
        (SELECT name FROM "user" WHERE id = $1) as "userName"
    `,
        [userId, title, imagePath]
      );
      expect(result).toEqual(mockMicroPost);
    });

    it('should throw error if creation fails', async () => {
      const userId = 1;
      const title = 'Failed MicroPost';
      const imagePath = null;

      mockDatabaseService.executeQuery.mockRejectedValue(new Error('Creation failed'));

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

      mockDatabaseService.executeQuery.mockResolvedValue({
        rows: mockMicroPosts,
        command: '',
        rowCount: mockMicroPosts.length,
        oid: 0,
        fields: []
      });

      const result = await microPostService.list();

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        `
      SELECT m.id, m.user_id as "userId", m.title, m.image_path as "imagePath", u.name as "userName"
      FROM micropost m
      JOIN "user" u ON m.user_id = u.id
    `
      );
      expect(result).toEqual(mockMicroPosts);
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
