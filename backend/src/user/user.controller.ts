import { Controller, Get, Post, Body, BadRequestException, Logger } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('isAdmin') isAdmin: boolean
  ) {
    if (!name || !email || !password) {
      throw new BadRequestException('Name, email, and password are required');
    }
    const user = await this.userService.createUser(name, email, password, isAdmin);
    return { message: 'User created', user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } };
  }

  @Get()
  async getUsers() {
    this.logger.debug('getUsers method called');
    const users = await this.userService.getUsers();
    this.logger.debug(`Retrieved ${users.length} users`);
    return users.map(user => ({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }));
  }
}