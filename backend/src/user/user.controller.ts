import { Controller, Get, Post, Body, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../database/database.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.name || !createUserDto.email || !createUserDto.password) {
      throw new BadRequestException('Name, email, and password are required');
    }
    const user = await this.userService.create(createUserDto);
    return { message: 'User created', user };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findUser(id);
  }

  @Get()
  async findAll() {
    return await this.userService.indexUsers();
  }
}