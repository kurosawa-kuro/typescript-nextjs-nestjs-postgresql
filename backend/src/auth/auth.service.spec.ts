import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { Logger } from '@nestjs/common';
import { CreateUserDto, UserCreationData } from '../user/user.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: Partial<UserService>;
  let mockPool: jest.Mocked<Partial<Pool>>;
  let mockLogger: jest.SpyInstance;

  beforeEach(async () => {
    mockUserService = {
      create: jest.fn().mockResolvedValue(true),
    };

    mockPool = {
      query: jest.fn().mockResolvedValue({
        rows: [
          {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            password_hash: await bcrypt.hash('password', 10),
            isAdmin: false,
          },
        ],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockLogger = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
  });

  it('should register a user successfully', async () => {
    const mockHashedPassword = 'hashedPassword123';
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);

    expect(
      await service.register('John Doe', 'john@example.com', 'password123'),
    ).toBe(true);
    expect(mockUserService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: mockHashedPassword,
        isAdmin: false,
      })
    );
  });

  it('should fail registration when an error occurs', async () => {
    jest
      .spyOn(mockUserService, 'create')
      .mockRejectedValueOnce(new Error('Database error'));
    expect(
      await service.register('Jane Doe', 'jane@example.com', 'password123'),
    ).toBe(false);
    expect(mockLogger).toHaveBeenCalledWith(
      'Registration failed',
      expect.any(Error),
    );
  });

  it('should login successfully', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const loginResult = await service.login('test@example.com', 'password');
    expect(loginResult).toEqual({
      success: true,
      token: 'placeholder-token',
      user: { id: 1, name: 'Test User', email: 'test@example.com' },
    });
    expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
      'test@example.com',
    ]);
  });

  it('should fail login if the password does not match', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await service.login('test@example.com', 'wrongpassword');

    expect(result).toEqual({ success: false });

    expect(mockLogger).toHaveBeenCalledWith(
      'Login failed',
      new Error('Incorrect credentials'),
    );
  });

  it('should log an error if a database error occurs during login', async () => {
    const mockError = new Error('Database error');
    jest.spyOn(mockPool, 'query' as any).mockRejectedValueOnce(mockError);

    const result = await service.login('test@example.com', 'password123');

    expect(result).toEqual({ success: false });

    expect(mockLogger).toHaveBeenCalledWith('Login failed', mockError);
  });

  it('should log out successfully', async () => {
    expect(await service.logout()).toBe(true);
  });
});