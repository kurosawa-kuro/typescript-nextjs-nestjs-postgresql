import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DatabaseService, User, CreateUserDto } from '../database/database.service';
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
      createUser: jest.fn(),
      findUser: jest.fn(),
      listUsers: jest.fn(),
    } as unknown as jest.Mocked<DatabaseService>;

    jest.clearAllMocks();
    await setupTestingModule();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password',
    };

    it('should create a new user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockDatabaseService.createUser.mockResolvedValue(mockUser);

      const result = await userService.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockDatabaseService.createUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedPassword',
        isAdmin: false,
      });
    });

    it('should throw an error if creation fails', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockDatabaseService.createUser.mockRejectedValue(new Error('Creation failed'));

      await expect(userService.create(createUserDto)).rejects.toThrow('Creation failed');
    });
  });

  describe('findUser', () => {
    const userId = 1;

    it('should return a user when found', async () => {
      mockDatabaseService.findUser.mockResolvedValue(mockUser);

      const result = await userService.findUser(userId);

      expect(result).toEqual(mockUser);
      expect(mockDatabaseService.findUser).toHaveBeenCalledWith(userId);
    });

    it('should return null when user is not found', async () => {
      mockDatabaseService.findUser.mockResolvedValue(null);

      const result = await userService.findUser(userId);

      expect(result).toBeNull();
    });

    it('should throw an error if query fails', async () => {
      mockDatabaseService.findUser.mockRejectedValue(new Error('Query failed'));

      await expect(userService.findUser(userId)).rejects.toThrow('Query failed');
    });
  });

  describe('listUsers', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com', isAdmin: false },
      { id: 2, name: 'Jane Doe', email: 'jane@example.com', isAdmin: true },
    ];

    it('should return all users', async () => {
      mockDatabaseService.listUsers.mockResolvedValue(mockUsers);

      const result = await userService.listUsers();

      expect(result).toEqual(mockUsers);
      expect(mockDatabaseService.listUsers).toHaveBeenCalled();
    });

    it('should return an empty array if no users exist', async () => {
      mockDatabaseService.listUsers.mockResolvedValue([]);

      const result = await userService.listUsers();

      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      mockDatabaseService.listUsers.mockRejectedValue(new Error('Query failed'));

      await expect(userService.listUsers()).rejects.toThrow('Query failed');
    });
  });
});