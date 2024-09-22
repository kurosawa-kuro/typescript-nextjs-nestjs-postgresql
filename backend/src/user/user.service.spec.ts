import { Test, TestingModule } from '@nestjs/testing';
import { UserService, User } from './user.service';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let mockPool: jest.Mocked<Pool>;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    isAdmin: false,
  };

  const setupTestingModule = async () => {
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
  };

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Pool>;

    jest.clearAllMocks(); // テストごとのモッククリア
    await setupTestingModule();
  });

  describe('create', () => {
    const name = 'John Doe';
    const email = 'john@example.com';
    const password = 'password';
    const isAdmin = false;

    it('should create a new user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const result = await userService.create(name, email, password, isAdmin);

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO "user"(name, email, password_hash, is_admin) VALUES($1, $2, $3, $4) RETURNING id, name, email, is_admin as "isAdmin"',
        [name, email, 'hashedPassword', isAdmin],
      );
    });

    it('should throw an error if creation fails', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      await expect(userService.create(name, email, password, isAdmin)).rejects.toThrow('Creation failed');
    });
  });

  describe('find', () => {
    const userId = 1;

    it('should return a user when found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const result = await userService.find(userId);

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, name, email, is_admin as "isAdmin" FROM "user" WHERE id = $1',
        [userId],
      );
    });

    it('should return null when user is not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await userService.find(userId);

      expect(result).toBeNull();
    });

    it('should throw an error if query fails', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Query failed'));

      await expect(userService.find(userId)).rejects.toThrow('Query failed');
    });
  });

  describe('index', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com', isAdmin: false },
      { id: 2, name: 'Jane Doe', email: 'jane@example.com', isAdmin: true },
    ];

    it('should return all users', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockUsers });

      const result = await userService.index();

      expect(result).toEqual(mockUsers);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, name, email, is_admin as "isAdmin" FROM "user"',
      );
    });

    it('should return an empty array if no users exist', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await userService.index();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Query failed'));

      await expect(userService.index()).rejects.toThrow('Query failed');
    });
  });
});
