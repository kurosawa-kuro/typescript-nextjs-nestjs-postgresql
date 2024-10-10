// src/user/user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService, User, UserCreationData } from '../../../src/user/user.service';
import { DatabaseService } from '../../../src/database/database.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;

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
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  };

  beforeEach(async () => {
    mockDatabaseService = {
      executeQuery: jest.fn(),
    } as unknown as jest.Mocked<DatabaseService>;

    jest.clearAllMocks();
    await setupTestingModule();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockDatabaseService.executeQuery.mockResolvedValue({
        command: 'SELECT',
        rowCount: 1,
        oid: null,
        rows: [mockUser],
        fields: [],
      });

      const userCreationData: UserCreationData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedPassword',
        isAdmin: false,
      };

      const result = await userService.create(userCreationData);

      expect(result).toEqual(mockUser);
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'John Doe',
          'john@example.com',
          'hashedPassword',
          false,
        ]),
      );
    });

    it('should throw an error if creation fails', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockDatabaseService.executeQuery.mockRejectedValue(
        new Error('Creation failed'),
      );

      const userCreationData: UserCreationData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedPassword',
        isAdmin: false,
      };

      await expect(userService.create(userCreationData)).rejects.toThrow(
        'Creation failed',
      );
    });
  });

  describe('find', () => {
    const userId = 1;

    it('should return a user when found', async () => {
      mockDatabaseService.executeQuery.mockResolvedValue({
        command: 'SELECT',
        rowCount: 1,
        oid: null,
        rows: [mockUser],
        fields: [],
      });

      const result = await userService.find(userId);

      expect(result).toEqual(mockUser);
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        expect.any(String),
        [userId],
      );
    });

    it('should return null when user is not found', async () => {
      mockDatabaseService.executeQuery.mockResolvedValue({
        command: 'SELECT',
        rowCount: 0,
        oid: null,
        rows: [],
        fields: [],
      });

      const result = await userService.find(userId);

      expect(result).toBeNull();
    });

    it('should throw an error if query fails', async () => {
      mockDatabaseService.executeQuery.mockRejectedValue(
        new Error('Query failed'),
      );

      await expect(userService.find(userId)).rejects.toThrow('Query failed');
    });
  });

  describe('index', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com', isAdmin: false },
      { id: 2, name: 'Jane Doe', email: 'jane@example.com', isAdmin: true },
    ];

    it('should return all users', async () => {
      mockDatabaseService.executeQuery.mockResolvedValue({
        command: 'SELECT',
        rowCount: mockUsers.length,
        oid: null,
        rows: mockUsers,
        fields: [],
      });

      const result = await userService.index();

      expect(result).toEqual(mockUsers);
      expect(mockDatabaseService.executeQuery).toHaveBeenCalled();
    });

    it('should return an empty array if no users exist', async () => {
      mockDatabaseService.executeQuery.mockResolvedValue({
        command: 'SELECT',
        rowCount: 0,
        oid: null,
        rows: [],
        fields: [],
      });

      const result = await userService.index();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      mockDatabaseService.executeQuery.mockRejectedValue(
        new Error('Query failed'),
      );

      await expect(userService.index()).rejects.toThrow('Query failed');
    });
  });

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      const password = 'testPassword';
      const hashedPassword = 'hashedTestPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await userService.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('findUserByEmail', () => {
    const userEmail = 'john@example.com';

    it('should return a user when found', async () => {
      const mockUserWithPasswordHash = {
        ...mockUser,
        password_hash: 'hashedPassword',
      };
      mockDatabaseService.executeQuery.mockResolvedValue({
        command: 'SELECT',
        rowCount: 1,
        oid: null,
        rows: [mockUserWithPasswordHash],
        fields: [],
      });

      const result = await userService.findUserByEmail(userEmail);

      expect(result).toEqual(mockUserWithPasswordHash);
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        expect.any(String),
        [userEmail],
      );
    });

    it('should return null when user is not found', async () => {
      mockDatabaseService.executeQuery.mockResolvedValue({
        command: 'SELECT',
        rowCount: 0,
        oid: null,
        rows: [],
        fields: [],
      });

      const result = await userService.findUserByEmail(userEmail);

      expect(result).toBeNull();
    });

    it('should throw an error if query fails', async () => {
      mockDatabaseService.executeQuery.mockRejectedValue(
        new Error('Query failed'),
      );

      await expect(userService.findUserByEmail(userEmail)).rejects.toThrow(
        'Query failed',
      );
    });
  });
});
