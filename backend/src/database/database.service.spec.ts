import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService, User, MicroPost, Category } from './database.service';
import { Pool } from 'pg';

// 新しい型定義を追加
type MockQueryResult<T> = {
  rows: T[];
};

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockPool: {
    query: jest.Mock;
    end: jest.Mock;
  };

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
      end: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
      };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] } as MockQueryResult<User>);

      const result = await service.createUser({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        isAdmin: false,
      });

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "user"'),
        ['Test User', 'test@example.com', 'hashedpassword', false]
      );
    });
  });

  describe('findUser', () => {
    it('should find a user by id', async () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
      };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] } as MockQueryResult<User>);

      const result = await service.findUser(1);

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, email, is_admin'),
        [1]
      );
    });

    it('should return null if user not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] } as MockQueryResult<User>);

      const result = await service.findUser(1);

      expect(result).toBeNull();
    });
  });

  describe('listUsers', () => {
    it('should list all users', async () => {
      const mockUsers: User[] = [
        { id: 1, name: 'User 1', email: 'user1@example.com', isAdmin: false },
        { id: 2, name: 'User 2', email: 'user2@example.com', isAdmin: true },
      ];
      mockPool.query.mockResolvedValueOnce({ rows: mockUsers } as MockQueryResult<User>);

      const result = await service.listUsers();

      expect(result).toEqual(mockUsers);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, email, is_admin')
      );
    });
  });

  describe('createMicroPost', () => {
    it('should create a micro post', async () => {
      const mockMicroPost: MicroPost = {
        id: 1,
        userId: 1,
        title: 'Test Post',
        imagePath: 'path/to/image.jpg',
        userName: 'Test User',
      };
      mockPool.query.mockResolvedValueOnce({ rows: [mockMicroPost] } as MockQueryResult<MicroPost>);

      const result = await service.createMicroPost(1, 'Test Post', 'path/to/image.jpg');

      expect(result).toEqual(mockMicroPost);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO micropost'),
        [1, 'Test Post', 'path/to/image.jpg']
      );
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const mockCategory: Category = {
        id: 1,
        title: 'Test Category',
      };
      mockPool.query.mockResolvedValueOnce({ rows: [mockCategory] } as MockQueryResult<Category>);

      const result = await service.createCategory('Test Category');

      expect(result).toEqual(mockCategory);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO category'),
        ['Test Category']
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should end the pool connection', async () => {
      await service.onModuleDestroy();
      expect(mockPool.end).toHaveBeenCalled();
    });
  });
});