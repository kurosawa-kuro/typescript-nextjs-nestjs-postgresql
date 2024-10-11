import {
  Injectable,
  Logger,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { UserCreationData } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    @Inject('DATABASE_POOL') private readonly pool: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const createUserDto: UserCreationData = {
        name,
        email,
        passwordHash,
        isAdmin: false,
      };
      await this.userService.create(createUserDto);
      return true;
    } catch (error) {
      this.logger.error('Registration failed', error);
      return false;
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: object }> {
    try {
      const user = await this.userService.findUserByEmail(email);

      if (user && (await bcrypt.compare(password, user.password_hash))) {
        const payload = {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          avatar_path: user.avatar_path,
        };
        const token = this.jwtService.sign(payload);
        this.logger.log(`User ${user.id} logged in`);
        return {
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar_path: user.avatar_path,
          },
        };
      } else {
        this.logger.error('Login failed', new Error('Incorrect credentials'));
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error) {
      this.logger.error('Login failed', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async logout(): Promise<boolean> {
    // Since we're using JWT, we don't need to do anything server-side for logout
    // The client should remove the token from the cookie
    this.logger.log('User logged out');
    return true;
  }
}
