import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService } from '../../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;
  let mockJwtService: Partial<JwtService>;

  const createMockAuthService = () => ({
    register: jest.fn().mockResolvedValue(true),
    login: jest.fn().mockResolvedValue({
      success: true,
      token: 'abc123',
      user: { id: 1, name: 'John', email: 'john@example.com' },
    }),
    logout: jest.fn().mockResolvedValue(true),
  });

  const createMockJwtService = () => ({
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
  });

  const setupTestingModule = async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  };

  beforeEach(async () => {
    mockAuthService = createMockAuthService();
    mockJwtService = createMockJwtService();
    await setupTestingModule();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const result = await controller.register(
        'John',
        'john@example.com',
        'password123',
      );
      expect(result).toEqual({
        success: true,
        message: 'Registration successful',
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(
        'John',
        'john@example.com',
        'password123',
      );
    });

    it('should handle registration failure', async () => {
      jest.spyOn(mockAuthService, 'register').mockResolvedValueOnce(false);
      const result = await controller.register(
        'Jane',
        'jane@example.com',
        'password123',
      );
      expect(result).toEqual({
        success: false,
        message: 'Registration failed',
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(
        'john@example.com',
        'password123',
        mockResponse,
      );
      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        token: 'abc123',
        user: { id: 1, name: 'John', email: 'john@example.com' },
      });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        'abc123',
        expect.objectContaining({
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: 'strict',
          maxAge: expect.any(Number),
        }),
      );
    });

    it('should handle login failure', async () => {
      jest
        .spyOn(mockAuthService, 'login')
        .mockResolvedValueOnce({ success: false });
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(
        'john@example.com',
        'wrongpassword',
        mockResponse,
      );
      expect(result).toEqual({
        success: false,
        message: 'Login failed',
      });
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockResponse);
      expect(result).toEqual({
        success: true,
        message: 'Successfully logged out',
      });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('token');
    });
  });

  describe('getProfile', () => {
    it('should return the user profile from the request', () => {
      const mockRequest = {
        user: { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
      };

      const result = controller.getProfile(mockRequest as any);

      expect(result).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      });
    });

    it('should return undefined if user is not attached to the request', () => {
      const mockRequest = {
        user: undefined,
      };

      const result = controller.getProfile(mockRequest as any);

      expect(result).toBeUndefined();
    });
  });
});