import { Test, TestingModule } from '@nestjs/testing';
import { MicroPostController } from './micropost.controller';
import { MicroPostService } from './micropost.service';
import { UserService } from '../user/user.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('MicroPostController', () => {
  let microPostController: MicroPostController;
  let microPostService: jest.Mocked<MicroPostService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    microPostService = jest.mocked({
      create: jest.fn(),
      list: jest.fn(),
      databaseService: {} as any, // Mock the databaseService property
    } as unknown as MicroPostService);
    userService = {
      findUser: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicroPostController],
      providers: [
        { provide: MicroPostService, useValue: microPostService },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    microPostController = module.get<MicroPostController>(MicroPostController);
    microPostService = module.get(MicroPostService);
    userService = module.get(UserService);
  });

  describe('create', () => {
    it('should create a micropost', async () => {
      const userId = 1;
      const title = 'Test Post';
      const file = { path: 'uploads/test.jpg' } as Express.Multer.File;
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

      const result = await microPostController.create(userId, title, file);

      expect(result).toEqual(mockMicroPost);
      expect(userService.find).toHaveBeenCalledWith(userId);
      expect(microPostService.create).toHaveBeenCalledWith(userId, title, file.path);
    });

    it('should throw BadRequestException when title is missing', async () => {
      const userId = 1;
      const title = '';

      await expect(microPostController.create(userId, title)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when user is not found', async () => {
      const userId = 1;
      const title = 'Test MicroPost';

      userService.find.mockResolvedValue(null);

      await expect(microPostController.create(userId, title)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException when micropost creation fails', async () => {
      const userId = 1;
      const title = 'Test MicroPost';
      const mockUser = {
        id: userId,
        name: 'TestUser',
        email: 'test@example.com',
        isAdmin: false,
      };
      userService.find.mockResolvedValue(mockUser);
      microPostService.create.mockRejectedValue(new InternalServerErrorException('Database error'));

      await expect(microPostController.create(userId, title)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
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

      const result = await microPostController.findAll();

      expect(result).toEqual(mockMicroposts);
      expect(microPostService.list).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when getting microposts fails', async () => {
      microPostService.list.mockRejectedValue(new InternalServerErrorException('Database error'));

      await expect(microPostController.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
