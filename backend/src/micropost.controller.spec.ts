import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostController } from './micropost.controller';
import { MicroPostService } from './micropost.service';
import { UserService } from './user.service';
import { MicropostCategoryService } from './micropost-category.service';
import { NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';

describe('MicroPostController', () => {
  let microPostController: MicroPostController;
  let microPostService: jest.Mocked<MicroPostService>;
  let userService: jest.Mocked<UserService>;
  let micropostCategoryService: jest.Mocked<MicropostCategoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicroPostController],
      providers: [
        {
          provide: MicroPostService,
          useValue: {
            createMicroPost: jest.fn(),
            getMicroPosts: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
        {
          provide: MicropostCategoryService,
          useValue: {
            getMicropostCategories: jest.fn(),
            addCategoryToMicropost: jest.fn(),
          },
        },
      ],
    }).compile();

    microPostController = module.get<MicroPostController>(MicroPostController);
    microPostService = module.get(MicroPostService);
    userService = module.get(UserService);
    micropostCategoryService = module.get(MicropostCategoryService);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {}); // ロガーのモック
  });

  describe('createMicroPost', () => {
    it('should create a microPost and return a success message', async () => {
      const userId = 1;
      const title = 'My first micropost';
      const micropost = { id: 1, userId, title };

      userService.getUserById.mockResolvedValue({ id: userId, name: 'Test User' });
      microPostService.createMicroPost.mockResolvedValue(micropost);

      const result = await microPostController.createMicroPost(userId, title);
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(microPostService.createMicroPost).toHaveBeenCalledWith(userId, title);
      expect(result).toEqual({ message: 'MicroPost created', micropost });
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 999;
      const title = 'My first micropost';

      userService.getUserById.mockResolvedValue(null);

      await expect(microPostController.createMicroPost(userId, title)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user does not exist (foreign key constraint)', async () => {
      const userId = 1;
      const title = 'My first micropost';

      userService.getUserById.mockResolvedValue({ id: userId, name: 'Test User' });
      microPostService.createMicroPost.mockRejectedValue({ constraint: 'micropost_user_id_fkey' });

      await expect(microPostController.createMicroPost(userId, title)).rejects.toThrow(BadRequestException);
      await expect(microPostController.createMicroPost(userId, title)).rejects.toThrow(`User with id ${userId} does not exist`);
    });

    it('should throw InternalServerErrorException when micropost creation fails', async () => {
      const userId = 1;
      const title = 'My first micropost';

      userService.getUserById.mockResolvedValue({ id: userId, name: 'Test User' });
      microPostService.createMicroPost.mockRejectedValue(new Error('Database error'));

      await expect(microPostController.createMicroPost(userId, title)).rejects.toThrow(InternalServerErrorException);
      await expect(microPostController.createMicroPost(userId, title)).rejects.toThrow('Failed to create micropost');
    });
  });

  describe('getMicroPosts', () => {
    it('should return an array of microPosts', async () => {
      const mockMicroposts = [{ id: 1, userId: 1, title: 'My first micropost' }];
      microPostService.getMicroPosts.mockResolvedValue(mockMicroposts);

      const result = await microPostController.getMicroPosts();
      expect(result).toEqual(mockMicroposts);
    });

    it('should throw InternalServerErrorException when getting microposts fails', async () => {
      microPostService.getMicroPosts.mockRejectedValue(new Error('Database error'));

      await expect(microPostController.getMicroPosts()).rejects.toThrow(InternalServerErrorException);
      await expect(microPostController.getMicroPosts()).rejects.toThrow('Failed to get microposts');
    });
  });

  describe('getMicropostCategories', () => {
    it('should return categories for a given micropost', async () => {
      const micropostId = '1';
      const mockCategories = [{ id: 1, title: 'Category 1' }];
      micropostCategoryService.getMicropostCategories.mockResolvedValue(mockCategories);

      const result = await microPostController.getMicropostCategories(micropostId);
      expect(micropostCategoryService.getMicropostCategories).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCategories);
    });

    it('should throw InternalServerErrorException when getting categories fails', async () => {
      const micropostId = '1';
      micropostCategoryService.getMicropostCategories.mockRejectedValue(new Error('Database error'));

      await expect(microPostController.getMicropostCategories(micropostId)).rejects.toThrow(InternalServerErrorException);
      await expect(microPostController.getMicropostCategories(micropostId)).rejects.toThrow('Failed to get categories for micropost');
    });
  });

  describe('addCategoryToMicropost', () => {
    it('should add a category to a micropost and return a success message', async () => {
      const micropostId = '1';
      const categoryId = 1;
      micropostCategoryService.addCategoryToMicropost.mockResolvedValue(undefined);

      const result = await microPostController.addCategoryToMicropost(micropostId, categoryId);
      expect(micropostCategoryService.addCategoryToMicropost).toHaveBeenCalledWith(1, categoryId);
      expect(result).toEqual({ message: 'Category added to micropost' });
    });

    it('should throw InternalServerErrorException when adding category fails', async () => {
      const micropostId = '1';
      const categoryId = 1;
      micropostCategoryService.addCategoryToMicropost.mockRejectedValue(new Error('Database error'));

      await expect(microPostController.addCategoryToMicropost(micropostId, categoryId)).rejects.toThrow(InternalServerErrorException);
      await expect(microPostController.addCategoryToMicropost(micropostId, categoryId)).rejects.toThrow('Failed to add category to micropost');
    });
  });
});