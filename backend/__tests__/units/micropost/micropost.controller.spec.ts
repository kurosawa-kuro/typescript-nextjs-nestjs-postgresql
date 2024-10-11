import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostController } from '../../../src/micropost/micropost.controller';
import { MicroPostService } from '../../../src/micropost/micropost.service';
import { UserService } from '../../../src/user/user.service';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

// bcryptをモック
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('multer', () => ({
  diskStorage: jest.fn(() => ({
    filename: jest.fn(),
  })),
}));

// pathモジュール全体をモック
jest.mock('path', () => ({
  extname: jest.fn(),
  join: jest.fn(),
}));

describe('MicroPostController', () => {
  let microPostController: MicroPostController;
  let microPostService: jest.Mocked<MicroPostService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    microPostService = {
      create: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<MicroPostService>;

    userService = {
      find: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicroPostController],
      providers: [
        { provide: MicroPostService, useValue: microPostService },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    microPostController = module.get<MicroPostController>(MicroPostController);
  });

  // 'create' メソッドのテスト
  describe('create', () => {
    // ... 既存のテストコード
  });

  // 'index' メソッドのテスト
  describe('index', () => {
    // ... 既存のテストコード
  });

  // 'getMicropost' メソッドのテストを追加
  describe('getMicropost', () => {
    it('should return a micropost', async () => {
      const micropostId = 1;
      const mockMicropost = {
        id: 1,
        userId: 1,
        title: 'Test Micropost',
        userName: 'User1',
        imagePath: null,
        userAvatarPath: null,
        categories: [],
      };
      microPostService.findById.mockResolvedValue(mockMicropost);

      const result = await microPostController.getMicropost(micropostId);

      expect(result).toEqual(mockMicropost);
      expect(microPostService.findById).toHaveBeenCalledWith(micropostId);
    });

    it('should throw BadRequestException when micropost is not found', async () => {
      const micropostId = 1;
      microPostService.findById.mockResolvedValue(null);

      await expect(microPostController.getMicropost(micropostId)).rejects.toThrow(BadRequestException);
    });
  });
});
