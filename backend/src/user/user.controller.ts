import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';

interface UserDto {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('isAdmin') isAdmin: boolean,
  ): Promise<{ message: string; user: UserDto }> {
    this.validateUserInput(name, email, password);
    const user = await this.userService.create(name, email, password, isAdmin);
    return {
      message: 'User created',
      user: this.mapToUserDto(user),
    };
  }

  @Get()
  async index(): Promise<UserDto[]> {
    const users = await this.userService.index();
    return users.map(this.mapToUserDto);
  }

  private validateUserInput(name: string, email: string, password: string): void {
    if (!name || !email || !password) {
      throw new BadRequestException('Name, email, and password are required');
    }
  }

  private mapToUserDto(user: any): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };
  }
}