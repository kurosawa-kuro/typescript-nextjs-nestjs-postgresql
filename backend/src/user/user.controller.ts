import { Controller, Get, Post, Body, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { UserService, UserCreationData, CreateUserDto } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.name || !createUserDto.email || !createUserDto.password) {
      throw new BadRequestException('Name, email, and password are required');
    }
    // 対応するUserCreationDataオブジェクトを作成
    const userCreationData: UserCreationData = {
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash: "await this.userService.hashPassword(createUserDto.password)",
      isAdmin: false // 適宜変更してください
      ,
      password: function (password: any): unknown {
        throw new Error('Function not implemented.');
      }
    };
    const user = await this.userService.create(userCreationData);
    return { message: 'User created', user };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.find(id);
    return user ? user : { message: 'User not found' };
  }

  @Get()
  async findAll() {
    return await this.userService.index();
  }
}
