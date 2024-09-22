import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string
  ): Promise<{ success: boolean }> {
    const success = await this.authService.register(name, email, password);
    return { success };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('email') email: string,
    @Body('password') password: string
  ): Promise<{ success: boolean }> {
    const success = await this.authService.login(email, password);
    return { success };
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ success: boolean }> {
    const success = await this.authService.logout();
    return { success };
  }
}
