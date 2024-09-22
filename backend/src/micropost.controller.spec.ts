import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostController } from './micropost.controller';
import { MicroPostService, MicroPost } from './micropost.service';
import { UserService } from './user.service';
import { MicropostCategoryService } from './micropost-category.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('MicroPostController', () => {
  let microPostController: MicroPostController;
  let microPostService: jest.Mocked<MicroPostService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockMicroPostService = {
      createMicroPost: jest.fn(),
      getMicroPosts: jest.fn(),
    };
    const mockUserService = {
      getUserById: jest.fn(),
    };
    const mockMicropostCategoryService = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicroPostController],
      providers: [
        { provide: MicroPostService, useValue: mockMicroPostService },
        { provide: UserService, useValue: mockUserService },
        { provide: MicropostCategoryService, useValue: mockMicropostCategoryService },
      ],
    }).compile();

    microPostController = module.get<MicroPostController>(MicroPostController);
    microPostService = module.get(MicroPostService);
    userService = module.get(UserService);
  });

  describe('createMicroPost', () => {
    it('should create a new micropost', async () => {
      const userId = 1;
      const title = 'Test MicroPost';
      const imagePath = 'path/to/image.jpg';
      const micropost: MicroPost = { id: 1, userId, title, userName: 'TestUser', imagePath };

      userService.getUserById.mockResolvedValue({ id: userId, name: 'TestUser' });
      microPostService.createMicroPost.mockResolvedValue(micropost);

      const result = await microPostController.createMicroPost(userId, title, { path: imagePath } as Express.Multer.File);

      expect(result).toEqual({
        message: 'MicroPost created',
        micropost: micropost
      });
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(microPostService.createMicroPost).toHaveBeenCalledWith(userId, title, imagePath);
    });

    it('should throw InternalServerErrorException when micropost creation fails', async () => {
      const userId = 1;
      const title = 'Test MicroPost';

      userService.getUserById.mockResolvedValue({ id: userId, name: 'TestUser' });
      microPostService.createMicroPost.mockRejectedValue(new Error('Database error'));

      await expect(microPostController.createMicroPost(userId, title)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getMicroPosts', () => {
    it('should return an array of microposts', async () => {
      const mockMicroposts: MicroPost[] = [
        { id: 1, userId: 1, title: 'MicroPost 1', userName: 'User1', imagePath: 'path/to/image1.jpg' },
        { id: 2, userId: 2, title: 'MicroPost 2', userName: 'User2', imagePath: null },
      ];

      microPostService.getMicroPosts.mockResolvedValue(mockMicroposts);

      const result = await microPostController.getMicroPosts();

      expect(result).toEqual(mockMicroposts);
      expect(microPostService.getMicroPosts).toHaveBeenCalled();
    });
  });
});