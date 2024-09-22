import { Test, TestingModule } from '@nestjs/testing';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    // AuthServiceのモックを作成
    mockAuthService = {
      register: jest.fn().mockImplementation((name: string, email: string, password: string) => Promise.resolve(true)),
      login: jest.fn().mockImplementation((email: string, password: string) => Promise.resolve({ success: true, token: 'abc123' })),
      logout: jest.fn().mockImplementation(() => Promise.resolve(true))
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should register a user successfully', async () => {
    expect(await controller.register('John', 'john@example.com', 'password123')).toEqual({
      success: true,
      message: 'Registration successful'
    });
    expect(mockAuthService.register).toHaveBeenCalledWith('John', 'john@example.com', 'password123');
  });

  it('should handle registration failure', async () => {
    jest.spyOn(mockAuthService, 'register').mockResolvedValueOnce(false);
    expect(await controller.register('Jane', 'jane@example.com', 'password123')).toEqual({
      success: false,
      message: 'Registration failed'
    });
  });

  it('should login successfully', async () => {
    expect(await controller.login('john@example.com', 'password123')).toEqual({
      success: true,
      message: 'Login successful',
      token: 'abc123'
    });
  });

  it('should handle login failure', async () => {
    jest.spyOn(mockAuthService, 'login').mockResolvedValueOnce({ success: false });
    expect(await controller.login('john@example.com', 'wrongpassword')).toEqual({
      success: false,
      message: 'Login failed'
    });
  });

  it('should logout successfully', async () => {
    expect(await controller.logout()).toEqual({
      success: true,
      message: 'Successfully logged out'
    });
  });

  it('should handle logout failure', async () => {
    jest.spyOn(mockAuthService, 'logout').mockResolvedValueOnce(false);
    expect(await controller.logout()).toEqual({
      success: false,
      message: 'Logout failed'
    });
  });
});
