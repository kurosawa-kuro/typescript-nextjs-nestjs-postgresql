import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';

jest.mock('passport-jwt', () => ({
  Strategy: jest.fn(),
  ExtractJwt: {
    fromExtractors: jest.fn(),
  },
}));

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
      // モックが設定されたことを確認
      expect(ExtractJwt.fromExtractors).toHaveBeenCalled();

      // Extractor 関数をテスト
      const extractorFn = (ExtractJwt.fromExtractors as jest.Mock).mock.calls[0][0][0];

      // JWT を含むリクエストをテスト
      const mockRequestWithJwt = { cookies: { jwt: 'test.jwt.token' } };
      expect(extractorFn(mockRequestWithJwt)).toBe('test.jwt.token');

      // JWT を含まないリクエストをテスト
      const mockRequestWithoutJwt = { cookies: {} };
      expect(extractorFn(mockRequestWithoutJwt)).toBeUndefined();
    });
  });
});
