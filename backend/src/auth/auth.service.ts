import { Injectable, Logger, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { CreateUserDto, UserCreationData } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    @Inject('DATABASE_POOL') private readonly pool: Pool,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const createUserDto: UserCreationData = {
        name, email, passwordHash, isAdmin: false,
      };
      await this.userService.create(createUserDto);
      return true;
    } catch (error) {
      this.logger.error('Registration failed', error);
      return false;
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; token?: string; user?: object }> {
    try {
      const query =
        'SELECT id, name, email, password_hash, is_admin as "isAdmin" FROM "user" WHERE email = $1';
      const result = await this.pool.query(query, [email]);
      const user = result.rows[0];

      if (user && (await bcrypt.compare(password, user.password_hash))) {
        this.logger.log(`User ${user.id} logged in`);
        return {
          success: true,
          token: 'placeholder-token',
          user: { id: user.id, name: user.name, email: user.email },
        };
      } else {
        this.logger.error('Login failed', new Error('Incorrect credentials'));
        return { success: false };
      }
    } catch (error) {
      this.logger.error('Login failed', error);
      return { success: false };
    }
  }

  async logout(): Promise<boolean> {
    this.logger.log('User logged out');
    return true;
  }
}