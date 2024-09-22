import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';

jest.mock('passport-jwt');

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return a user object when passed a valid payload', async () => {
      const payload = { sub: 1, email: 'test@example.com', isAdmin: false };
      const result = await strategy.validate(payload);
      expect(result).toEqual({
        userId: 1,
        email: 'test@example.com',
        isAdmin: false,
      });
    });

    it('should handle payloads with missing properties', async () => {
      const payload = { sub: 1 };
      const result = await strategy.validate(payload);
      expect(result).toEqual({
        userId: 1,
        email: undefined,
        isAdmin: undefined,
      });
    });
  });

  describe('constructor', () => {
    it('should use the correct options', () => {
      // Reset the mock to clear any previous calls
      (ExtractJwt.fromExtractors as jest.Mock).mockClear();

      // Create a new instance of JwtStrategy
      new JwtStrategy();
      
      // Check if ExtractJwt.fromExtractors was called with the correct argument
      expect(ExtractJwt.fromExtractors).toHaveBeenCalledWith([
        expect.any(Function)
      ]);

      // Get the extractor function
      const extractorFunction = (ExtractJwt.fromExtractors as jest.Mock).mock.calls[0][0][0];

      // Test the extractor function
      const mockRequestWithJwt = { cookies: { jwt: 'test.jwt.token' } };
      expect(extractorFunction(mockRequestWithJwt)).toBe('test.jwt.token');

      const mockRequestWithoutJwt = { cookies: {} };
      expect(extractorFunction(mockRequestWithoutJwt)).toBeUndefined();
    });
  });
});