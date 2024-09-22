import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostController } from './micropost.controller';
import { MicroPostService, MicroPost } from './micropost.service';
import { UserService, User } from '../user/user.service';
import { MicropostCategoryService } from '../micropost-category/micropost-category.service';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';

describe('MicroPostController', () => {
  let microPostController: MicroPostController;
  let microPostService: jest.Mocked<MicroPostService>;
  let userService: jest.Mocked<UserService>;
  let micropostCategoryService: jest.Mocked<MicropostCategoryService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const mockMicroPostService = {
      create: jest.fn(),
      index: jest.fn(),
    };
    const mockUserService = {
      find: jest.fn(),
    };
    const mockMicropostCategoryService = {
      categories: jest.fn(),
      add_category: jest.fn(),
    };
    mockLogger = {
      error: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicroPostController],
      providers: [
        { provide: MicroPostService, useValue: mockMicroPostService },
        { provide: UserService, useValue: mockUserService },
        { provide: MicropostCategoryService, useValue: mockMicropostCategoryService },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    microPostController = module.get<MicroPostController>(MicroPostController);
    microPostService = module.get(MicroPostService);
    userService = module.get(UserService);
    micropostCategoryService = module.get(MicropostCategoryService);
  });

  describe('create', () => {
    it('should create a micropost', async () => {
      const userId = 1;
      const title = 'Test Post';
      const file = { path: 'uploads/test.jpg' } as Express.Multer.File;

      const mockUser: User = { id: userId, name: 'TestUser', email: 'test@example.com', isAdmin: false };
      userService.find.mockResolvedValue(mockUser);

      const mockMicroPost: MicroPost = { id: 1, userId, title, userName: mockUser.name, imagePath: file.path };
      microPostService.create.mockResolvedValue(mockMicroPost);

      const result = await microPostController.create(userId, title, file);

      expect(result).toEqual({
        message: 'MicroPost created',
        micropost: mockMicroPost
      });
      expect(userService.find).toHaveBeenCalledWith(userId);
      expect(microPostService.create).toHaveBeenCalledWith(userId, title, file.path);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 1;
      const title = 'Test MicroPost';

      userService.find.mockResolvedValue(null);

      await expect(microPostController.create(userId, title)).rejects.toThrow(NotFoundException);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when micropost creation fails', async () => {
      const userId = 1;
      const title = 'Test MicroPost';

      const mockUser: User = { id: userId, name: 'TestUser', email: 'test@example.com', isAdmin: false };
      userService.find.mockResolvedValue(mockUser);
      microPostService.create.mockRejectedValue(new Error('Database error'));

      await expect(microPostController.create(userId, title)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('index', () => {
    it('should return an array of microposts', async () => {
      const mockMicroposts: MicroPost[] = [
        { id: 1, userId: 1, title: 'MicroPost 1', userName: 'User1', imagePath: 'path/to/image1.jpg' },
        { id: 2, userId: 2, title: 'MicroPost 2', userName: 'User2', imagePath: null },
      ];

      microPostService.index.mockResolvedValue(mockMicroposts);

      const result = await microPostController.index();

      expect(result).toEqual(mockMicroposts);
      expect(microPostService.index).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when getting microposts fails', async () => {
      microPostService.index.mockRejectedValue(new Error('Database error'));

      await expect(microPostController.index()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('categories', () => {
    it('should return categories for a micropost', async () => {
      const micropostId = '1';
      const mockCategories = [{ id: 1, name: 'Category 1' }, { id: 2, name: 'Category 2' }];

      micropostCategoryService.categories.mockResolvedValue(mockCategories);

      const result = await microPostController.categories(micropostId);

      expect(result).toEqual(mockCategories);
      expect(micropostCategoryService.categories).toHaveBeenCalledWith(1);
    });

    it('should throw InternalServerErrorException when getting categories fails', async () => {
      const micropostId = '1';

      micropostCategoryService.categories.mockRejectedValue(new Error('Database error'));

      await expect(microPostController.categories(micropostId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('add_category', () => {
    it('should add a category to a micropost', async () => {
      const micropostId = '1';
      const categoryId = 2;

      micropostCategoryService.add_category.mockResolvedValue(undefined);

      const result = await microPostController.add_category(micropostId, categoryId);

      expect(result).toEqual({ message: 'Category added to micropost' });
      expect(micropostCategoryService.add_category).toHaveBeenCalledWith(1, categoryId);
    });

    it('should throw InternalServerErrorException when adding category fails', async () => {
      const micropostId = '1';
      const categoryId = 2;

      micropostCategoryService.add_category.mockRejectedValue(new Error('Database error'));

      await expect(microPostController.add_category(micropostId, categoryId)).rejects.toThrow(InternalServerErrorException);
    });
  });
});