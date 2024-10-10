import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when a valid token is provided', () => {
    const mockRequest = {
      cookies: { token: 'valid.jwt.token' },
      headers: {},
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    (jwtService.verify as jest.Mock).mockReturnValue({
      userId: 1,
      email: 'test@example.com',
    });

    expect(guard.canActivate(mockContext)).toBe(true);
    expect(mockRequest['user']).toEqual({ userId: 1, email: 'test@example.com' });
  });

  it('should throw UnauthorizedException when no token is provided', () => {
    const mockRequest = {
      cookies: {},
      headers: {},
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when the token is invalid', () => {
    const mockRequest = {
      cookies: { token: 'invalid.jwt.token' },
      headers: {},
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });
});