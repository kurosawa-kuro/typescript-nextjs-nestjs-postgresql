// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService, User } from './user.service';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

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
      const email = 'john@example.com';
      const password = 'password';
      const isAdmin = false;
      const mockUser: User = { id: 1, name, email, isAdmin };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const result = await userService.createUser(name, email, password, isAdmin);

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO "user"(name, email, password_hash, is_admin) VALUES($1, $2, $3, $4) RETURNING id, name, email, is_admin as "isAdmin"',
        [name, email, 'hashedPassword', isAdmin]
      );
    });

    it('should throw an error if creation fails', async () => {
      const name = 'Jane Doe';
      const email = 'jane@example.com';
      const password = 'password';
      const isAdmin = false;

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      await expect(userService.createUser(name, email, password, isAdmin)).rejects.toThrow('Creation failed');
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const userId = 1;
      const mockUser: User = { id: userId, name: 'John Doe', email: 'john@example.com', isAdmin: false };

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const result = await userService.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, name, email, is_admin as "isAdmin" FROM "user" WHERE id = $1',
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
        { id: 1, name: 'John Doe', email: 'john@example.com', isAdmin: false },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com', isAdmin: true },
      ];

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockUsers });

      const result = await userService.getUsers();

      expect(result).toEqual(mockUsers);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT id, name, email, is_admin as "isAdmin" FROM "user"');
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

  describe('validateUser', () => {
    it('should return a user when credentials are valid', async () => {
      const email = 'john@example.com';
      const password = 'password';
      const mockUser = { id: 1, name: 'John Doe', email, password_hash: 'hashedPassword', isAdmin: false };

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.validateUser(email, password);

      expect(result).toEqual({ id: 1, name: 'John Doe', email, isAdmin: false });
    });

    it('should return null when credentials are invalid', async () => {
      const email = 'john@example.com';
      const password = 'wrongpassword';
      const mockUser = { id: 1, name: 'John Doe', email, password_hash: 'hashedPassword', isAdmin: false };

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await userService.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('should return null when user is not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password';

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await userService.validateUser(email, password);

      expect(result).toBeNull();
    });
  });
});