import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostController } from './micropost.controller';
import { MicroPostService } from './micropost.service';
import { UserService } from '../user/user.service';
import { BadRequestException } from '@nestjs/common';

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
      const file = { path: 'uploads/test.png' } as Express.Multer.File;
      const mockUser = {
        id: userId,
        name: 'TestUser',
        email: 'test@example.com',
        isAdmin: false,
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
    it('should return categories for a given micropost', async () => {
      const micropostId = 1;
      const mockCategories = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      microPostService.getCategoriesForMicropost.mockResolvedValue(mockCategories);

      const result = await microPostController.getCategories(micropostId);

      expect(result).toEqual(mockCategories);
      expect(microPostService.getCategoriesForMicropost).toHaveBeenCalledWith(micropostId);
    });

    it('should throw BadRequestException when micropost is not found', async () => {
      const micropostId = 1;

      microPostService.getCategoriesForMicropost.mockResolvedValue(null);

      await expect(microPostController.getCategories(micropostId)).rejects.toThrow(BadRequestException);
    });
  });
});