import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;

  const createMockAuthService = () => ({
    register: jest.fn().mockResolvedValue(true),
    login: jest.fn().mockResolvedValue({ success: true, token: 'abc123' }),
    logout: jest.fn().mockResolvedValue(true),
  });

  const setupTestingModule = async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  };

  beforeEach(async () => {
    mockAuthService = createMockAuthService();
    await setupTestingModule();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const result = await controller.register('John', 'john@example.com', 'password123');
      expect(result).toEqual({
        success: true,
        message: 'Registration successful',
      });
      expect(mockAuthService.register).toHaveBeenCalledWith('John', 'john@example.com', 'password123');
    });

    it('should handle registration failure', async () => {
      jest.spyOn(mockAuthService, 'register').mockResolvedValueOnce(false);
      const result = await controller.register('Jane', 'jane@example.com', 'password123');
      expect(result).toEqual({
        success: false,
        message: 'Registration failed',
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const result = await controller.login('john@example.com', 'password123');
      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        token: 'abc123',
      });
    });

    it('should handle login failure', async () => {
      jest.spyOn(mockAuthService, 'login').mockResolvedValueOnce({ success: false });
      const result = await controller.login('john@example.com', 'wrongpassword');
      expect(result).toEqual({
        success: false,
        message: 'Login failed',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const result = await controller.logout();
      expect(result).toEqual({
        success: true,
        message: 'Successfully logged out',
      });
    });

    it('should handle logout failure', async () => {
      jest.spyOn(mockAuthService, 'logout').mockResolvedValueOnce(false);
      const result = await controller.logout();
      expect(result).toEqual({
        success: false,
        message: 'Logout failed',
      });
    });
  });
});
