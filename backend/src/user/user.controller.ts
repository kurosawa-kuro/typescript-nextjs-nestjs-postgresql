// src/user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { UserService, UserCreationData, CreateUserDto } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    if (
      !createUserDto.name ||
      !createUserDto.email ||
      !createUserDto.password
    ) {
      throw new BadRequestException('Name, email, and password are required');
    }

    try {
      const passwordHash = await this.userService.hashPassword(
        createUserDto.password,
      );
      const userCreationData: UserCreationData = {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash: passwordHash,
        isAdmin: false,
      };

      const user = await this.userService.create(userCreationData);
      console.log({ message: 'User created', user });
      return { message: 'User created', user };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new BadRequestException('Failed to create user');
    }
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.find(id);
    return user ? user : { message: 'User not found' };
  }

  @Get()
  async index() {
    return await this.userService.index();
  }
}
