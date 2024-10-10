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
      const categoryIds = [1, 2];
      const mockMicroPost: MicroPost = {
        id: 1,
        userId,
        title,
        userName: 'TestUser',
        imagePath,
      };

      mockDatabaseService.executeQuery.mockResolvedValueOnce({
        rows: [mockMicroPost],
        command: '',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      mockDatabaseService.executeQuery.mockResolvedValueOnce({
        rows: [],
        command: '',
        rowCount: 2,
        oid: 0,
        fields: [],
      });

      mockDatabaseService.executeQuery.mockResolvedValueOnce({
        rows: [],
        command: '',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await microPostService.create(userId, title, imagePath, categoryIds);

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO micropost'),
        [userId, title, imagePath],
      );
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO micropost_category'),
        [1, categoryIds],
      );
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith('COMMIT');
      expect(result).toEqual(mockMicroPost);
    });

    it('should create a new micropost with null image path', async () => {
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

      mockDatabaseService.executeQuery.mockResolvedValueOnce({
        rows: [mockMicroPost],
        command: '',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      mockDatabaseService.executeQuery.mockResolvedValueOnce({
        rows: [],
        command: '',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await microPostService.create(userId, title, imagePath, categoryIds);

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO micropost'),
        [userId, title, imagePath],
      );
      expect(mockDatabaseService.executeQuery).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO micropost_category'),
        expect.anything(),
      );
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith('COMMIT');
      expect(result).toEqual(mockMicroPost);
    });

    it('should throw error if creation fails due to database constraint', async () => {
      const userId = 1;
      const title = 'Test MicroPost';
      const imagePath = 'path/to/image.jpg';
      const categoryIds = [1];

      mockDatabaseService.executeQuery.mockRejectedValueOnce(
        new Error('Unique constraint violation'),
      );

      await expect(
        microPostService.create(userId, title, imagePath, categoryIds),
      ).rejects.toThrow('Unique constraint violation');

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith('ROLLBACK');
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
        fields: [],
      });

      const result = await microPostService.list();

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY m.id DESC'),
      );
      expect(result).toEqual(mockMicroPosts);
      expect(result[0].id).toBeGreaterThan(result[1].id);
    });

    it('should return an empty array if no microposts exist', async () => {
      mockDatabaseService.executeQuery.mockResolvedValue({
        rows: [],
        command: '',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await microPostService.list();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      mockDatabaseService.executeQuery.mockRejectedValue(
        new Error('Query failed'),
      );

      await expect(microPostService.list()).rejects.toThrow('Query failed');
    });
  });

  describe('getCategoriesForMicropost', () => {
    it('should return categories for a given micropost', async () => {
      const micropostId = 1;
      const mockCategories = [
        { id: 1, title: 'Technology' },
        { id: 2, title: 'Science' },
      ];

      mockDatabaseService.executeQuery.mockResolvedValue({
        rows: mockCategories,
        command: '',
        rowCount: mockCategories.length,
        oid: 0,
        fields: [],
      });

      const result = await microPostService.getCategoriesForMicropost(micropostId);

      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT c.id, c.title'),
        [micropostId],
      );
      expect(result).toEqual(mockCategories);
    });

    it('should return null if no categories are found', async () => {
      const micropostId = 1;

      mockDatabaseService.executeQuery.mockResolvedValue({
        rows: [],
        command: '',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await microPostService.getCategoriesForMicropost(micropostId);

      expect(result).toBeNull();
    });

    it('should throw an error if query fails', async () => {
      const micropostId = 1;

      mockDatabaseService.executeQuery.mockRejectedValue(
        new Error('Query failed'),
      );

      await expect(microPostService.getCategoriesForMicropost(micropostId)).rejects.toThrow('Query failed');
    });
  });
});