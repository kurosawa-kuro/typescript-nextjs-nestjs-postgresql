import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { CreateUserDto, UserCreationData } from './user.service';

describe('UserController', () => {
    let userController: UserController;
    let userService: UserService;

    const mockUserService = {
        create: jest.fn(),
        index: jest.fn().mockResolvedValue([
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                isAdmin: false,
            },
        ]),
        find: jest.fn(),
        hashPassword: jest.fn(),
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
            mockUserService.hashPassword.mockResolvedValue('hashedPassword');
            mockUserService.create.mockResolvedValue(mockUser);

            const createUserDto: CreateUserDto = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password',
            };

            const result = await userController.create(createUserDto);
            expect(userService.hashPassword).toHaveBeenCalledWith(createUserDto.password);
            expect(userService.create).toHaveBeenCalledWith({
                name: createUserDto.name,
                email: createUserDto.email,
                passwordHash: 'hashedPassword',
                isAdmin: false,
                password: expect.any(Function),
            });
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
            expect(userService.index).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            const mockUser = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                isAdmin: false,
            };
            mockUserService.find.mockResolvedValue(mockUser);

            const result = await userController.findOne(1);
            expect(userService.find).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockUser);
        });

        it('should return not found message when user does not exist', async () => {
            mockUserService.find.mockResolvedValue(null);
            const result = await userController.findOne(1);
            expect(result).toEqual({ message: 'User not found' });
        });
    });
});
