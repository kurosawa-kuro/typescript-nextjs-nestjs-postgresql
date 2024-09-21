import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { MicroPostController } from './micropost.controller';
import { UserService } from './user.service';
import { MicroPostService } from './micropost.service';

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
            createUser: jest.fn(),
            getUsers: jest.fn().mockResolvedValue([{ id: 1, name: 'John Doe' }]),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should create a user and return a success message', async () => {
    const result = await userController.createUser('John Doe');
    expect(userService.createUser).toHaveBeenCalledWith('John Doe');
    expect(result).toEqual({ message: 'User created' });
  });

  it('should return an array of users', async () => {
    const result = await userController.getUsers();
    expect(result).toEqual([{ id: 1, name: 'John Doe' }]);
  });
});
