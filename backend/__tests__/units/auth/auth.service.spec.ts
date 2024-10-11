import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';
import { UserService } from '../../../src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { Logger, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: Partial<UserService>;
  let mockPool: jest.Mocked<Partial<Pool>>;
  let mockJwtService: Partial<JwtService>;
  let mockLogger: jest.SpyInstance;

  beforeEach(async () => {
    mockUserService = {
      create: jest.fn().mockResolvedValue(true),
      findUserByEmail: jest.fn(), // Add this line
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

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
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
        {
          provide: JwtService,
          useValue: mockJwtService,
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
      }),
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
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password_hash: 'hashedPassword',
      isAdmin: false,
      avatar_path: 'path/to/avatar',
    };
  
    (mockUserService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  
    const loginResult = await service.login('test@example.com', 'password');
  
    expect(loginResult).toEqual({
      success: true,
      token: 'mock.jwt.token',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
        avatar_path: 'path/to/avatar',
      },
    });
  
    expect(mockUserService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
      avatar_path: 'path/to/avatar',
    });
  });
  

  it('should fail login if the password does not match', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login('test@example.com', 'wrongpassword'),
    ).rejects.toThrow(UnauthorizedException);

    expect(mockLogger).toHaveBeenCalledWith(
      'Login failed',
      new Error('Incorrect credentials'),
    );
  });

  it('should log out successfully', async () => {
    expect(await service.logout()).toBe(true);
  });
});