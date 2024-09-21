import { Test, TestingModule } from '@nestjs/testing';
import { UserService, User } from './user.service';
import { Pool } from 'pg';

describe('UserService', () => {
  let userService: UserService;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Pool>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const name = 'John Doe';
      const mockUser: User = { id: 1, name };

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const result = await userService.createUser(name);

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO "user"(name) VALUES($1) RETURNING id, name',
        [name]
      );
    });

    it('should throw an error if creation fails', async () => {
      const name = 'Jane Doe';

      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      await expect(userService.createUser(name)).rejects.toThrow('Creation failed');
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const userId = 1;
      const mockUser: User = { id: userId, name: 'John Doe' };

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const result = await userService.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, name FROM "user" WHERE id = $1',
        [userId]
      );
    });

    it('should return null when user is not found', async () => {
      const userId = 999;

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await userService.getUserById(userId);

      expect(result).toBeNull();
    });

    it('should throw an error if query fails', async () => {
      const userId = 1;

      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Query failed'));

      await expect(userService.getUserById(userId)).rejects.toThrow('Query failed');
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers: User[] = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' },
      ];

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockUsers });

      const result = await userService.getUsers();

      expect(result).toEqual(mockUsers);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT id, name FROM "user"');
    });

    it('should return an empty array if no users exist', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await userService.getUsers();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Query failed'));

      await expect(userService.getUsers()).rejects.toThrow('Query failed');
    });
  });
});