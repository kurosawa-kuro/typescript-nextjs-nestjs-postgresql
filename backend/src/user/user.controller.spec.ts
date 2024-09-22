import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../database/database.service';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn(),
    listUsers: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        isAdmin: false,
      },
    ]),
  };

  const setupTestingModule = async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await setupTestingModule();
  });

  describe('create', () => {
    it('should create a user and return a success message', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        isAdmin: false,
      };
      (userService.create as jest.Mock).mockResolvedValue(mockUser);

      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
      };

      const result = await userController.create(createUserDto);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({ message: 'User created', user: mockUser });
    });

    it('should throw BadRequestException if required fields are missing', async () => {
      const invalidUserDto: CreateUserDto = {
        name: '',
        email: '',
        password: '',
      };
      await expect(userController.create(invalidUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await userController.findAll();
      expect(result).toEqual([
        { id: 1, name: 'John Doe', email: 'john@example.com', isAdmin: false },
      ]);
    });
  });
});