// user.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body('name') name: string) {
    await this.userService.createUser(name);
    return { message: 'User created' };
  }

  @Get()
  async getUsers() {
    return await this.userService.getUsers();
  }
}