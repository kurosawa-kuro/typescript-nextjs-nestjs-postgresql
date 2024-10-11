import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostController } from '../../../src/micropost/micropost.controller';
import { MicroPostService } from '../../../src/micropost/micropost.service';
import { UserService } from '../../../src/user/user.service';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

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
      getCategoriesForMicropost: jest.fn(),
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

  describe('create', () => {
    it('should create a micropost', async () => {
      const userId = 1;
      const title = 'Test Post';
      const categoryIds = '1,2';
      const file = { path: '__tests__/test.png' } as Express.Multer.File;
      const mockUser = {
        id: userId,
        name: 'TestUser',
        email: 'test@example.com',
        isAdmin: false,
        avatar_path: 'path/to/avatar.png',
      };
      userService.find.mockResolvedValue(mockUser);

      const mockMicroPost = {
        id: 1,
        userId,
        title,
        userName: mockUser.name,
        imagePath: file.path,
      };
      microPostService.create.mockResolvedValue(mockMicroPost);

      const result = await microPostController.create(userId, title, categoryIds, file);

      expect(result).toEqual(mockMicroPost);
      expect(userService.find).toHaveBeenCalledWith(userId);
      expect(microPostService.create).toHaveBeenCalledWith(
        userId,
        title,
        file.path,
        [1, 2],
      );
    });

    it('should throw BadRequestException when title is missing', async () => {
      const userId = 1;
      const title = '';
      const categoryIds = '';
      const file = {} as Express.Multer.File;

      await expect(
        microPostController.create(userId, title, categoryIds, file),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is not found', async () => {
      const userId = 1;
      const title = 'Test MicroPost';
      const categoryIds = '1';
      const file = {} as Express.Multer.File;

      userService.find.mockResolvedValue(null);

      await expect(
        microPostController.create(userId, title, categoryIds, file),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle null file', async () => {
      const userId = 1;
      const title = 'Test MicroPost';
      const categoryIds = '1';
      const file = null;
      const mockUser = {
        id: userId,
        name: 'TestUser',
        email: 'test@example.com',
        isAdmin: false,
        avatar_path: 'path/to/avatar.png',
      };
      userService.find.mockResolvedValue(mockUser);

      const mockMicroPost = {
        id: 1,
        userId,
        title,
        userName: mockUser.name,
        imagePath: null,
      };
      microPostService.create.mockResolvedValue(mockMicroPost);

      const result = await microPostController.create(userId, title, categoryIds, file);

      expect(result).toEqual(mockMicroPost);
      expect(microPostService.create).toHaveBeenCalledWith(userId, title, null, [1]);
    });

    it('should generate a random filename with correct extension', () => {
      const mockFile = { originalname: 'test.jpg' } as Express.Multer.File;

      // Mock the extname function to return the extension of the file
      (extname as jest.Mock).mockReturnValue('.jpg');
      const storageOptions = (diskStorage as jest.Mock).mock.calls[0][0];
      const cb = jest.fn();

      // Call the filename function with mock arguments
      storageOptions.filename(null, mockFile, cb);

      // Ensure the callback is called with a random name and correct extension
      expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/^[a-f0-9]{32}\.jpg$/));

      // Ensure extname was called with the correct file original name
      expect(extname).toHaveBeenCalledWith('test.jpg');
    });

    it('should correctly parse categoryIds from string array to number array', async () => {
      const userId = 1;
      const title = 'Test Post';
      const categoryIds = ['1', '2', '3']; // 文字列配列
      const file = { path: '__tests__/test.png' } as Express.Multer.File;
      const mockUser = {
        id: userId,
        name: 'TestUser',
        email: 'test@example.com',
        isAdmin: false,
        avatar_path: 'path/to/avatar.png',
      };
      userService.find.mockResolvedValue(mockUser);

      const mockMicroPost = {
        id: 1,
        userId,
        title,
        userName: mockUser.name,
        imagePath: file.path,
      };
      microPostService.create.mockResolvedValue(mockMicroPost);

      const result = await microPostController.create(userId, title, categoryIds, file);

      expect(result).toEqual(mockMicroPost);
      expect(userService.find).toHaveBeenCalledWith(userId);
      expect(microPostService.create).toHaveBeenCalledWith(
        userId,
        title,
        file.path,
        [1, 2, 3], // 数値配列になっていることを確認
      );
    });

    it('should handle invalid categoryIds by converting them to NaN', async () => {
      const userId = 1;
      const title = 'Test Post';
      const categoryIds = ['a', 'b', '3']; // 無効な値が含まれる
      const file = { path: '__tests__/test.png' } as Express.Multer.File;
      const mockUser = {
        id: userId,
        name: 'TestUser',
        email: 'test@example.com',
        isAdmin: false,
        avatar_path: 'path/to/avatar.png',
      };
      userService.find.mockResolvedValue(mockUser);

      const mockMicroPost = {
        id: 1,
        userId,
        title,
        userName: mockUser.name,
        imagePath: file.path,
      };
      microPostService.create.mockResolvedValue(mockMicroPost);

      const result = await microPostController.create(userId, title, categoryIds, file);

      expect(result).toEqual(mockMicroPost);
      expect(userService.find).toHaveBeenCalledWith(userId);
      expect(microPostService.create).toHaveBeenCalledWith(
        userId,
        title,
        file.path,
        [NaN, NaN, 3], // 無効な値はNaNになる
      );
    });
  });

  describe('index', () => {
    it('should return an array of microposts', async () => {
      const mockMicroposts = [
        {
          id: 1,
          userId: 1,
          title: 'MicroPost 1',
          userName: 'User1',
          imagePath: 'path/to/image1.jpg',
        },
        {
          id: 2,
          userId: 2,
          title: 'MicroPost 2',
          userName: 'User2',
          imagePath: null,
        },
      ];

      microPostService.list.mockResolvedValue(mockMicroposts);

      const result = await microPostController.index();

      expect(result).toEqual(mockMicroposts);
      expect(microPostService.list).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when getting microposts fails', async () => {
      microPostService.list.mockRejectedValue(new Error('Database error'));

      await expect(microPostController.index()).rejects.toThrow();
    });
  });

  describe('getCategories', () => {
    it('should generate a random filename with correct extension', () => {
      const mockFile = { originalname: 'test.jpg' } as Express.Multer.File;
  
      // Mock the extname function to return the extension of the file
      (extname as jest.Mock).mockReturnValue('.jpg');
      const storageOptions = (diskStorage as jest.Mock).mock.calls[0][0];
      const cb = jest.fn();
  
      // Call the filename function with mock arguments
      storageOptions.filename(null, mockFile, cb);
  
      // Ensure the callback is called with a random name and correct extension
      expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/^[a-f0-9]{32}\.jpg$/));
  
      // Ensure extname was called with the correct file original name
      expect(extname).toHaveBeenCalledWith('test.jpg');
    });

    it('should throw BadRequestException when micropost is not found', async () => {
      const micropostId = 1;

      microPostService.getCategoriesForMicropost.mockResolvedValue(null);

      await expect(microPostController.getCategories(micropostId)).rejects.toThrow(BadRequestException);
    });

    it('should return categories for a given micropost', async () => {
      const micropostId = 1;
      const mockCategories = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];
  
      // getCategoriesForMicropostが正しいカテゴリを返すようにモックする
      microPostService.getCategoriesForMicropost.mockResolvedValue(mockCategories);
  
      const result = await microPostController.getCategories(micropostId);
  
      // 期待されるカテゴリが返っていることを確認
      expect(result).toEqual(mockCategories);
      expect(microPostService.getCategoriesForMicropost).toHaveBeenCalledWith(micropostId);
    });
  
    it('should throw BadRequestException when micropost is not found', async () => {
      const micropostId = 1;
  
      // マイクロポストが見つからなかった場合
      microPostService.getCategoriesForMicropost.mockResolvedValue(null);
  
      await expect(microPostController.getCategories(micropostId)).rejects.toThrow(BadRequestException);
    });
  });
});
