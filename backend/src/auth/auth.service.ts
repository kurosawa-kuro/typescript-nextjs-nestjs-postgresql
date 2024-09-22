import { Injectable, Logger, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
  ) {}

  async register(name: string, email: string, password: string): Promise<boolean> {
    try {
      await this.userService.create(name, email, password);
      return true;
    } catch (error) {
      this.logger.error('Registration failed', error);
      return false;
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.userService.authenticate(email, password);
      if (user) {
        this.logger.log(`User ${user.id} logged in`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Login failed', error);
      return false;
    }
  }

  async logout(): Promise<boolean> {
    this.logger.log('User logged out');
    return true;
  }
}
