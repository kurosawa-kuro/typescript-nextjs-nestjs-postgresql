// user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            index: jest.fn().mockResolvedValue([{ id: 1, name: 'John Doe', email: 'john@example.com', isAdmin: false }]),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should create a user and return a success message', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', isAdmin: false };
    (userService.create as jest.Mock).mockResolvedValue(mockUser);

    const result = await userController.create('John Doe', 'john@example.com', 'password', false);
    expect(userService.create).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password', false);
    expect(result).toEqual({ message: 'User created', user: mockUser });
  });

  it('should throw BadRequestException if required fields are missing', async () => {
    await expect(userController.create('', '', '', false)).rejects.toThrow(BadRequestException);
  });

  it('should return an array of users', async () => {
    const result = await userController.index();
    expect(result).toEqual([{ id: 1, name: 'John Doe', email: 'john@example.com', isAdmin: false }]);
  });
});