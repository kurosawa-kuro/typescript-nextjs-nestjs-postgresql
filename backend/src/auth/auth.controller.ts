import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.authService.register(name, email, password);
    if (success) {
      return { success: true, message: 'Registration successful' };
    } else {
      return { success: false, message: 'Registration failed' };
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ success: boolean; message: string; token?: string }> {
    const result = await this.authService.login(email, password);
    if (result.success) {
      return {
        success: true,
        message: 'Login successful',
        token: result.token,
      };
    } else {
      return { success: false, message: 'Login failed' };
    }
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ success: boolean; message: string }> {
    const success = await this.authService.logout();
    if (success) {
      return { success: true, message: 'Successfully logged out' };
    } else {
      return { success: false, message: 'Logout failed' };
    }
  }
}
